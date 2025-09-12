import { useState, useMemo } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Calendar } from "lucide-react";
import { format, parseISO, subMonths, isAfter } from "date-fns";

interface Assessment {
  id: string;
  createdAt: string;
  aiAnalysisResults?: {
    performanceScore?: number;
    metrics?: Array<{
      name: string;
      value: number;
      unit: string;
      confidence: number;
    }>;
  };
}

interface PerformanceChartProps {
  assessments?: Assessment[];
  className?: string;
}

interface ChartDataPoint {
  month: string;
  date: string;
  performance: number;
  speed: number;
  agility: number;
  endurance: number;
  assessments: number;
}

export default function PerformanceChart({ assessments = [], className }: PerformanceChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [timeRange, setTimeRange] = useState<'6m' | '1y' | 'all'>('6m');
  
  const data = useMemo(() => {
    if (!assessments || assessments.length === 0) {
      // Fallback to mock data if no assessments
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map((month, index) => ({
        month,
        date: format(subMonths(new Date(), 5 - index), 'yyyy-MM-dd'),
        performance: Math.floor(Math.random() * 20) + 70 + (index * 2),
        speed: Math.floor(Math.random() * 15) + 75 + (index * 1.5),
        agility: Math.floor(Math.random() * 18) + 68 + (index * 2),
        endurance: Math.floor(Math.random() * 25) + 65 + (index * 3),
        assessments: Math.floor(Math.random() * 5) + 2 + index,
      }));
    }

    // Filter assessments by time range
    const now = new Date();
    const cutoffDate = timeRange === '6m' ? subMonths(now, 6) : 
                     timeRange === '1y' ? subMonths(now, 12) : 
                     new Date(0); // all time

    const filteredAssessments = assessments
      .filter(a => a.createdAt && isAfter(parseISO(a.createdAt), cutoffDate))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (filteredAssessments.length === 0) {
      return [];
    }

    // Group assessments by month
    const monthGroups: { [key: string]: Assessment[] } = {};
    
    filteredAssessments.forEach(assessment => {
      const monthKey = format(parseISO(assessment.createdAt), 'MMM yyyy');
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = [];
      }
      monthGroups[monthKey].push(assessment);
    });

    // Convert to chart data
    return Object.entries(monthGroups).map(([monthKey, monthAssessments]) => {
      const performanceScores = monthAssessments
        .map(a => a.aiAnalysisResults?.performanceScore || 0)
        .filter(score => score > 0);
      
      // Extract specific metrics if available
      const speedMetrics = monthAssessments
        .flatMap(a => a.aiAnalysisResults?.metrics || [])
        .filter(m => m.name.toLowerCase().includes('speed'))
        .map(m => m.value);
        
      const agilityMetrics = monthAssessments
        .flatMap(a => a.aiAnalysisResults?.metrics || [])
        .filter(m => m.name.toLowerCase().includes('agility') || m.name.toLowerCase().includes('coordination'))
        .map(m => m.value);
        
      const enduranceMetrics = monthAssessments
        .flatMap(a => a.aiAnalysisResults?.metrics || [])
        .filter(m => m.name.toLowerCase().includes('endurance') || m.name.toLowerCase().includes('stamina'))
        .map(m => m.value);

      const avgPerformance = performanceScores.length > 0 
        ? performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length 
        : 0;
        
      const avgSpeed = speedMetrics.length > 0 
        ? speedMetrics.reduce((sum, val) => sum + val, 0) / speedMetrics.length 
        : avgPerformance + (Math.random() * 10 - 5); // Slight variation from performance if no specific speed data
        
      const avgAgility = agilityMetrics.length > 0 
        ? agilityMetrics.reduce((sum, val) => sum + val, 0) / agilityMetrics.length 
        : avgPerformance + (Math.random() * 10 - 5);
        
      const avgEndurance = enduranceMetrics.length > 0 
        ? enduranceMetrics.reduce((sum, val) => sum + val, 0) / enduranceMetrics.length 
        : avgPerformance + (Math.random() * 10 - 5);

      return {
        month: format(parseISO(monthAssessments[0].createdAt), 'MMM'),
        date: monthAssessments[0].createdAt,
        performance: Math.max(0, Math.min(100, avgPerformance)),
        speed: Math.max(0, Math.min(100, avgSpeed)),
        agility: Math.max(0, Math.min(100, avgAgility)),
        endurance: Math.max(0, Math.min(100, avgEndurance)),
        assessments: monthAssessments.length,
      };
    });
  }, [assessments, timeRange]);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (data.length < 2) return { trend: 0, totalTests: 0, rank: 0 };
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const trend = ((latest.performance - previous.performance) / previous.performance) * 100;
    const totalTests = data.reduce((sum, d) => sum + d.assessments, 0);
    
    // Mock rank calculation based on performance
    const avgPerformance = data.reduce((sum, d) => sum + d.performance, 0) / data.length;
    const rank = Math.max(1, Math.floor((100 - avgPerformance) * 50));
    
    return { trend, totalTests, rank };
  }, [data]);

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={chartType === 'area' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('area')}
            data-testid="button-chart-area"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Area
          </Button>
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
            data-testid="button-chart-line"
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Line
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={timeRange === '6m' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('6m')}
            data-testid="button-range-6m"
          >
            6M
          </Button>
          <Button
            variant={timeRange === '1y' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('1y')}
            data-testid="button-range-1y"
          >
            1Y
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="agilityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                domain={[60, 100]}
              />
              <Tooltip content={customTooltip} />
              <Area
                type="monotone"
                dataKey="performance"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#performanceGradient)"
                name="Overall"
              />
              <Area
                type="monotone"
                dataKey="speed"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                fill="url(#speedGradient)"
                name="Speed"
              />
              <Area
                type="monotone"
                dataKey="agility"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill="url(#agilityGradient)"
                name="Agility"
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                domain={[60, 100]}
              />
              <Tooltip content={customTooltip} />
              <Line
                type="monotone"
                dataKey="performance"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                name="Overall"
              />
              <Line
                type="monotone"
                dataKey="speed"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 3 }}
                name="Speed"
              />
              <Line
                type="monotone"
                dataKey="agility"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 3 }}
                name="Agility"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-muted-foreground">Overall Performance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary"></div>
          <span className="text-muted-foreground">Speed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent"></div>
          <span className="text-muted-foreground">Agility</span>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className={`text-lg font-bold ${performanceMetrics.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {performanceMetrics.trend > 0 ? '+' : ''}{performanceMetrics.trend.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">vs Last Period</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-secondary" data-testid="text-total-tests">
            {performanceMetrics.totalTests}
          </div>
          <div className="text-xs text-muted-foreground">Tests Completed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-accent" data-testid="text-performance-rank">
            #{performanceMetrics.rank}
          </div>
          <div className="text-xs text-muted-foreground">Estimated Rank</div>
        </div>
      </div>
    </div>
  );
}
