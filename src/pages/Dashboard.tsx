import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { 
  calculateStats, 
  calculateEquityCurve, 
  calculateMonthlyPerformance,
  generateInsights 
} from '@/lib/analytics';
import StatsCard from '@/components/dashboard/StatsCard';
import InsightsCard from '@/components/dashboard/InsightsCard';
import EquityChart from '@/components/charts/EquityChart';
import MonthlyChart from '@/components/charts/MonthlyChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Target, 
  Activity, 
  Award, 
  AlertTriangle,
  BarChart3,
  PlusCircle,
  Wallet
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { trades, selectedAccount, accounts, getTradesForAccount } = useApp();
  
  const accountTrades = selectedAccount 
    ? getTradesForAccount(selectedAccount.id) 
    : trades;
  
  const stats = calculateStats(accountTrades);
  const equityCurve = selectedAccount 
    ? calculateEquityCurve(accountTrades, selectedAccount.startingBalance)
    : calculateEquityCurve(accountTrades, 10000);
  const monthlyPerformance = calculateMonthlyPerformance(accountTrades);
  const insights = generateInsights(accountTrades, stats);

  // Show welcome screen if no accounts
  if (accounts.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
              <TrendingUp className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Trading Journal Pro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Get started by creating your first trading account to begin tracking your trades and performance.
            </p>
            <Button asChild className="w-full">
              <Link to="/accounts">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Account
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if no trades
  if (accountTrades.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {selectedAccount ? `Viewing: ${selectedAccount.name}` : 'All accounts'}
          </p>
        </div>
        
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
              <BarChart3 className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>No Trades Yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Start adding trades to see your performance analytics and insights here.
            </p>
            <Button asChild>
              <Link to="/journal">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Trade
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {selectedAccount ? `Viewing: ${selectedAccount.name}` : 'All accounts'}
          </p>
        </div>
        
        {selectedAccount && (
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <span className="text-sm text-muted-foreground">Balance: </span>
              <span className="font-bold text-foreground">
                {selectedAccount.currency}{selectedAccount.currentBalance.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Trades"
          value={stats.totalTrades}
          icon={Activity}
        />
        <StatsCard
          title="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          trend={stats.winRate >= 50 ? 'up' : 'down'}
          icon={Target}
        />
        <StatsCard
          title="Average R"
          value={`${stats.avgR >= 0 ? '+' : ''}${stats.avgR.toFixed(2)}R`}
          trend={stats.avgR >= 0 ? 'up' : 'down'}
          icon={TrendingUp}
        />
        <StatsCard
          title="Profit Factor"
          value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
          trend={stats.profitFactor >= 1 ? 'up' : 'down'}
          icon={Award}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Best Session"
          value={stats.bestSession}
          icon={TrendingUp}
          trend="up"
        />
        <StatsCard
          title="Best Setup"
          value={stats.bestSetup}
          subtitle={stats.bestSetup !== 'N/A' ? 'Top performer' : undefined}
          icon={Target}
        />
        <StatsCard
          title="Max Consecutive Wins"
          value={stats.maxConsecutiveWins}
          icon={Award}
        />
        <StatsCard
          title="Max Consecutive Losses"
          value={stats.maxConsecutiveLosses}
          icon={AlertTriangle}
          trend={stats.maxConsecutiveLosses >= 3 ? 'down' : 'neutral'}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <EquityChart data={equityCurve} />
        <MonthlyChart data={monthlyPerformance} />
      </div>

      {/* Insights */}
      <InsightsCard insights={insights} />
    </div>
  );
};

export default Dashboard;
