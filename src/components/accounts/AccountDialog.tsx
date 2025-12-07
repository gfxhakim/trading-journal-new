import React, { useState, useEffect } from 'react';
import { Account } from '@/lib/db';
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
import { toast } from '@/hooks/use-toast';

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
  onSave: (account: Account) => Promise<void>;
}

const ACCOUNT_TYPES = ['Prop Firm', 'Live', 'Demo', 'Personal'] as const;
const CURRENCIES = ['$', '€', '£', '¥', 'CHF', 'AUD', 'CAD'];

const AccountDialog: React.FC<AccountDialogProps> = ({ open, onOpenChange, account, onSave }) => {
  const isEditing = !!account;
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Demo' as Account['type'],
    startingBalance: '',
    currentBalance: '',
    currency: '$',
    notes: '',
  });

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        startingBalance: String(account.startingBalance),
        currentBalance: String(account.currentBalance),
        currency: account.currency,
        notes: account.notes,
      });
    } else {
      setFormData({
        name: '',
        type: 'Demo',
        startingBalance: '',
        currentBalance: '',
        currency: '$',
        notes: '',
      });
    }
  }, [account, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startingBalance) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const startingBalance = parseFloat(formData.startingBalance);
    const currentBalance = formData.currentBalance 
      ? parseFloat(formData.currentBalance) 
      : startingBalance;

    const accountData: Account = {
      id: account?.id || crypto.randomUUID(),
      name: formData.name,
      type: formData.type,
      startingBalance,
      currentBalance,
      currency: formData.currency,
      notes: formData.notes,
      createdAt: account?.createdAt || new Date(),
    };

    await onSave(accountData);
    onOpenChange(false);
    
    toast({
      title: isEditing ? "Account updated" : "Account created",
      description: formData.name,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Account' : 'Add New Account'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Account Name</Label>
            <Input
              placeholder="e.g., FTMO Challenge, Personal Account"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: Account['type']) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label>Starting Balance</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="10000"
                value={formData.startingBalance}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  startingBalance: e.target.value,
                  currentBalance: prev.currentBalance || e.target.value 
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Balance {!isEditing && "(optional - defaults to starting)"}</Label>
            <Input
              type="number"
              step="0.01"
              placeholder={formData.startingBalance || "10000"}
              value={formData.currentBalance}
              onChange={(e) => setFormData(prev => ({ ...prev, currentBalance: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Account notes, broker info, etc..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Account' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDialog;
