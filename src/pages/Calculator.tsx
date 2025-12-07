import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { calculateLotSize, ALL_INSTRUMENTS, CalculatorResult } from '@/lib/calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator as CalculatorIcon, DollarSign, Percent, Target, Scale } from 'lucide-react';

const Calculator: React.FC = () => {
  const { selectedAccount } = useApp();
  
  const [formData, setFormData] = useState({
    accountBalance: selectedAccount?.currentBalance.toString() || '10000',
    riskPercent: '1',
    stopLossPips: '20',
    pair: 'EUR/USD',
    accountCurrency: selectedAccount?.currency || '$',
  });

  const result: CalculatorResult = useMemo(() => {
    return calculateLotSize({
      accountBalance: parseFloat(formData.accountBalance) || 0,
      riskPercent: parseFloat(formData.riskPercent) || 0,
      stopLossPips: parseFloat(formData.stopLossPips) || 0,
      pair: formData.pair,
      accountCurrency: formData.accountCurrency,
    });
  }, [formData]);

  // Update balance when account changes
  React.useEffect(() => {
    if (selectedAccount) {
      setFormData(prev => ({
        ...prev,
        accountBalance: selectedAccount.currentBalance.toString(),
        accountCurrency: selectedAccount.currency,
      }));
    }
  }, [selectedAccount]);

  const presetRisks = [0.5, 1, 1.5, 2, 3];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lot Size Calculator</h1>
        <p className="text-muted-foreground">
          Calculate your position size based on risk parameters
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalculatorIcon className="h-5 w-5 text-primary" />
              Risk Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Account Balance */}
            <div className="space-y-2">
              <Label>Account Balance</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={formData.accountBalance}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountBalance: e.target.value }))}
                  className="pl-9"
                  placeholder="10000"
                />
              </div>
              {selectedAccount && (
                <p className="text-xs text-muted-foreground">
                  Using {selectedAccount.name} balance
                </p>
              )}
            </div>

            {/* Risk Percentage */}
            <div className="space-y-2">
              <Label>Risk Percentage</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={formData.riskPercent}
                  onChange={(e) => setFormData(prev => ({ ...prev, riskPercent: e.target.value }))}
                  className="pl-9"
                  placeholder="1"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {presetRisks.map(risk => (
                  <Button
                    key={risk}
                    variant={parseFloat(formData.riskPercent) === risk ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, riskPercent: risk.toString() }))}
                  >
                    {risk}%
                  </Button>
                ))}
              </div>
            </div>

            {/* Stop Loss Pips */}
            <div className="space-y-2">
              <Label>Stop Loss (Pips/Points)</Label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.stopLossPips}
                  onChange={(e) => setFormData(prev => ({ ...prev, stopLossPips: e.target.value }))}
                  className="pl-9"
                  placeholder="20"
                />
              </div>
            </div>

            {/* Pair Selection */}
            <div className="space-y-2">
              <Label>Pair / Instrument</Label>
              <Select 
                value={formData.pair} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, pair: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pair" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {ALL_INSTRUMENTS.map((pair) => (
                    <SelectItem key={pair} value={pair}>
                      {pair}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Recommended Lot Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-primary text-center py-4">
                {result.lotSize.toFixed(2)}
              </div>
              <p className="text-center text-muted-foreground">
                Standard Lots
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Risk Amount</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formData.accountCurrency}{result.riskAmount.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Pip Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formData.accountCurrency}{result.pipValue.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Max Lot Size (5% risk)</p>
                  <p className="text-2xl font-bold text-foreground">
                    {result.maxLotSize.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Position Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formData.accountCurrency}{result.positionValue.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Warning */}
          {parseFloat(formData.riskPercent) > 2 && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-destructive text-center">
                  ⚠️ Risking more than 2% per trade is considered aggressive. 
                  Consider reducing your risk for better capital preservation.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
