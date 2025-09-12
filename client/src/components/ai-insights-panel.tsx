import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  RefreshCw,
  Zap,
  Shield,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";

interface AIInsightsProps {
  athleteId: string;
}

interface AthleteInsights {
  overallAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  potentialRating: number;
  improvementAreas: {
    area: string;
    priority: 'high' | 'medium' | 'low';
    recommendation: string;
  }[];
  comparisonToPeers: {
    percentile: number;
    description: string;
  };
}

export default function AIInsightsPanel({ athleteId }: AIInsightsProps) {
  const { data: insights, isLoading, error, refetch, isFetching } = useQuery<AthleteInsights>({
    queryKey: ["/api/athletes", athleteId, "ai-insights"],
    enabled: !!athleteId,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500'; 
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-3 h-3" />;
      case 'medium': return <Target className="w-3 h-3" />;
      case 'low': return <Shield className="w-3 h-3" />;
      default: return <Target className="w-3 h-3" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="glow-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-heading font-bold text-foreground flex items-center">
            <Brain className="w-5 h-5 mr-2 text-primary" />
            AI Performance Insights
          </CardTitle>
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glow-border border-red-500/50">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-heading font-bold text-foreground mb-2">
            AI Analysis Unavailable
          </h3>
          <p className="text-muted-foreground mb-4">
            Unable to generate AI insights. Please try again later.
          </p>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm"
            data-testid="button-retry-insights"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="glow-border">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-heading font-bold text-foreground mb-2">
            No Assessment Data
          </h3>
          <p className="text-muted-foreground">
            Complete some assessments to unlock AI-powered insights about this athlete's performance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glow-border hover-glow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-heading font-bold text-foreground flex items-center">
            <Brain className="w-5 h-5 mr-2 text-primary" />
            AI Performance Insights
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh-insights"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Analysis */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-foreground flex items-center">
              <Zap className="w-4 h-4 mr-2 text-secondary" />
              Overall Assessment
            </h4>
            <p className="text-muted-foreground leading-relaxed" data-testid="text-overall-analysis">
              {insights.overallAnalysis}
            </p>
          </div>

          {/* Potential Rating & Peer Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Potential Rating</span>
                  <span className="text-2xl font-bold text-primary" data-testid="text-potential-rating">
                    {insights.potentialRating.toFixed(1)}/10
                  </span>
                </div>
                <Progress 
                  value={insights.potentialRating * 10} 
                  className="h-2"
                  data-testid="progress-potential-rating"
                />
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    Peer Comparison
                  </span>
                  <span className="text-2xl font-bold text-secondary" data-testid="text-peer-percentile">
                    {insights.comparisonToPeers.percentile}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground" data-testid="text-peer-description">
                  {insights.comparisonToPeers.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-heading font-semibold text-foreground flex items-center mb-3">
                <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                Strengths
              </h4>
              <div className="space-y-2">
                {insights.strengths.map((strength, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20"
                    data-testid={`strength-${index}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span className="text-sm text-foreground">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-foreground flex items-center mb-3">
                <TrendingDown className="w-4 h-4 mr-2 text-red-500" />
                Areas for Improvement
              </h4>
              <div className="space-y-2">
                {insights.weaknesses.map((weakness, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20"
                    data-testid={`weakness-${index}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    <span className="text-sm text-foreground">{weakness}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Improvement Areas with Priorities */}
          {insights.improvementAreas && insights.improvementAreas.length > 0 && (
            <div>
              <h4 className="font-heading font-semibold text-foreground flex items-center mb-3">
                <Target className="w-4 h-4 mr-2 text-primary" />
                Priority Improvements
              </h4>
              <div className="space-y-3">
                {insights.improvementAreas.map((area, index) => (
                  <div 
                    key={index} 
                    className="p-3 rounded-lg bg-card/50 border border-border/50"
                    data-testid={`improvement-area-${index}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{area.area}</span>
                      <Badge className={`text-white ${getPriorityColor(area.priority)}`}>
                        {getPriorityIcon(area.priority)}
                        <span className="ml-1 capitalize">{area.priority}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {area.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <h4 className="font-heading font-semibold text-foreground flex items-center mb-3">
              <Target className="w-4 h-4 mr-2 text-secondary" />
              AI Recommendations
            </h4>
            <div className="space-y-2">
              {insights.recommendations.map((recommendation, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20"
                  data-testid={`recommendation-${index}`}
                >
                  <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                  <span className="text-sm text-foreground">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}