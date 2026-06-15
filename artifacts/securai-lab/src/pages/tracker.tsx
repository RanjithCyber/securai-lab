import { useState } from "react";
import { useListMetrics, getListMetricsQueryKey, useCreateMetric, MetricInputCategory, MetricInputDifficulty } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Loader2, Plus } from "lucide-react";

export default function Tracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: metrics, isLoading } = useListMetrics({ query: { queryKey: getListMetricsQueryKey() } });
  
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState<MetricInputCategory>('web-security');
  const [challenges, setChallenges] = useState("1");
  const [difficulty, setDifficulty] = useState<MetricInputDifficulty>('medium');
  const [notes, setNotes] = useState("");

  const { mutate: addMetric, isPending } = useCreateMetric({
    mutation: {
      onSuccess: () => {
        toast({ title: "Entry Logged", description: "Progress successfully recorded." });
        queryClient.invalidateQueries({ queryKey: getListMetricsQueryKey() });
        setNotes("");
        setChallenges("1");
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to log entry." });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenges || isNaN(Number(challenges)) || Number(challenges) < 1) {
      toast({ variant: "destructive", title: "Invalid Input", description: "Challenges solved must be at least 1." });
      return;
    }
    
    addMetric({
      data: {
        date,
        category,
        challengesSolved: Number(challenges),
        difficulty,
        notes
      }
    });
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'border-primary text-primary bg-primary/10';
      case 'medium': return 'border-yellow-500 text-yellow-500 bg-yellow-500/10';
      case 'hard': return 'border-orange-500 text-orange-500 bg-orange-500/10';
      case 'insane': return 'border-destructive text-destructive bg-destructive/10';
      default: return 'border-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-foreground">Progress Tracker</h1>
        <p className="text-muted-foreground">Log daily exploits and skill progression.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <Card className="glass-panel border-border/50 lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="uppercase text-sm tracking-wider text-muted-foreground">Log New Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Date</label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="bg-black/20" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                <Select value={category} onValueChange={(v) => setCategory(v as MetricInputCategory)}>
                  <SelectTrigger className="bg-black/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(MetricInputCategory).map(cat => (
                      <SelectItem key={cat} value={cat} className="uppercase text-xs">{cat.replace('-', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Count</label>
                  <Input type="number" min="1" value={challenges} onChange={e => setChallenges(e.target.value)} required className="bg-black/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Difficulty</label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as MetricInputDifficulty)}>
                    <SelectTrigger className="bg-black/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy" className="text-primary">EASY</SelectItem>
                      <SelectItem value="medium" className="text-yellow-500">MEDIUM</SelectItem>
                      <SelectItem value="hard" className="text-orange-500">HARD</SelectItem>
                      <SelectItem value="insane" className="text-destructive">INSANE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Notes / Vectors</label>
                <Textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Techniques used, payloads crafted..."
                  className="resize-none bg-black/20 h-24"
                />
              </div>

              <Button type="submit" disabled={isPending} className="w-full uppercase font-bold tracking-widest mt-2">
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Commit Record
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Table Panel */}
        <Card className="glass-panel border-border/50 lg:col-span-2 flex flex-col h-[70vh]">
          <CardHeader>
            <CardTitle className="uppercase text-sm tracking-wider text-muted-foreground">Historical Data</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            {isLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : metrics && metrics.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="uppercase text-xs tracking-widest">Date</TableHead>
                    <TableHead className="uppercase text-xs tracking-widest">Category</TableHead>
                    <TableHead className="uppercase text-xs tracking-widest">Count</TableHead>
                    <TableHead className="uppercase text-xs tracking-widest">Difficulty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map(metric => (
                    <TableRow key={metric.id} className="border-border/50 hover:bg-white/5">
                      <TableCell className="font-mono text-xs">{format(new Date(metric.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="uppercase text-xs">{metric.category.replace('-', ' ')}</TableCell>
                      <TableCell className="font-mono">{metric.challengesSolved}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`uppercase text-[10px] px-2 py-0 h-5 ${getDifficultyColor(metric.difficulty)}`}>
                          {metric.difficulty}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm uppercase tracking-widest">No records found. Start hacking.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
