import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { 
  calculateStats, 
  calculateEquityCurve, 
  calculateMonthlyPerformance,
  calculateSessionStats,
  calculateSetupStats
} from '@/lib/analytics';
import EquityChart from '@/components/charts/EquityChart';
import MonthlyChart from '@/components/charts/MonthlyChart';
import SessionChart from '@/components/charts/SessionChart';
import WinLossChart from '@/components/charts/WinLossChart';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Target, 
  Activity, 
  Award, 
  AlertTriangle,
  TrendingDown,
  Percent,
  DollarSign
} from 'lucide-react';

const Analytics: React.FC = () => {
  const { trades, selectedAccount, getTradesForAccount } = useApp();
  
  const accountTrades = selectedAccount 
    ? getTradesForAccount(selectedAccount.id) 
    : trades;
  
  const stats = calculateStats(accountTrades);
  const equityCurve = selectedAccount 
    ? calculateEquityCurve(accountTrades, selectedAccount.startingBalance)
    : calculateEquityCurve(accountTrades, 10000);
  const monthlyPerformance = calculateMonthlyPerformance(accountTrades);
  const sessionStats = calculateSessionStats(accountTrades);
  const setupStats = calculateSetupStats(accountTrades);

  if (accountTrades.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Analytics</h1>
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              No trades to analyze yet. Start adding trades to see your performance analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          {selectedAccount ? `Analyzing: ${selectedAccount.name}` : 'All accounts'}
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          subtitle={`${accountTrades.filter(t => t.result === 'Win').length} wins / ${accountTrades.length} trades`}
          icon={Target}
          trend={stats.winRate >= 50 ? 'up' : 'down'}
        />
        <StatsCard
          title="Expectancy"
          value={`${stats.expectancy >= 0 ? '+' : ''}${stats.expectancy.toFixed(2)}R`}
          subtitle="Average R per trade"
          icon={TrendingUp}
          trend={stats.expectancy >= 0 ? 'up' : 'down'}
        />
        <StatsCard
          title="Profit Factor"
          value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
          subtitle="Gross profit / Gross loss"
          icon={Percent}
          trend={stats.profitFactor >= 1 ? 'up' : 'down'}
        />
        <StatsCard
          title="Max Drawdown"
          value={`${stats.maxDrawdown.toFixed(2)}R`}
          subtitle="Peak to trough"
          icon={TrendingDown}
          trend="down"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <EquityChart data={equityCurve} />
        <WinLossChart trades={accountTrades} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <MonthlyChart data={monthlyPerformance} />
        <SessionChart data={sessionStats} />
      </div>

      {/* Detailed Stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Session Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance by Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessionStats.map(session => (
                <div key={session.session} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <span className="font-medium">{session.session}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({session.trades} trades)
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={session.avgR >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {session.avgR >= 0 ? '+' : ''}{session.avgR.toFixed(2)}R avg
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session.winRate.toFixed(1)}% win rate
                    </div>
                  </div>
                </div>
              ))}
              {sessionStats.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No session data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Setup Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance by Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {setupStats
                .sort((a, b) => b.avgR - a.avgR)
                .map(setup => (
                <div key={setup.setup} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <span className="font-medium">{setup.setup}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({setup.trades} trades)
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={setup.avgR >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {setup.avgR >= 0 ? '+' : ''}{setup.avgR.toFixed(2)}R avg
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {setup.winRate.toFixed(1)}% win rate
                    </div>
                  </div>
                </div>
              ))}
              {setupStats.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No setup data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Best Session"
          value={stats.bestSession}
          icon={Award}
          trend="up"
        />
        <StatsCard
          title="Worst Session"
          value={stats.worstSession}
          icon={AlertTriangle}
          trend="down"
        />
        <StatsCard
          title="Best Setup"
          value={stats.bestSetup}
          icon={TrendingUp}
          trend="up"
        />
        <StatsCard
          title="Worst Setup"
          value={stats.worstSetup}
          icon={TrendingDown}
          trend="down"
        />
      </div>
    </div>
  );
};

export default Analytics;
