// Lot Size Calculator for Forex, Gold, and Indices

export interface CalculatorInput {
  accountBalance: number;
  riskPercent: number;
  stopLossPips: number;
  pair: string;
  accountCurrency: string;
}

export interface CalculatorResult {
  lotSize: number;
  riskAmount: number;
  pipValue: number;
  maxLotSize: number;
  positionValue: number;
}

// Standard pip values per lot (100,000 units)
const getPipValuePerLot = (pair: string): number => {
  const pairUpper = pair.toUpperCase();
  
  // Forex pairs ending in USD
  if (pairUpper.endsWith('USD')) {
    return 10; // $10 per pip per lot
  }
  
  // Forex pairs with USD as base
  if (pairUpper.startsWith('USD')) {
    return 10; // Approximate - should be calculated with current price
  }
  
  // JPY pairs
  if (pairUpper.includes('JPY')) {
    return 8.5; // Approximate for JPY pairs
  }
  
  // Gold (XAU/USD)
  if (pairUpper.includes('XAU') || pairUpper.includes('GOLD')) {
    return 10; // $10 per 0.01 move per lot (100 oz)
  }
  
  // Silver (XAG/USD)
  if (pairUpper.includes('XAG') || pairUpper.includes('SILVER')) {
    return 50; // $50 per 0.01 move per lot
  }
  
  // US Indices
  if (pairUpper.includes('US30') || pairUpper.includes('DJ30') || pairUpper.includes('DOW')) {
    return 1; // $1 per point per lot
  }
  
  if (pairUpper.includes('US500') || pairUpper.includes('SPX') || pairUpper.includes('SP500')) {
    return 10; // $10 per point per lot
  }
  
  if (pairUpper.includes('NAS100') || pairUpper.includes('NASDAQ') || pairUpper.includes('NDX')) {
    return 1; // $1 per point per lot
  }
  
  // UK100 (FTSE)
  if (pairUpper.includes('UK100') || pairUpper.includes('FTSE')) {
    return 1;
  }
  
  // DAX
  if (pairUpper.includes('GER40') || pairUpper.includes('GER30') || pairUpper.includes('DAX')) {
    return 1;
  }
  
  // Default for other pairs
  return 10;
};

export const calculateLotSize = (input: CalculatorInput): CalculatorResult => {
  const { accountBalance, riskPercent, stopLossPips, pair } = input;
  
  // Calculate risk amount
  const riskAmount = (accountBalance * riskPercent) / 100;
  
  // Get pip value per standard lot
  const pipValuePerLot = getPipValuePerLot(pair);
  
  // Calculate lot size
  // Formula: Lot Size = Risk Amount / (Stop Loss in Pips × Pip Value per Lot)
  const lotSize = riskAmount / (stopLossPips * pipValuePerLot);
  
  // Round to 2 decimal places (standard lot sizing)
  const roundedLotSize = Math.floor(lotSize * 100) / 100;
  
  // Calculate pip value for this lot size
  const pipValue = roundedLotSize * pipValuePerLot;
  
  // Calculate max lot size based on a maximum risk of 5%
  const maxRiskAmount = (accountBalance * 5) / 100;
  const maxLotSize = Math.floor((maxRiskAmount / (stopLossPips * pipValuePerLot)) * 100) / 100;
  
  // Calculate position value (approximate)
  const positionValue = roundedLotSize * 100000;
  
  return {
    lotSize: roundedLotSize,
    riskAmount,
    pipValue,
    maxLotSize,
    positionValue,
  };
};

// Common forex pairs
export const FOREX_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'USD/CAD',
  'AUD/USD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY',
  'EUR/CHF', 'AUD/JPY', 'CAD/JPY', 'CHF/JPY', 'EUR/AUD',
  'EUR/CAD', 'EUR/NZD', 'GBP/AUD', 'GBP/CAD', 'GBP/CHF',
  'GBP/NZD', 'AUD/CAD', 'AUD/CHF', 'AUD/NZD', 'NZD/CAD',
  'NZD/CHF', 'NZD/JPY'
];

// Metals
export const METALS = [
  'XAU/USD (Gold)', 'XAG/USD (Silver)'
];

// Indices
export const INDICES = [
  'US30 (Dow Jones)', 'US500 (S&P 500)', 'NAS100 (Nasdaq)',
  'UK100 (FTSE)', 'GER40 (DAX)', 'JPN225 (Nikkei)',
  'AUS200 (ASX)', 'FRA40 (CAC)'
];

// All instruments
export const ALL_INSTRUMENTS = [...FOREX_PAIRS, ...METALS, ...INDICES];

// Trading sessions
export const TRADING_SESSIONS = [
  'Asian',
  'London',
  'NY',
  'Pre-NY',
  'Post-NY'
];

// Setup tags
export const SETUP_TAGS = [
  'Breakout',
  'Pullback',
  'Reversal',
  'Trend Continuation',
  'Range Trade',
  'Support/Resistance',
  'Supply/Demand',
  'Fibonacci',
  'Moving Average',
  'Trendline Break',
  'Double Top/Bottom',
  'Head & Shoulders',
  'Flag/Pennant',
  'Wedge',
  'Other'
];

// Emotions
export const EMOTIONS = [
  'Calm',
  'Fear',
  'Greed',
  'Impulsive',
  'Overconfident',
  'Disciplined'
];
