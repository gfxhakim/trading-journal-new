// IndexedDB Database wrapper for Trading Journal

const DB_NAME = 'TradingJournalDB';
const DB_VERSION = 1;

export interface Account {
  id: string;
  name: string;
  type: 'Prop Firm' | 'Live' | 'Demo' | 'Personal';
  startingBalance: number;
  currentBalance: number;
  currency: string;
  notes: string;
  createdAt: Date;
}

export interface Trade {
  id: string;
  accountId: string;
  date: Date;
  pair: string;
  direction: 'Buy' | 'Sell';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  exitPrice: number;
  result: 'Win' | 'Loss' | 'BE';
  rMultiple: number;
  riskPercent: number;
  riskAmount: number;
  rewardAmount: number;
  session: 'Asian' | 'London' | 'NY' | 'Pre-NY' | 'Post-NY';
  setupTag: string;
  emotion: 'Calm' | 'Fear' | 'Greed' | 'Impulsive' | 'Overconfident' | 'Disciplined';
  disciplineRating: number;
  screenshot: string | null;
  notes: string;
  createdAt: Date;
}

export interface DailyNote {
  id: string;
  date: Date;
  dailySummary: string;
  mistakes: string;
  lessons: string;
  planForTomorrow: string;
}

export interface Settings {
  id: string;
  theme: 'dark' | 'light';
  selectedAccountId: string | null;
}

let db: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create Accounts store
      if (!database.objectStoreNames.contains('accounts')) {
        database.createObjectStore('accounts', { keyPath: 'id' });
      }

      // Create Trades store
      if (!database.objectStoreNames.contains('trades')) {
        const tradesStore = database.createObjectStore('trades', { keyPath: 'id' });
        tradesStore.createIndex('accountId', 'accountId', { unique: false });
        tradesStore.createIndex('date', 'date', { unique: false });
      }

      // Create DailyNotes store
      if (!database.objectStoreNames.contains('dailyNotes')) {
        const notesStore = database.createObjectStore('dailyNotes', { keyPath: 'id' });
        notesStore.createIndex('date', 'date', { unique: false });
      }

      // Create Settings store
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'id' });
      }
    };
  });
};

// Generic CRUD operations
export const addItem = <T>(storeName: string, item: T): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    const database = await initDB();
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
};

export const updateItem = <T>(storeName: string, item: T): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    const database = await initDB();
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
};

export const deleteItem = (storeName: string, id: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const database = await initDB();
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getItem = <T>(storeName: string, id: string): Promise<T | undefined> => {
  return new Promise(async (resolve, reject) => {
    const database = await initDB();
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllItems = <T>(storeName: string): Promise<T[]> => {
  return new Promise(async (resolve, reject) => {
    const database = await initDB();
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getItemsByIndex = <T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> => {
  return new Promise(async (resolve, reject) => {
    const database = await initDB();
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Backup & Restore functions
export const exportAllData = async (): Promise<string> => {
  const accounts = await getAllItems<Account>('accounts');
  const trades = await getAllItems<Trade>('trades');
  const dailyNotes = await getAllItems<DailyNote>('dailyNotes');
  const settings = await getAllItems<Settings>('settings');

  const data = {
    version: DB_VERSION,
    exportDate: new Date().toISOString(),
    accounts,
    trades,
    dailyNotes,
    settings,
  };

  return JSON.stringify(data, null, 2);
};

export const importAllData = async (jsonData: string, merge: boolean = false): Promise<void> => {
  const data = JSON.parse(jsonData);
  const database = await initDB();

  if (!merge) {
    // Clear all stores
    const stores = ['accounts', 'trades', 'dailyNotes', 'settings'];
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  // Import all data
  if (data.accounts) {
    for (const account of data.accounts) {
      account.createdAt = new Date(account.createdAt);
      await updateItem('accounts', account);
    }
  }

  if (data.trades) {
    for (const trade of data.trades) {
      trade.date = new Date(trade.date);
      trade.createdAt = new Date(trade.createdAt);
      await updateItem('trades', trade);
    }
  }

  if (data.dailyNotes) {
    for (const note of data.dailyNotes) {
      note.date = new Date(note.date);
      await updateItem('dailyNotes', note);
    }
  }

  if (data.settings) {
    for (const setting of data.settings) {
      await updateItem('settings', setting);
    }
  }
};

// Initialize default settings
export const initializeSettings = async (): Promise<Settings> => {
  let settings = await getItem<Settings>('settings', 'main');
  
  if (!settings) {
    settings = {
      id: 'main',
      theme: 'dark',
      selectedAccountId: null,
    };
    await addItem('settings', settings);
  }
  
  return settings;
};
