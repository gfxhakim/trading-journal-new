import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade } from '@/lib/db';

interface WinLossChartProps {
  trades: Trade[];
  title?: string;
}

const WinLossChart: React.FC<WinLossChartProps> = ({ trades, title = "Win/Loss Distribution" }) => {
  const wins = trades.filter(t => t.result === 'Win').length;
  const losses = trades.filter(t => t.result === 'Loss').length;
  const breakeven = trades.filter(t => t.result === 'BE').length;

  const data = [
    { name: 'Wins', value: wins, color: 'hsl(var(--chart-1))' },
    { name: 'Losses', value: losses, color: 'hsl(var(--destructive))' },
    { name: 'Breakeven', value: breakeven, color: 'hsl(var(--muted))' },
  ].filter(d => d.value > 0);

  if (trades.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          No trade data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              formatter={(value: number, name: string) => [
                `${value} trades (${((value / trades.length) * 100).toFixed(1)}%)`,
                name
              ]}
            />
            <Legend 
              formatter={(value) => <span className="text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default WinLossChart;
