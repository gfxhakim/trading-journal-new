import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  className 
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn(
              "text-2xl font-bold mt-1",
              trend === 'up' && "text-green-500",
              trend === 'down' && "text-red-500"
            )}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-lg",
            trend === 'up' && "bg-green-500/10",
            trend === 'down' && "bg-red-500/10",
            trend === 'neutral' && "bg-primary/10",
            !trend && "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              trend === 'up' && "text-green-500",
              trend === 'down' && "text-red-500",
              trend === 'neutral' && "text-primary",
              !trend && "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
