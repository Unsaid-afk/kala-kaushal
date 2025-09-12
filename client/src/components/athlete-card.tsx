import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Trophy, 
  Star, 
  Eye,
  TrendingUp 
} from "lucide-react";
import { motion } from "framer-motion";

interface AthleteCardProps {
  athlete: {
    id: string;
    userId?: string;
    age?: number;
    location?: string;
    primarySport?: string;
    overallRating?: string;
    isVerified?: boolean;
  };
  showViewButton?: boolean;
  index?: number;
}

export default function AthleteCard({ 
  athlete, 
  showViewButton = true, 
  index = 0 
}: AthleteCardProps) {
  const overallRating = parseFloat(athlete.overallRating || "0");
  const ratingStars = Math.floor(overallRating / 2); // Convert to 5-star scale
  
  // Mock performance metrics for demonstration
  const performanceMetrics = [
    { name: "Speed", value: Math.floor(Math.random() * 30) + 70 },
    { name: "Agility", value: Math.floor(Math.random() * 30) + 70 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="athlete-card glow-border hover-glow transition-all duration-300">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarImage 
                src={`/athlete-${athlete.id?.slice(-1) || '1'}.jpg`} 
                alt="Athlete" 
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {athlete.userId?.charAt(0)?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-bold text-foreground truncate">
                  Athlete #{athlete.id?.slice(-4) || "0000"}
                </h4>
                {athlete.isVerified && (
                  <Badge className="bg-accent text-accent-foreground px-2 py-0.5 text-xs">
                    <Trophy className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                {athlete.primarySport && (
                  <>
                    <Trophy className="w-3 h-3 mr-1" />
                    <span className="mr-2">{athlete.primarySport}</span>
                  </>
                )}
                {athlete.location && (
                  <>
                    <span className="mx-1">•</span>
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{athlete.location}</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center mt-1">
                <div className="flex text-secondary text-sm mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < ratingStars 
                          ? "text-secondary fill-current" 
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">
                  {overallRating.toFixed(1)}/10
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-3 mb-4">
            {performanceMetrics.map((metric, index) => (
              <div key={metric.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{metric.name}</span>
                  <span className="text-foreground">{metric.value}%</span>
                </div>
                <Progress 
                  value={metric.value} 
                  className="h-2"
                />
              </div>
            ))}
          </div>

          {/* Action Button */}
          {showViewButton && (
            <Link href={`/athlete/${athlete.id}`}>
              <Button 
                className={`w-full text-sm transition-all ${
                  overallRating >= 8 
                    ? "bg-accent/10 text-accent border-accent/30 hover:bg-accent/20" 
                    : overallRating >= 6
                    ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                    : "bg-secondary/10 text-secondary border-secondary/30 hover:bg-secondary/20"
                }`}
                variant="outline"
                data-testid={`button-view-athlete-${athlete.id}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
