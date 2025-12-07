import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Account } from '@/lib/db';
import { calculateStats } from '@/lib/analytics';
import AccountDialog from '@/components/accounts/AccountDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Accounts: React.FC = () => {
  const { 
    accounts, 
    selectedAccount, 
    selectAccount, 
    addAccount, 
    updateAccount, 
    deleteAccount,
    getTradesForAccount 
  } = useApp();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const handleAddAccount = () => {
    setEditingAccount(null);
    setDialogOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setDialogOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    setAccountToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (accountToDelete) {
      await deleteAccount(accountToDelete);
      setAccountToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleSave = async (account: Account) => {
    if (editingAccount) {
      await updateAccount(account);
    } else {
      await addAccount(account);
    }
  };

  const getAccountTypeColor = (type: Account['type']) => {
    switch (type) {
      case 'Live': return 'bg-green-500';
      case 'Demo': return 'bg-blue-500';
      case 'Prop Firm': return 'bg-purple-500';
      case 'Personal': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trading Accounts</h1>
          <p className="text-muted-foreground">
            Manage your trading accounts and view individual performance
          </p>
        </div>
        
        <Button onClick={handleAddAccount}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No accounts yet. Create your first trading account to get started!
            </p>
            <Button onClick={handleAddAccount}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => {
            const trades = getTradesForAccount(account.id);
            const stats = calculateStats(trades);
            const profitLoss = account.currentBalance - account.startingBalance;
            const profitPercent = ((profitLoss / account.startingBalance) * 100);
            const isSelected = selectedAccount?.id === account.id;
            const isProfitable = profitLoss >= 0;

            return (
              <Card 
                key={account.id} 
                className={cn(
                  "relative overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-lg",
                  isSelected && "ring-2 ring-primary"
                )}
                onClick={() => selectAccount(account.id)}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full mt-1.5",
                      getAccountTypeColor(account.type)
                    )} />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {account.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Balances */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Starting</span>
                      <span>{account.currency}{account.startingBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current</span>
                      <span className="font-bold text-lg">
                        {account.currency}{account.currentBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className={cn(
                      "flex items-center justify-between p-2 rounded-lg",
                      isProfitable ? "bg-green-500/10" : "bg-red-500/10"
                    )}>
                      <span className="text-sm">P&L</span>
                      <div className="flex items-center gap-2">
                        {isProfitable ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={cn(
                          "font-semibold",
                          isProfitable ? "text-green-500" : "text-red-500"
                        )}>
                          {isProfitable ? '+' : ''}{account.currency}{profitLoss.toLocaleString()}
                          {' '}({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <div className="text-lg font-bold">{trades.length}</div>
                      <div className="text-xs text-muted-foreground">Trades</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <div className="text-lg font-bold">{stats.winRate.toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <div className={cn(
                        "text-lg font-bold",
                        stats.avgR >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {stats.avgR >= 0 ? '+' : ''}{stats.avgR.toFixed(2)}R
                      </div>
                      <div className="text-xs text-muted-foreground">Avg R</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAccount(account);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAccount(account.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {account.notes && (
                    <p className="text-xs text-muted-foreground border-t border-border pt-2">
                      {account.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Account Dialog */}
      <AccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={editingAccount}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? All trades associated with this account will remain in the database but will no longer be linked to any account.
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

export default Accounts;
