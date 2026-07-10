'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { UserProfile, DailyDoshaLog } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  vata: z.number().min(0).max(10),
  pitta: z.number().min(0).max(10),
  kapha: z.number().min(0).max(10),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function DailyTrackerPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { vata: 5, pitta: 5, kapha: 5, notes: '' },
  });

  useEffect(() => {
    // Avoid hydration mismatch by setting the date string on mount
    setCurrentDateStr(format(new Date(), "MMMM d, yyyy"));
  }, []);

  const logsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'doshaLogs'),
      orderBy('id', 'desc'),
      limit(30)
    );
  }, [user, firestore]);

  const { data: logs, isLoading: areLogsLoading } = useCollection<DailyDoshaLog>(logsQuery);
  
  const chartData = useMemo(() => {
      if (!logs) return [];
      return logs.map(log => ({
          ...log,
          date: format(parseISO(log.date), 'MMM d'),
      })).reverse();
  }, [logs]);

  async function onSubmit(values: FormData) {
    if (!user || !firestore) return;
    setIsSubmitting(true);

    const today = new Date();
    const logId = format(today, 'yyyy-MM-dd');

    const newLog: DailyDoshaLog = {
      id: logId,
      userId: user.uid,
      date: today.toISOString(),
      vata: values.vata,
      pitta: values.pitta,
      kapha: values.kapha,
      notes: values.notes,
    };
    
    const logRef = doc(firestore, 'users', user.uid, 'doshaLogs', logId);
    setDocumentNonBlocking(logRef, newLog, { merge: true });

    toast({
      title: "Log Saved",
      description: "Your dosha levels for today have been recorded.",
    });

    setIsSubmitting(false);
  }
  
  const DoshaSlider = ({ name, label, color }: { name: keyof FormData, label: string, color: string }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center">
            <Label htmlFor={name} className={`font-semibold ${color}`}>{label}</Label>
            <span className="text-sm font-medium w-8 text-center">{form.watch(name)}</span>
        </div>
        <Controller
            name={name}
            control={form.control}
            render={({ field }) => (
                <Slider
                    id={name}
                    min={0}
                    max={10}
                    step={1}
                    value={[field.value as number]}
                    onValueChange={(value) => field.onChange(value[0])}
                    disabled={isSubmitting}
                />
            )}
        />
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Dosha Tracker</CardTitle>
          <CardDescription>Log your dosha levels daily to observe patterns and maintain balance.</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Today's Entry</CardTitle>
            <CardDescription>{currentDateStr || 'Loading date...'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <DoshaSlider name="vata" label="Vata" color="text-blue-500" />
                <DoshaSlider name="pitta" label="Pitta" color="text-red-500" />
                <DoshaSlider name="kapha" label="Kapha" color="text-green-500" />
              
                <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea 
                        id="notes" 
                        placeholder="How are you feeling today? Any specific meals or activities?" 
                        {...form.register('notes')}
                        disabled={isSubmitting}
                    />
                </div>

                <Button type="submit" disabled={isSubmitting || isUserLoading} className="w-full">
                    {isSubmitting ? 'Saving...' : "Save Today's Log"}
                </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>30-Day Trend</CardTitle>
                <CardDescription>Visualize your dosha balance over the last month.</CardDescription>
            </CardHeader>
            <CardContent>
                {(areLogsLoading || isUserLoading) ? (
                    <Skeleton className="h-[300px] w-full" />
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 10]} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))'
                            }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="vata" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Vata" dot={false}/>
                        <Line type="monotone" dataKey="pitta" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Pitta" dot={false}/>
                        <Line type="monotone" dataKey="kapha" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Kapha" dot={false}/>
                    </LineChart>
                    </ResponsiveContainer>
                )}
                 {(!areLogsLoading && !isUserLoading && logs?.length === 0) && (
                    <div className="flex items-center justify-center h-[300px] text-center text-muted-foreground">
                        <p>You have no logs yet. <br/> Save your first entry to see your trend chart!</p>
                    </div>
                 )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
