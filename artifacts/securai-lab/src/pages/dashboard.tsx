import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetChartData, getGetChartDataQueryKey, useGetRecentActivity, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldAlert, Target, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: charts, isLoading: chartsLoading } = useGetChartData({ query: { queryKey: getGetChartDataQueryKey() } });
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-foreground">Command Center</h1>
        <p className="text-muted-foreground">System vitals and threat intelligence overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel card-3d border-primary/20 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Scans Run</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-10 w-24 bg-white/5" /> : (
              <div className="text-4xl font-bold text-primary">{stats?.totalScans || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel card-3d border-primary/20 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Challenges Mastered</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-10 w-24 bg-white/5" /> : (
              <div className="text-4xl font-bold text-primary">{stats?.totalChallengesSolved || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel card-3d border-primary/20 bg-card/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Security Rating</CardTitle>
            <ShieldAlert className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="relative z-10">
            {statsLoading ? <Skeleton className="h-10 w-24 bg-white/5" /> : (
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-primary">{stats?.securityRating || 0}</div>
                <span className="text-muted-foreground text-sm">/ 100</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-panel col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="uppercase text-sm tracking-wider text-muted-foreground">Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {chartsLoading ? <Skeleton className="w-full h-full bg-white/5" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts?.progressOverTime || []}>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Line type="monotone" dataKey="challengesSolved" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle className="uppercase text-sm tracking-wider text-muted-foreground">Vuln Severity Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center gap-4">
            {statsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full bg-white/5" />
                <Skeleton className="h-12 w-full bg-white/5" />
                <Skeleton className="h-12 w-full bg-white/5" />
                <Skeleton className="h-12 w-full bg-white/5" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span className="uppercase text-sm font-bold">Critical</span>
                  </div>
                  <span className="font-mono text-lg">{stats?.criticalVulns || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="uppercase text-sm font-bold">High</span>
                  </div>
                  <span className="font-mono text-lg">{stats?.highVulns || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="uppercase text-sm font-bold">Medium</span>
                  </div>
                  <span className="font-mono text-lg">{stats?.mediumVulns || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <span className="uppercase text-sm font-bold">Low</span>
                  </div>
                  <span className="font-mono text-lg">{stats?.lowVulns || 0}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="uppercase text-sm tracking-wider text-muted-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full bg-white/5" />
                <Skeleton className="h-16 w-full bg-white/5" />
                <Skeleton className="h-16 w-full bg-white/5" />
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-4">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className={`p-2 rounded bg-background border ${item.type === 'scan' ? 'border-primary text-primary' : 'border-blue-400 text-blue-400'}`}>
                      {item.type === 'scan' ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm">{item.title}</h4>
                        <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    {item.severity && (
                      <Badge variant="outline" className={`
                        ${item.severity === 'critical' ? 'border-destructive text-destructive' : ''}
                        ${item.severity === 'high' ? 'border-orange-500 text-orange-500' : ''}
                        ${item.severity === 'medium' ? 'border-yellow-500 text-yellow-500' : ''}
                        ${item.severity === 'low' ? 'border-blue-400 text-blue-400' : ''}
                      `}>
                        {item.severity}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No recent activity</div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="uppercase text-sm tracking-wider text-muted-foreground">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {chartsLoading ? <Skeleton className="w-full h-full bg-white/5" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.categoryBreakdown || []} layout="vertical" margin={{ left: 50 }}>
                    <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="category" type="category" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
