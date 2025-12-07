import React from 'react';
import { Trade } from '@/lib/db';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradeCardProps {
  trade: Trade;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

const TradeCard: React.FC<TradeCardProps> = ({ trade, onEdit, onDelete, compact = false }) => {
  const isWin = trade.result === 'Win';
  const isLoss = trade.result === 'Loss';
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3 w-3",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
        )}
      />
    ));
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-2 rounded-full",
            trade.direction === 'Buy' ? "bg-green-500/10" : "bg-red-500/10"
          )}>
            {trade.direction === 'Buy' ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{trade.pair}</span>
              <Badge variant={isWin ? "default" : isLoss ? "destructive" : "secondary"} className="text-xs">
                {trade.result}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(trade.date).toLocaleDateString()} • {trade.session}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={cn(
              "font-semibold",
              isWin && "text-green-500",
              isLoss && "text-red-500"
            )}>
              {trade.rMultiple > 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R
            </div>
            <div className="flex">{renderStars(trade.disciplineRating)}</div>
          </div>
          
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(trade)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(trade.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className={cn(
        "py-3",
        isWin && "bg-green-500/10",
        isLoss && "bg-red-500/10",
        !isWin && !isLoss && "bg-muted/50"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full bg-background",
            )}>
              {trade.direction === 'Buy' ? (
                <ArrowUpRight className="h-5 w-5 text-green-500" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div>
              <div className="font-semibold text-lg">{trade.pair}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(trade.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(trade)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(trade.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant={isWin ? "default" : isLoss ? "destructive" : "secondary"}>
            {trade.result}
          </Badge>
          <span className={cn(
            "text-2xl font-bold",
            isWin && "text-green-500",
            isLoss && "text-red-500"
          )}>
            {trade.rMultiple > 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Entry:</span>
            <span className="ml-2 font-medium">{trade.entry}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Exit:</span>
            <span className="ml-2 font-medium">{trade.exitPrice}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Stop Loss:</span>
            <span className="ml-2 font-medium">{trade.stopLoss}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Take Profit:</span>
            <span className="ml-2 font-medium">{trade.takeProfit}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{trade.session}</Badge>
          <Badge variant="outline">{trade.setupTag}</Badge>
          <Badge variant="outline">{trade.emotion}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-1">Discipline:</span>
            {renderStars(trade.disciplineRating)}
          </div>
          <div className="text-sm text-muted-foreground">
            Risk: {trade.riskPercent}%
          </div>
        </div>
        
        {trade.notes && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground">{trade.notes}</p>
          </div>
        )}
        
        {trade.screenshot && (
          <div className="pt-2">
            <img 
              src={trade.screenshot} 
              alt="Trade screenshot" 
              className="rounded-lg w-full max-h-48 object-cover"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradeCard;
