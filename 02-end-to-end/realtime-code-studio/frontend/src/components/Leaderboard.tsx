import { useState, useEffect } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Leaderboard = () => {
  const { leaderboard, loading, error, fetchLeaderboard } = useLeaderboard();
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchLeaderboard(selectedLanguage);
  }, [selectedLanguage, fetchLeaderboard]);

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang === 'all' ? undefined : lang);
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <CardTitle>Leaderboard</CardTitle>
        </div>
        <CardDescription>
          Top performers by execution success and speed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="all" onValueChange={handleLanguageChange}>
          <TabsList>
            <TabsTrigger value="all">All Languages</TabsTrigger>
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="typescript">TypeScript</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedLanguage || 'all'} className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No scores yet. Start coding to appear on the leaderboard!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12">Rank</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead className="text-right">Executions</TableHead>
                      <TableHead className="text-right">Success Rate</TableHead>
                      <TableHead className="text-right">Avg Time (ms)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry) => (
                      <TableRow key={entry.user_id} className="hover:bg-muted/50">
                        <TableCell className="font-bold text-lg">
                          {getMedalEmoji(entry.rank)}
                        </TableCell>
                        <TableCell className="font-medium">{entry.username}</TableCell>
                        <TableCell className="text-right">
                          {entry.successful_executions}/{entry.total_executions}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-semibold ${
                            entry.success_rate === 100 ? 'text-green-600' : 
                            entry.success_rate >= 80 ? 'text-yellow-600' : 
                            'text-orange-600'
                          }`}>
                            {entry.success_rate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {entry.avg_execution_time.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
