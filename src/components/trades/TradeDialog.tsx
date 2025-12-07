import React, { useState, useEffect } from 'react';
import { Trade } from '@/lib/db';
import { useApp } from '@/contexts/AppContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TRADING_SESSIONS, SETUP_TAGS, EMOTIONS, ALL_INSTRUMENTS } from '@/lib/calculator';
import { toast } from '@/hooks/use-toast';

interface TradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade?: Trade | null;
  onSave: (trade: Trade) => Promise<void>;
}

const TradeDialog: React.FC<TradeDialogProps> = ({ open, onOpenChange, trade, onSave }) => {
  const { selectedAccount, accounts } = useApp();
  const isEditing = !!trade;
  
  const [formData, setFormData] = useState({
    accountId: selectedAccount?.id || '',
    date: new Date().toISOString().split('T')[0],
    pair: '',
    direction: 'Buy' as 'Buy' | 'Sell',
    entry: '',
    stopLoss: '',
    takeProfit: '',
    exitPrice: '',
    result: 'Win' as 'Win' | 'Loss' | 'BE',
    riskPercent: '1',
    session: 'London',
    setupTag: 'Breakout',
    emotion: 'Calm',
    disciplineRating: 3,
    notes: '',
    screenshot: null as string | null,
  });

  useEffect(() => {
    if (trade) {
      setFormData({
        accountId: trade.accountId,
        date: new Date(trade.date).toISOString().split('T')[0],
        pair: trade.pair,
        direction: trade.direction,
        entry: String(trade.entry),
        stopLoss: String(trade.stopLoss),
        takeProfit: String(trade.takeProfit),
        exitPrice: String(trade.exitPrice),
        result: trade.result,
        riskPercent: String(trade.riskPercent),
        session: trade.session,
        setupTag: trade.setupTag,
        emotion: trade.emotion,
        disciplineRating: trade.disciplineRating,
        notes: trade.notes,
        screenshot: trade.screenshot,
      });
    } else {
      setFormData(prev => ({
        ...prev,
        accountId: selectedAccount?.id || '',
        date: new Date().toISOString().split('T')[0],
        pair: '',
        direction: 'Buy',
        entry: '',
        stopLoss: '',
        takeProfit: '',
        exitPrice: '',
        result: 'Win',
        riskPercent: '1',
        session: 'London',
        setupTag: 'Breakout',
        emotion: 'Calm',
        disciplineRating: 3,
        notes: '',
        screenshot: null,
      }));
    }
  }, [trade, selectedAccount, open]);

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, screenshot: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateTradeMetrics = () => {
    const entry = parseFloat(formData.entry) || 0;
    const stopLoss = parseFloat(formData.stopLoss) || 0;
    const exitPrice = parseFloat(formData.exitPrice) || 0;
    const riskPercent = parseFloat(formData.riskPercent) || 1;
    
    const account = accounts.find(a => a.id === formData.accountId);
    const balance = account?.currentBalance || 10000;
    
    const riskAmount = (balance * riskPercent) / 100;
    const riskPips = Math.abs(entry - stopLoss);
    
    let rMultiple = 0;
    let rewardAmount = 0;
    
    if (formData.result === 'Win') {
      const rewardPips = Math.abs(exitPrice - entry);
      rMultiple = riskPips > 0 ? rewardPips / riskPips : 0;
      rewardAmount = rMultiple * riskAmount;
    } else if (formData.result === 'Loss') {
      const lossPips = Math.abs(exitPrice - entry);
      rMultiple = riskPips > 0 ? -(lossPips / riskPips) : -1;
      rewardAmount = 0;
    } else {
      rMultiple = 0;
      rewardAmount = 0;
    }

    return { riskAmount, rMultiple, rewardAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId) {
      toast({
        title: "Error",
        description: "Please select an account first",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.pair || !formData.entry || !formData.stopLoss || !formData.exitPrice) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const { riskAmount, rMultiple, rewardAmount } = calculateTradeMetrics();

    const tradeData: Trade = {
      id: trade?.id || crypto.randomUUID(),
      accountId: formData.accountId,
      date: new Date(formData.date),
      pair: formData.pair,
      direction: formData.direction,
      entry: parseFloat(formData.entry),
      stopLoss: parseFloat(formData.stopLoss),
      takeProfit: parseFloat(formData.takeProfit) || 0,
      exitPrice: parseFloat(formData.exitPrice),
      result: formData.result,
      rMultiple,
      riskPercent: parseFloat(formData.riskPercent),
      riskAmount,
      rewardAmount,
      session: formData.session as Trade['session'],
      setupTag: formData.setupTag,
      emotion: formData.emotion as Trade['emotion'],
      disciplineRating: formData.disciplineRating,
      screenshot: formData.screenshot,
      notes: formData.notes,
      createdAt: trade?.createdAt || new Date(),
    };

    await onSave(tradeData);
    onOpenChange(false);
    
    toast({
      title: isEditing ? "Trade updated" : "Trade added",
      description: `${formData.pair} ${formData.direction} - ${formData.result}`,
    });
  };

  const renderStarRating = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, disciplineRating: star }))}
            className="focus:outline-none"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                star <= formData.disciplineRating 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-muted hover:text-yellow-400"
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Trade' : 'Add New Trade'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account</Label>
              <Select 
                value={formData.accountId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, accountId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>

          {/* Pair & Direction */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pair / Instrument</Label>
              <Select 
                value={formData.pair} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, pair: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pair" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {ALL_INSTRUMENTS.map((pair) => (
                    <SelectItem key={pair} value={pair}>
                      {pair}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select 
                value={formData.direction} 
                onValueChange={(value: 'Buy' | 'Sell') => setFormData(prev => ({ ...prev, direction: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy (Long)</SelectItem>
                  <SelectItem value="Sell">Sell (Short)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Entries */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Entry Price</Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.entry}
                onChange={(e) => setFormData(prev => ({ ...prev, entry: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Stop Loss</Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.stopLoss}
                onChange={(e) => setFormData(prev => ({ ...prev, stopLoss: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Take Profit</Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.takeProfit}
                onChange={(e) => setFormData(prev => ({ ...prev, takeProfit: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Exit Price</Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                value={formData.exitPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, exitPrice: e.target.value }))}
              />
            </div>
          </div>

          {/* Result & Risk */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Result</Label>
              <Select 
                value={formData.result} 
                onValueChange={(value: 'Win' | 'Loss' | 'BE') => setFormData(prev => ({ ...prev, result: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Win">Win</SelectItem>
                  <SelectItem value="Loss">Loss</SelectItem>
                  <SelectItem value="BE">Breakeven</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Risk %</Label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={formData.riskPercent}
                onChange={(e) => setFormData(prev => ({ ...prev, riskPercent: e.target.value }))}
              />
            </div>
          </div>

          {/* Session & Setup */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trading Session</Label>
              <Select 
                value={formData.session} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, session: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRADING_SESSIONS.map((session) => (
                    <SelectItem key={session} value={session}>
                      {session}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Setup Tag</Label>
              <Select 
                value={formData.setupTag} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, setupTag: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SETUP_TAGS.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Emotion & Discipline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Emotion</Label>
              <Select 
                value={formData.emotion} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, emotion: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMOTIONS.map((emotion) => (
                    <SelectItem key={emotion} value={emotion}>
                      {emotion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Discipline Rating</Label>
              {renderStarRating()}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Trade notes, observations, lessons learned..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Screenshot */}
          <div className="space-y-2">
            <Label>Screenshot</Label>
            {formData.screenshot ? (
              <div className="relative">
                <img 
                  src={formData.screenshot} 
                  alt="Trade screenshot" 
                  className="rounded-lg max-h-48 w-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setFormData(prev => ({ ...prev, screenshot: null }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleScreenshotUpload}
                />
              </label>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Trade' : 'Add Trade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TradeDialog;
