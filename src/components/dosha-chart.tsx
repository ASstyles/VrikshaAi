'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

type DoshaChartProps = {
    vata: number;
    pitta: number;
    kapha: number;
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export function DoshaChart({ vata, pitta, kapha }: DoshaChartProps) {
    const data = [
        {
          name: "Vata",
          score: vata,
        },
        {
          name: "Pitta",
          score: pitta,
        },
        {
          name: "Kapha",
          score: kapha,
        },
      ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dosha Balance</CardTitle>
        <CardDescription>A visual representation of your Prakriti analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
            <XAxis type="number" hide domain={[0, 100]}/>
            <YAxis
              width={50}
              type="category"
              dataKey="name"
              stroke="hsl(var(--foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
