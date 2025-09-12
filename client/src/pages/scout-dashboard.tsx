import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import DesktopSidebar from "@/components/layout/desktop-sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import AthleteCard from "@/components/athlete-card";
import PerformanceChart from "@/components/performance-chart";
import ProgressRing from "@/components/ui/progress-ring";
import { 
  Search, 
  Users, 
  Video, 
  Trophy, 
  Eye, 
  ArrowUp, 
  Download, 
  BarChart3,
  Plus,
  Bell,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";

export default function ScoutDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  // Top athletes
  const { data: topAthletes, isLoading: athletesLoading } = useQuery({
    queryKey: ["/api/athletes/top/6"],
    retry: false,
  });

  // Search athletes
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/athletes", `search=${searchQuery}&sport=${selectedSport}&location=${selectedLocation}`],
    enabled: !!(searchQuery || selectedSport || selectedLocation),
    retry: false,
  });

  // Scout activity
  const { data: scoutActivity } = useQuery({
    queryKey: ["/api/scout/activity"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <h2 className="text-xl font-heading font-bold text-primary">KALA KAUSHAL</h2>
          <p className="text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const handleSearch = () => {
    // Trigger search by updating query keys
    console.log("Searching for:", { searchQuery, selectedSport, selectedLocation });
  };

  const quickActions = [
    {
      title: "New Assessment",
      description: "Create a new talent assessment",
      icon: <Plus className="h-6 w-6" />,
      color: "bg-primary/10 text-primary border-primary/30",
      action: () => console.log("New assessment")
    },
    {
      title: "Export Data",
      description: "Download athlete reports",
      icon: <Download className="h-6 w-6" />,
      color: "bg-secondary/10 text-secondary border-secondary/30",
      action: () => console.log("Export data")
    },
    {
      title: "View Analytics", 
      description: "Detailed performance insights",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "bg-accent/10 text-accent border-accent/30",
      action: () => console.log("View analytics")
    }
  ];

  const sportFilters = ["Cricket", "Football", "Athletics", "Basketball", "Volleyball", "Tennis"];
  const locationFilters = ["All Locations", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal", "Visakhapatnam", "Patna"];

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar userRole="scout" />
      
      {/* Mobile Navigation */}
      <MobileNav userRole="scout" />

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 md:p-6">
          <div className="flex items-center justify-between">
            {/* Mobile Logo */}
            <div className="md:hidden">
              <h1 className="font-heading text-xl font-bold text-primary">KALA KAUSHAL</h1>
            </div>
            
            {/* Desktop Header */}
            <div className="hidden md:block">
              <h2 className="text-2xl font-heading font-bold text-foreground">AI Sports Assessment Dashboard</h2>
              <p className="text-muted-foreground mt-1 typewriter">Discover and nurture athletic talent across India</p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <select 
                  className="bg-muted text-foreground border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="select-language"
                >
                  <option>🇬🇧 English</option>
                  <option>🇮🇳 हिंदी</option>
                  <option>🇮🇳 ગુજરાતી</option>
                </select>
              </div>
              
              {/* Notifications */}
              <button 
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 md:p-6 pb-20 md:pb-6">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glow-border hover-glow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-muted-foreground text-sm">Total Athletes</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-total-athletes">
                        {(stats as any)?.totalAthletes?.toLocaleString() || "12,847"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <ArrowUp className="h-4 w-4 text-success mr-1" />
                    <span className="text-success">{(stats as any)?.growthStats?.athletes || "+12%"}</span>
                    <span className="text-muted-foreground ml-1">this month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="glow-border hover-glow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-secondary/20 rounded-lg">
                      <Video className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-muted-foreground text-sm">Assessments</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-total-assessments">
                        {(stats as any)?.totalAssessments?.toLocaleString() || "8,932"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <ArrowUp className="h-4 w-4 text-success mr-1" />
                    <span className="text-success">{(stats as any)?.growthStats?.assessments || "+18%"}</span>
                    <span className="text-muted-foreground ml-1">this week</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="glow-border hover-glow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-accent/20 rounded-lg">
                      <Trophy className="h-6 w-6 text-accent" />
                    </div>
                    <div className="ml-4">
                      <p className="text-muted-foreground text-sm">Top Performers</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-top-performers">
                        {(stats as any)?.topPerformers?.toLocaleString() || "1,203"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <ArrowUp className="h-4 w-4 text-success mr-1" />
                    <span className="text-success">{(stats as any)?.growthStats?.performers || "+8%"}</span>
                    <span className="text-muted-foreground ml-1">identified</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="glow-border hover-glow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-muted-foreground text-sm">Scout Views</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-scout-views">
                        {(stats as any)?.scoutViews?.toLocaleString() || "24,567"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <ArrowUp className="h-4 w-4 text-success mr-1" />
                    <span className="text-success">{(stats as any)?.growthStats?.views || "+25%"}</span>
                    <span className="text-muted-foreground ml-1">this month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Search and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Search Athletes */}
            <div className="lg:col-span-2">
              <Card className="glow-border">
                <CardHeader>
                  <CardTitle className="text-lg font-heading font-bold text-foreground">Find Athletes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Search by name, location, sport..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
                        data-testid="input-search-athletes"
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value === "All Locations" ? "" : e.target.value)}
                        className="w-full bg-input border border-border text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        data-testid="select-location"
                      >
                        {locationFilters.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button 
                      onClick={handleSearch}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground ripple hover-glow"
                      data-testid="button-search"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {sportFilters.map((sport) => (
                      <Badge
                        key={sport}
                        variant={selectedSport === sport ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          selectedSport === sport 
                            ? "bg-secondary text-secondary-foreground" 
                            : "hover:bg-muted/80"
                        }`}
                        onClick={() => setSelectedSport(selectedSport === sport ? "" : sport)}
                        data-testid={`badge-sport-${sport.toLowerCase()}`}
                      >
                        {sport}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="glow-border">
                <CardHeader>
                  <CardTitle className="text-lg font-heading font-bold text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`w-full justify-start h-auto p-4 ${action.color} hover-glow`}
                      onClick={action.action}
                      data-testid={`button-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-center">
                        {action.icon}
                        <div className="ml-3 text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs opacity-80">{action.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="athletes" className="mb-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
              <TabsTrigger value="athletes" data-testid="tab-athletes">Top Athletes</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              <TabsTrigger value="activity" data-testid="tab-activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="athletes" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {athletesLoading ? (
                  [...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-muted rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-24"></div>
                            <div className="h-3 bg-muted rounded w-32"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-muted rounded"></div>
                          <div className="h-2 bg-muted rounded w-3/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  (topAthletes as any)?.map((athlete: any, index: number) => (
                    <motion.div
                      key={athlete.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <AthleteCard athlete={athlete} />
                    </motion.div>
                  ))
                )}
              </div>

              {/* Search Results */}
              {(searchQuery || selectedSport || selectedLocation) && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-heading font-bold text-foreground">
                      Search Results
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedSport("");
                        setSelectedLocation("");
                      }}
                      className="text-muted-foreground hover:text-foreground"
                      data-testid="button-clear-filters"
                    >
                      Clear Filters
                    </Button>
                  </div>
                  
                  {/* Active Filters Display */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {searchQuery && (
                      <Badge variant="secondary" className="px-3 py-1">
                        Query: "{searchQuery}"
                      </Badge>
                    )}
                    {selectedSport && (
                      <Badge variant="secondary" className="px-3 py-1">
                        Sport: {selectedSport}
                      </Badge>
                    )}
                    {selectedLocation && (
                      <Badge variant="secondary" className="px-3 py-1">
                        Location: {selectedLocation}
                      </Badge>
                    )}
                  </div>

                  {searchLoading ? (
                    <div className="text-center py-12">
                      <div className="spinner mb-4"></div>
                      <p className="text-muted-foreground">Searching athletes...</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Analyzing {(searchQuery || selectedSport || selectedLocation) ? "your criteria" : "all athletes"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {(searchResults as any)?.length > 0 ? (
                        <>
                          <div className="text-sm text-muted-foreground mb-4">
                            Found {(searchResults as any).length} athlete{(searchResults as any).length !== 1 ? 's' : ''}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(searchResults as any).map((athlete: any) => (
                              <AthleteCard key={athlete.id} athlete={athlete} />
                            ))}
                          </div>
                        </>
                      ) : (
                        <Card className="border-dashed border-2 border-muted">
                          <CardContent className="text-center py-12">
                            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                              <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h4 className="text-lg font-semibold text-foreground mb-2">
                              No Athletes Found
                            </h4>
                            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                              We couldn't find any athletes matching your current search criteria. 
                              Try adjusting your filters or search terms.
                            </p>
                            
                            {/* Suggestions */}
                            <div className="space-y-2 text-sm text-muted-foreground mb-6">
                              <p className="font-medium">Try:</p>
                              <ul className="space-y-1">
                                <li>• Searching with different keywords</li>
                                <li>• Selecting a different sport or location</li>
                                <li>• Clearing all filters to see all athletes</li>
                              </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSearchQuery("");
                                  setSelectedSport("");
                                  setSelectedLocation("");
                                }}
                                data-testid="button-clear-all-filters"
                              >
                                <Globe className="w-4 h-4 mr-2" />
                                View All Athletes
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setSearchQuery("")}
                                disabled={!searchQuery}
                                data-testid="button-clear-search"
                              >
                                Clear Search Only
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Analytics */}
                <Card className="glow-border">
                  <CardHeader>
                    <CardTitle className="text-lg font-heading font-bold text-foreground">Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center">
                        <ProgressRing value={80} size={128} strokeWidth={4} />
                        <div className="mt-4">
                          <div className="text-2xl font-bold text-primary">80%</div>
                          <div className="text-sm text-muted-foreground">Overall Score</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <div className="text-lg font-bold text-primary">1,234</div>
                          <div className="text-xs text-muted-foreground">Tests Completed</div>
                        </div>
                        <div className="bg-secondary/10 p-3 rounded-lg">
                          <div className="text-lg font-bold text-secondary">89%</div>
                          <div className="text-xs text-muted-foreground">Avg Performance</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Chart */}
                <Card className="glow-border">
                  <CardHeader>
                    <CardTitle className="text-lg font-heading font-bold text-foreground">Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PerformanceChart />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card className="glow-border">
                <CardHeader>
                  <CardTitle className="text-lg font-heading font-bold text-foreground">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        event: "New athlete registered from Chennai",
                        time: "2 minutes ago",
                        color: "bg-accent"
                      },
                      {
                        event: "Sprint assessment completed by Rakesh Kumar",
                        time: "15 minutes ago", 
                        color: "bg-primary"
                      },
                      {
                        event: "Scout viewed 5 basketball profiles",
                        time: "1 hour ago",
                        color: "bg-secondary"
                      },
                      {
                        event: "Vertical jump record broken in Maharashtra",
                        time: "3 hours ago",
                        color: "bg-accent"
                      },
                      {
                        event: "AI model updated with new detection algorithms",
                        time: "6 hours ago",
                        color: "bg-primary"
                      }
                    ].map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center space-x-3"
                      >
                        <div className={`w-2 h-2 ${activity.color} rounded-full animate-glow`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{activity.event}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
