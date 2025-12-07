import { Trade } from './db';

export interface TradingStats {
  totalTrades: number;
  winRate: number;
  avgR: number;
  profitFactor: number;
  expectancy: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  maxDrawdown: number;
  totalProfit: number;
  totalLoss: number;
  bestSession: string;
  worstSession: string;
  bestSetup: string;
  worstSetup: string;
}

export interface SessionStats {
  session: string;
  trades: number;
  winRate: number;
  avgR: number;
  totalR: number;
}

export interface SetupStats {
  setup: string;
  trades: number;
  winRate: number;
  avgR: number;
  totalR: number;
}

export interface MonthlyPerformance {
  month: string;
  profit: number;
  trades: number;
  winRate: number;
}

export interface EquityPoint {
  date: string;
  equity: number;
  balance: number;
}

export const calculateStats = (trades: Trade[]): TradingStats => {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      avgR: 0,
      profitFactor: 0,
      expectancy: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      maxDrawdown: 0,
      totalProfit: 0,
      totalLoss: 0,
      bestSession: 'N/A',
      worstSession: 'N/A',
      bestSetup: 'N/A',
      worstSetup: 'N/A',
    };
  }

  const wins = trades.filter(t => t.result === 'Win');
  const losses = trades.filter(t => t.result === 'Loss');
  
  const totalProfit = wins.reduce((sum, t) => sum + t.rewardAmount, 0);
  const totalLoss = Math.abs(losses.reduce((sum, t) => sum + t.riskAmount, 0));
  
  const totalR = trades.reduce((sum, t) => sum + t.rMultiple, 0);
  const avgR = totalR / trades.length;
  
  // Calculate consecutive wins/losses
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  for (const trade of sortedTrades) {
    if (trade.result === 'Win') {
      currentWinStreak++;
      currentLossStreak = 0;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
    } else if (trade.result === 'Loss') {
      currentLossStreak++;
      currentWinStreak = 0;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
    } else {
      currentWinStreak = 0;
      currentLossStreak = 0;
    }
  }

  // Calculate max drawdown
  let peak = 0;
  let maxDrawdown = 0;
  let runningBalance = 0;
  
  for (const trade of sortedTrades) {
    runningBalance += trade.rMultiple;
    peak = Math.max(peak, runningBalance);
    const drawdown = peak - runningBalance;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  // Calculate session stats
  const sessionStats = calculateSessionStats(trades);
  const bestSession = sessionStats.reduce((best, curr) => 
    curr.avgR > best.avgR ? curr : best, sessionStats[0]);
  const worstSession = sessionStats.reduce((worst, curr) => 
    curr.avgR < worst.avgR ? curr : worst, sessionStats[0]);

  // Calculate setup stats
  const setupStats = calculateSetupStats(trades);
  const bestSetup = setupStats.length > 0 
    ? setupStats.reduce((best, curr) => curr.avgR > best.avgR ? curr : best, setupStats[0])
    : { setup: 'N/A' };
  const worstSetup = setupStats.length > 0
    ? setupStats.reduce((worst, curr) => curr.avgR < worst.avgR ? curr : worst, setupStats[0])
    : { setup: 'N/A' };

  return {
    totalTrades: trades.length,
    winRate: (wins.length / trades.length) * 100,
    avgR,
    profitFactor: totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0,
    expectancy: avgR,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    maxDrawdown,
    totalProfit,
    totalLoss,
    bestSession: bestSession?.session || 'N/A',
    worstSession: worstSession?.session || 'N/A',
    bestSetup: bestSetup?.setup || 'N/A',
    worstSetup: worstSetup?.setup || 'N/A',
  };
};

export const calculateSessionStats = (trades: Trade[]): SessionStats[] => {
  const sessions = ['Asian', 'London', 'NY', 'Pre-NY', 'Post-NY'];
  
  return sessions.map(session => {
    const sessionTrades = trades.filter(t => t.session === session);
    const wins = sessionTrades.filter(t => t.result === 'Win');
    const totalR = sessionTrades.reduce((sum, t) => sum + t.rMultiple, 0);
    
    return {
      session,
      trades: sessionTrades.length,
      winRate: sessionTrades.length > 0 ? (wins.length / sessionTrades.length) * 100 : 0,
      avgR: sessionTrades.length > 0 ? totalR / sessionTrades.length : 0,
      totalR,
    };
  }).filter(s => s.trades > 0);
};

export const calculateSetupStats = (trades: Trade[]): SetupStats[] => {
  const setups = [...new Set(trades.map(t => t.setupTag))];
  
  return setups.map(setup => {
    const setupTrades = trades.filter(t => t.setupTag === setup);
    const wins = setupTrades.filter(t => t.result === 'Win');
    const totalR = setupTrades.reduce((sum, t) => sum + t.rMultiple, 0);
    
    return {
      setup,
      trades: setupTrades.length,
      winRate: setupTrades.length > 0 ? (wins.length / setupTrades.length) * 100 : 0,
      avgR: setupTrades.length > 0 ? totalR / setupTrades.length : 0,
      totalR,
    };
  }).filter(s => s.trades > 0);
};

export const calculateMonthlyPerformance = (trades: Trade[]): MonthlyPerformance[] => {
  const monthlyData: Record<string, { profit: number; trades: number; wins: number }> = {};
  
  for (const trade of trades) {
    const date = new Date(trade.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { profit: 0, trades: 0, wins: 0 };
    }
    
    monthlyData[monthKey].profit += trade.rMultiple;
    monthlyData[monthKey].trades++;
    if (trade.result === 'Win') {
      monthlyData[monthKey].wins++;
    }
  }
  
  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      profit: data.profit,
      trades: data.trades,
      winRate: (data.wins / data.trades) * 100,
    }));
};

export const calculateEquityCurve = (trades: Trade[], startingBalance: number): EquityPoint[] => {
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  let runningBalance = startingBalance;
  const curve: EquityPoint[] = [{
    date: 'Start',
    equity: 0,
    balance: startingBalance,
  }];
  
  for (const trade of sortedTrades) {
    runningBalance += trade.rewardAmount - (trade.result === 'Loss' ? trade.riskAmount : 0);
    curve.push({
      date: new Date(trade.date).toLocaleDateString(),
      equity: runningBalance - startingBalance,
      balance: runningBalance,
    });
  }
  
  return curve;
};

export const generateInsights = (trades: Trade[], stats: TradingStats): string[] => {
  const insights: string[] = [];
  
  if (trades.length === 0) {
    insights.push("Start logging your trades to get personalized insights!");
    return insights;
  }
  
  // Best session insight
  if (stats.bestSession !== 'N/A') {
    const sessionStats = calculateSessionStats(trades);
    const best = sessionStats.find(s => s.session === stats.bestSession);
    if (best && best.trades >= 3) {
      insights.push(`📈 Your best session is ${stats.bestSession} with a win rate of ${best.winRate.toFixed(1)}% and ${best.avgR.toFixed(2)}R average.`);
    }
  }
  
  // Worst session warning
  if (stats.worstSession !== 'N/A') {
    const sessionStats = calculateSessionStats(trades);
    const worst = sessionStats.find(s => s.session === stats.worstSession);
    if (worst && worst.trades >= 3 && worst.avgR < 0) {
      insights.push(`⚠️ Consider avoiding ${stats.worstSession} session — your expectancy is negative (${worst.avgR.toFixed(2)}R).`);
    }
  }
  
  // Best setup insight
  if (stats.bestSetup !== 'N/A') {
    const setupStats = calculateSetupStats(trades);
    const best = setupStats.find(s => s.setup === stats.bestSetup);
    if (best && best.trades >= 3) {
      insights.push(`🎯 Your best setup is "${stats.bestSetup}" with ${best.avgR.toFixed(2)}R average over ${best.trades} trades.`);
    }
  }
  
  // Risk management insight
  const avgRisk = trades.reduce((sum, t) => sum + t.riskPercent, 0) / trades.length;
  if (avgRisk > 2) {
    insights.push(`💡 You're risking ${avgRisk.toFixed(1)}% on average — consider reducing to 1-2% for better risk management.`);
  }
  
  // Consecutive losses warning
  if (stats.maxConsecutiveLosses >= 3) {
    const recentTrades = [...trades].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 5);
    const recentLosses = recentTrades.filter(t => t.result === 'Loss').length;
    
    if (recentLosses >= 3) {
      insights.push(`🛑 You've had ${stats.maxConsecutiveLosses} consecutive losses. Consider taking a break to reset mentally.`);
    }
  }
  
  // Win rate insight
  if (stats.winRate >= 60) {
    insights.push(`🏆 Great win rate of ${stats.winRate.toFixed(1)}%! Keep up the disciplined trading.`);
  } else if (stats.winRate < 40 && trades.length >= 10) {
    insights.push(`📊 Your win rate is ${stats.winRate.toFixed(1)}%. Review your entry criteria and setup selection.`);
  }
  
  // Profit factor insight
  if (stats.profitFactor >= 2) {
    insights.push(`💰 Excellent profit factor of ${stats.profitFactor.toFixed(2)}! Your winning trades significantly outperform your losses.`);
  }
  
  // Emotion-based insight
  const emotionTrades = trades.reduce((acc, t) => {
    acc[t.emotion] = acc[t.emotion] || { count: 0, wins: 0, totalR: 0 };
    acc[t.emotion].count++;
    if (t.result === 'Win') acc[t.emotion].wins++;
    acc[t.emotion].totalR += t.rMultiple;
    return acc;
  }, {} as Record<string, { count: number; wins: number; totalR: number }>);
  
  const calmTrades = emotionTrades['Calm'] || emotionTrades['Disciplined'];
  const impulsiveTrades = emotionTrades['Impulsive'] || emotionTrades['Greed'];
  
  if (calmTrades && impulsiveTrades) {
    const calmAvgR = calmTrades.totalR / calmTrades.count;
    const impulsiveAvgR = impulsiveTrades.totalR / impulsiveTrades.count;
    
    if (calmAvgR > impulsiveAvgR + 0.5) {
      insights.push(`🧘 You perform better when calm/disciplined (${calmAvgR.toFixed(2)}R vs ${impulsiveAvgR.toFixed(2)}R when impulsive).`);
    }
  }
  
  return insights;
};
