import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Account, 
  Trade, 
  DailyNote, 
  Settings,
  initDB,
  initializeSettings,
  getAllItems,
  getItem,
  addItem,
  updateItem,
  deleteItem,
  getItemsByIndex
} from '@/lib/db';

interface AppContextType {
  // Settings
  settings: Settings | null;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  // Accounts
  accounts: Account[];
  selectedAccount: Account | null;
  selectAccount: (accountId: string) => void;
  addAccount: (account: Account) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  
  // Trades
  trades: Trade[];
  getTradesForAccount: (accountId: string) => Trade[];
  addTrade: (trade: Trade) => Promise<void>;
  updateTrade: (trade: Trade) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  
  // Daily Notes
  dailyNotes: DailyNote[];
  addDailyNote: (note: DailyNote) => Promise<void>;
  updateDailyNote: (note: DailyNote) => Promise<void>;
  deleteDailyNote: (id: string) => Promise<void>;
  
  // Data loading
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const theme = settings?.theme || 'dark';

  // Initialize database and load data
  useEffect(() => {
    const init = async () => {
      try {
        await initDB();
        const loadedSettings = await initializeSettings();
        setSettings(loadedSettings);
        
        // Apply theme
        if (loadedSettings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        await refreshData();
        
        // Set selected account
        if (loadedSettings.selectedAccountId) {
          const account = await getItem<Account>('accounts', loadedSettings.selectedAccountId);
          if (account) {
            setSelectedAccount(account);
          }
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const refreshData = async () => {
    const [loadedAccounts, loadedTrades, loadedNotes] = await Promise.all([
      getAllItems<Account>('accounts'),
      getAllItems<Trade>('trades'),
      getAllItems<DailyNote>('dailyNotes'),
    ]);
    
    setAccounts(loadedAccounts);
    setTrades(loadedTrades);
    setDailyNotes(loadedNotes);
    
    // Update selected account if it exists
    if (selectedAccount) {
      const updated = loadedAccounts.find(a => a.id === selectedAccount.id);
      if (updated) {
        setSelectedAccount(updated);
      }
    }
  };

  const toggleTheme = async () => {
    if (!settings) return;
    
    const newTheme: 'dark' | 'light' = theme === 'dark' ? 'light' : 'dark';
    const updatedSettings: Settings = { ...settings, theme: newTheme };
    
    await updateItem('settings', updatedSettings);
    setSettings(updatedSettings);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const selectAccount = async (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account && settings) {
      setSelectedAccount(account);
      const updatedSettings: Settings = { ...settings, selectedAccountId: accountId };
      await updateItem('settings', updatedSettings);
      setSettings(updatedSettings);
    }
  };

  // Account operations
  const handleAddAccount = async (account: Account) => {
    await addItem('accounts', account);
    await refreshData();
    
    // If this is the first account, select it
    if (accounts.length === 0) {
      await selectAccount(account.id);
    }
  };

  const handleUpdateAccount = async (account: Account) => {
    await updateItem('accounts', account);
    await refreshData();
  };

  const handleDeleteAccount = async (id: string) => {
    await deleteItem('accounts', id);
    
    // If deleting selected account, clear selection
    if (selectedAccount?.id === id) {
      setSelectedAccount(null);
      if (settings) {
        const updatedSettings = { ...settings, selectedAccountId: null };
        await updateItem('settings', updatedSettings);
        setSettings(updatedSettings);
      }
    }
    
    await refreshData();
  };

  // Trade operations
  const getTradesForAccount = (accountId: string) => {
    return trades.filter(t => t.accountId === accountId);
  };

  const handleAddTrade = async (trade: Trade) => {
    await addItem('trades', trade);
    
    // Update account balance
    const account = accounts.find(a => a.id === trade.accountId);
    if (account) {
      const balanceChange = trade.result === 'Win' 
        ? trade.rewardAmount 
        : trade.result === 'Loss' 
          ? -trade.riskAmount 
          : 0;
      
      const updatedAccount = {
        ...account,
        currentBalance: account.currentBalance + balanceChange
      };
      await updateItem('accounts', updatedAccount);
    }
    
    await refreshData();
  };

  const handleUpdateTrade = async (trade: Trade) => {
    await updateItem('trades', trade);
    await refreshData();
  };

  const handleDeleteTrade = async (id: string) => {
    await deleteItem('trades', id);
    await refreshData();
  };

  // Daily note operations
  const handleAddDailyNote = async (note: DailyNote) => {
    await addItem('dailyNotes', note);
    await refreshData();
  };

  const handleUpdateDailyNote = async (note: DailyNote) => {
    await updateItem('dailyNotes', note);
    await refreshData();
  };

  const handleDeleteDailyNote = async (id: string) => {
    await deleteItem('dailyNotes', id);
    await refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        theme,
        toggleTheme,
        accounts,
        selectedAccount,
        selectAccount,
        addAccount: handleAddAccount,
        updateAccount: handleUpdateAccount,
        deleteAccount: handleDeleteAccount,
        trades,
        getTradesForAccount,
        addTrade: handleAddTrade,
        updateTrade: handleUpdateTrade,
        deleteTrade: handleDeleteTrade,
        dailyNotes,
        addDailyNote: handleAddDailyNote,
        updateDailyNote: handleUpdateDailyNote,
        deleteDailyNote: handleDeleteDailyNote,
        isLoading,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
