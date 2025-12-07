import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface InsightsCardProps {
  insights: string[];
}

const InsightsCard: React.FC<InsightsCardProps> = ({ insights }) => {
  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className="p-3 rounded-lg bg-muted/50 text-sm leading-relaxed"
          >
            {insight}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
