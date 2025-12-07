import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Trade } from '@/lib/db';
import TradeCard from '@/components/trades/TradeCard';
import TradeDialog from '@/components/trades/TradeDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlusCircle, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { TRADING_SESSIONS, SETUP_TAGS, EMOTIONS, ALL_INSTRUMENTS } from '@/lib/calculator';

const Journal: React.FC = () => {
  const { trades, selectedAccount, getTradesForAccount, addTrade, updateTrade, deleteTrade } = useApp();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [pairFilter, setPairFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [setupFilter, setSetupFilter] = useState('all');
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');

  const accountTrades = selectedAccount 
    ? getTradesForAccount(selectedAccount.id) 
    : trades;

  // Get unique pairs from trades
  const uniquePairs = useMemo(() => {
    const pairs = [...new Set(accountTrades.map(t => t.pair))];
    return pairs.sort();
  }, [accountTrades]);

  // Filtered trades
  const filteredTrades = useMemo(() => {
    return accountTrades
      .filter(trade => {
        if (searchQuery && !trade.pair.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !trade.notes.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        if (pairFilter !== 'all' && trade.pair !== pairFilter) return false;
        if (sessionFilter !== 'all' && trade.session !== sessionFilter) return false;
        if (setupFilter !== 'all' && trade.setupTag !== setupFilter) return false;
        if (emotionFilter !== 'all' && trade.emotion !== emotionFilter) return false;
        if (resultFilter !== 'all' && trade.result !== resultFilter) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [accountTrades, searchQuery, pairFilter, sessionFilter, setupFilter, emotionFilter, resultFilter]);

  const handleAddTrade = () => {
    setEditingTrade(null);
    setDialogOpen(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setDialogOpen(true);
  };

  const handleDeleteTrade = (id: string) => {
    setTradeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (tradeToDelete) {
      await deleteTrade(tradeToDelete);
      setTradeToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleSave = async (trade: Trade) => {
    if (editingTrade) {
      await updateTrade(trade);
    } else {
      await addTrade(trade);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPairFilter('all');
    setSessionFilter('all');
    setSetupFilter('all');
    setEmotionFilter('all');
    setResultFilter('all');
  };

  const hasActiveFilters = searchQuery || pairFilter !== 'all' || sessionFilter !== 'all' || 
    setupFilter !== 'all' || emotionFilter !== 'all' || resultFilter !== 'all';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trading Journal</h1>
          <p className="text-muted-foreground">
            {filteredTrades.length} trade{filteredTrades.length !== 1 ? 's' : ''} 
            {hasActiveFilters && ` (filtered from ${accountTrades.length})`}
          </p>
        </div>
        
        <Button onClick={handleAddTrade}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Trade
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by pair or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select value={pairFilter} onValueChange={setPairFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Pair" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pairs</SelectItem>
                {uniquePairs.map(pair => (
                  <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sessionFilter} onValueChange={setSessionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                {TRADING_SESSIONS.map(session => (
                  <SelectItem key={session} value={session}>{session}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={setupFilter} onValueChange={setSetupFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Setup" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Setups</SelectItem>
                {SETUP_TAGS.map(setup => (
                  <SelectItem key={setup} value={setup}>{setup}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={emotionFilter} onValueChange={setEmotionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Emotion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Emotions</SelectItem>
                {EMOTIONS.map(emotion => (
                  <SelectItem key={emotion} value={emotion}>{emotion}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="Win">Win</SelectItem>
                <SelectItem value="Loss">Loss</SelectItem>
                <SelectItem value="BE">Breakeven</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  Clear
                </Button>
              )}
              <div className="flex border border-border rounded-md">
                <Button 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trades List */}
      {filteredTrades.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters 
                ? 'No trades match your filters' 
                : 'No trades yet. Add your first trade to get started!'}
            </p>
            {!hasActiveFilters && (
              <Button onClick={handleAddTrade}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Trade
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredTrades.map(trade => (
            <TradeCard
              key={trade.id}
              trade={trade}
              onEdit={handleEditTrade}
              onDelete={handleDeleteTrade}
              compact
            />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrades.map(trade => (
            <TradeCard
              key={trade.id}
              trade={trade}
              onEdit={handleEditTrade}
              onDelete={handleDeleteTrade}
            />
          ))}
        </div>
      )}

      {/* Trade Dialog */}
      <TradeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trade={editingTrade}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Journal;
