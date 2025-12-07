import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { DailyNote } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Save, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const DailyReview: React.FC = () => {
  const { dailyNotes, addDailyNote, updateDailyNote } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    dailySummary: '',
    mistakes: '',
    lessons: '',
    planForTomorrow: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Find existing note for selected date
  const existingNote = dailyNotes.find(
    note => format(new Date(note.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  useEffect(() => {
    if (existingNote) {
      setFormData({
        dailySummary: existingNote.dailySummary,
        mistakes: existingNote.mistakes,
        lessons: existingNote.lessons,
        planForTomorrow: existingNote.planForTomorrow,
      });
    } else {
      setFormData({
        dailySummary: '',
        mistakes: '',
        lessons: '',
        planForTomorrow: '',
      });
    }
  }, [existingNote, selectedDate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const noteData: DailyNote = {
        id: existingNote?.id || crypto.randomUUID(),
        date: selectedDate,
        dailySummary: formData.dailySummary,
        mistakes: formData.mistakes,
        lessons: formData.lessons,
        planForTomorrow: formData.planForTomorrow,
      };

      if (existingNote) {
        await updateDailyNote(noteData);
      } else {
        await addDailyNote(noteData);
      }

      toast({
        title: "Review saved",
        description: `Daily review for ${format(selectedDate, 'MMM d, yyyy')}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save review",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const datesWithNotes = dailyNotes.map(note => 
    format(new Date(note.date), 'yyyy-MM-dd')
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Review</h1>
          <p className="text-muted-foreground">
            Reflect on your trading day
          </p>
        </div>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigateDay('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[200px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  modifiers={{
                    hasNote: (date) => datesWithNotes.includes(format(date, 'yyyy-MM-dd'))
                  }}
                  modifiersStyles={{
                    hasNote: { 
                      fontWeight: 'bold',
                      textDecoration: 'underline',
                      textDecorationColor: 'hsl(var(--primary))'
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigateDay('next')}
              disabled={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {existingNote && (
            <div className="text-center mt-2">
              <span className="text-sm text-primary flex items-center justify-center gap-1">
                <FileText className="h-3 w-3" />
                Review exists for this date
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="How did your trading day go? What trades did you take? How did you feel overall?"
              value={formData.dailySummary}
              onChange={(e) => setFormData(prev => ({ ...prev, dailySummary: e.target.value }))}
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mistakes Made</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What mistakes did you make today? What rules did you break? What could you have done better?"
              value={formData.mistakes}
              onChange={(e) => setFormData(prev => ({ ...prev, mistakes: e.target.value }))}
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lessons Learned</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What did you learn today? What insights can you take forward?"
              value={formData.lessons}
              onChange={(e) => setFormData(prev => ({ ...prev, lessons: e.target.value }))}
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plan for Tomorrow</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What is your plan for tomorrow? What setups are you looking for? Any key levels to watch?"
              value={formData.planForTomorrow}
              onChange={(e) => setFormData(prev => ({ ...prev, planForTomorrow: e.target.value }))}
              rows={4}
            />
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={isSaving} size="lg" className="w-full sm:w-auto sm:ml-auto">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Review'}
        </Button>
      </div>
    </div>
  );
};

export default DailyReview;
