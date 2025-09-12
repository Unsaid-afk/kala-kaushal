import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GlowingButton from "@/components/ui/glowing-button";
import { 
  Play,
  Clock,
  Trophy,
  Zap,
  Target,
  TrendingUp,
  Layers,
  ArrowUp
} from "lucide-react";
import { motion } from "framer-motion";

interface TestType {
  id: string;
  name: string;
  description?: string;
  category: string;
  estimatedDuration?: number;
  difficultyLevel?: string;
  isActive: boolean;
}

interface TestSelectionProps {
  testTypes: TestType[];
  onTestSelect?: (test: TestType) => void;
  showStartButton?: boolean;
}

export default function TestSelection({ 
  testTypes, 
  onTestSelect, 
  showStartButton = true 
}: TestSelectionProps) {
  const getTestIcon = (category: string, name: string) => {
    const lowerName = name.toLowerCase();
    const lowerCategory = category.toLowerCase();
    
    if (lowerName.includes('sprint') || lowerName.includes('run')) {
      return <Zap className="h-8 w-8 text-primary animate-float" />;
    }
    if (lowerName.includes('jump') || lowerName.includes('vertical')) {
      return <ArrowUp className="h-8 w-8 text-secondary animate-float" />;
    }
    if (lowerCategory.includes('agility')) {
      return <Target className="h-8 w-8 text-accent animate-float" />;
    }
    if (lowerCategory.includes('strength')) {
      return <Trophy className="h-8 w-8 text-primary animate-float" />;
    }
    if (lowerCategory.includes('endurance')) {
      return <TrendingUp className="h-8 w-8 text-secondary animate-float" />;
    }
    
    return <Layers className="h-8 w-8 text-primary animate-float" />;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'intermediate':
        return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'advanced':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'speed':
        return 'bg-primary/10 text-primary';
      case 'agility':
        return 'bg-accent/10 text-accent';
      case 'strength':
        return 'bg-secondary/10 text-secondary';
      case 'endurance':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  if (!testTypes || testTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-heading font-bold text-foreground mb-2">
          No Tests Available
        </h3>
        <p className="text-muted-foreground">
          Tests are being prepared and will be available soon.
        </p>
      </div>
    );
  }

  const activeTests = testTypes.filter(test => test.isActive);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activeTests.map((test, index) => (
        <motion.div
          key={test.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1,
            type: "spring",
            stiffness: 200 
          }}
        >
          <Card className="test-card glow-border hover-glow h-full cursor-pointer">
            <CardContent className="p-6">
              {/* Test Icon and Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
                  {getTestIcon(test.category, test.name)}
                </div>
                
                <div className="flex flex-col gap-1">
                  <Badge 
                    variant="outline" 
                    className={getCategoryColor(test.category)}
                  >
                    {test.category}
                  </Badge>
                  {test.difficultyLevel && (
                    <Badge 
                      variant="outline" 
                      className={getDifficultyColor(test.difficultyLevel)}
                    >
                      {test.difficultyLevel}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Test Details */}
              <div className="mb-4">
                <h3 className="text-lg font-heading font-bold text-foreground mb-2">
                  {test.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {test.description || `Measure your ${test.category.toLowerCase()} performance with this ${test.difficultyLevel || 'standard'} assessment.`}
                </p>
              </div>

              {/* Test Meta */}
              {test.estimatedDuration && (
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>~{test.estimatedDuration} minutes</span>
                </div>
              )}

              {/* Action Button */}
              {showStartButton && (
                <div className="mt-auto">
                  {onTestSelect ? (
                    <GlowingButton
                      onClick={() => onTestSelect(test)}
                      className="w-full"
                      data-testid={`button-select-test-${test.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Select Test
                    </GlowingButton>
                  ) : (
                    <Button 
                      className="w-full bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                      variant="outline"
                      data-testid={`button-view-test-${test.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
