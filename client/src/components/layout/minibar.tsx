import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Trophy, 
  Activity, 
  Upload, 
  Search, 
  Sun, 
  Moon, 
  Type, 
  Eye, 
  User,
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function MiniBar() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State for accessibility features
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('fontSize') || '16');
  });
  
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('highContrast') === 'true';
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Apply font size changes
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

  // Apply high contrast changes
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
      localStorage.setItem('highContrast', 'true');
    } else {
      root.classList.remove('high-contrast');
      localStorage.setItem('highContrast', 'false');
    }
  }, [highContrast]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  
  const increaseFontSize = () => {
    if (fontSize < 24) setFontSize(fontSize + 2);
  };
  
  const decreaseFontSize = () => {
    if (fontSize > 12) setFontSize(fontSize - 2);
  };
  
  const toggleHighContrast = () => setHighContrast(!highContrast);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/kala-pradarshan?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleShareVideo = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to share your sports videos",
        variant: "destructive",
      });
      return;
    }
    setLocation('/kala-pradarshan?upload=1');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/kala-pradarshan', label: 'Showcase', icon: Trophy },
    { path: '/leaderboard', label: 'Leaderboard', icon: Activity },
    { path: '/assessment', label: 'Assess', icon: Activity },
  ];

  const currentPath = location;

  return (
    <>
      {/* Add custom CSS for high contrast mode */}
      <style>{`
        .high-contrast {
          --background: hsl(0 0% 100%);
          --foreground: hsl(0 0% 0%);
          --card: hsl(0 0% 100%);
          --card-foreground: hsl(0 0% 0%);
          --border: hsl(0 0% 0%);
          --primary: hsl(0 0% 0%);
          --primary-foreground: hsl(0 0% 100%);
          --secondary: hsl(0 0% 90%);
          --secondary-foreground: hsl(0 0% 0%);
          --muted: hsl(0 0% 95%);
          --muted-foreground: hsl(0 0% 0%);
        }
        .high-contrast.dark {
          --background: hsl(0 0% 0%);
          --foreground: hsl(0 0% 100%);
          --card: hsl(0 0% 0%);
          --card-foreground: hsl(0 0% 100%);
          --border: hsl(0 0% 100%);
          --primary: hsl(0 0% 100%);
          --primary-foreground: hsl(0 0% 0%);
          --secondary: hsl(0 0% 10%);
          --secondary-foreground: hsl(0 0% 100%);
          --muted: hsl(0 0% 5%);
          --muted-foreground: hsl(0 0% 100%);
        }
      `}</style>

      {/* Main MiniBar */}
      <header 
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="banner"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            
            {/* Logo/Brand */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 font-bold text-lg"
              aria-label="Kala Kaushal Home"
              data-testid="logo-link"
            >
              <span className="text-primary">🏆</span>
              <span>Kala Kaushal</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main menu">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                
                return (
                  <Link 
                    key={item.path}
                    href={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center relative max-w-sm">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Search showcase..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-48"
                  aria-label="Search showcase videos"
                  data-testid="search-input"
                />
              </div>
            </form>

            {/* Action Buttons & Accessibility Controls */}
            <div className="flex items-center space-x-2">
              
              {/* Share Video Button */}
              <Button
                onClick={handleShareVideo}
                variant="default"
                size="sm"
                className="hidden sm:flex items-center"
                aria-label="Share sports video"
                data-testid="share-video-btn"
              >
                <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                Share Video
              </Button>

              {/* Accessibility Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    aria-label="Accessibility options"
                    data-testid="accessibility-menu"
                  >
                    <Eye className="w-4 h-4" aria-hidden="true" />
                    <ChevronDown className="w-3 h-3 ml-1" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={toggleTheme} data-testid="theme-toggle">
                    {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={toggleHighContrast} data-testid="contrast-toggle">
                    <Eye className="w-4 h-4 mr-2" />
                    High Contrast: {highContrast ? 'On' : 'Off'}
                  </DropdownMenuItem>
                  
                  <Separator />
                  
                  <div className="px-2 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Text Size</span>
                      <div className="flex items-center space-x-1">
                        <Button 
                          onClick={decreaseFontSize} 
                          variant="outline" 
                          size="sm"
                          disabled={fontSize <= 12}
                          aria-label="Decrease text size"
                          data-testid="decrease-font-size"
                        >
                          <Type className="w-3 h-3" />
                          -
                        </Button>
                        <Badge variant="secondary" className="text-xs px-2">
                          {fontSize}px
                        </Badge>
                        <Button 
                          onClick={increaseFontSize} 
                          variant="outline" 
                          size="sm"
                          disabled={fontSize >= 24}
                          aria-label="Increase text size"
                          data-testid="increase-font-size"
                        >
                          <Type className="w-3 h-3" />
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center"
                      aria-label="User menu"
                      data-testid="user-menu"
                    >
                      <User className="w-4 h-4 mr-2" aria-hidden="true" />
                      {user?.firstName || 'User'}
                      <ChevronDown className="w-3 h-3 ml-1" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => setLocation('/athlete-dashboard')} 
                      data-testid="user-menu-athlete-dashboard"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setLocation('/scout-dashboard')} 
                      data-testid="user-menu-scout-dashboard"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Scout View
                    </DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/api/auth/logout'} 
                      data-testid="user-menu-logout"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => window.location.href = '/api/auth/login'}
                  variant="default"
                  size="sm"
                  aria-label="Login"
                  data-testid="login-btn"
                >
                  Login
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle mobile menu"
                aria-expanded={isMenuOpen}
                data-testid="mobile-menu-toggle"
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div 
              className="md:hidden py-4 space-y-2 border-t bg-background"
              role="navigation" 
              aria-label="Mobile menu"
              data-testid="mobile-menu"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                
                return (
                  <Link 
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className="w-4 h-4 mr-3" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
              
              <Separator className="my-2" />
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-4">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    type="search"
                    placeholder="Search showcase..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                    aria-label="Search showcase videos"
                    data-testid="mobile-search-input"
                  />
                </div>
              </form>
              
              {/* Mobile Share Video */}
              <div className="px-4">
                <Button
                  onClick={handleShareVideo}
                  variant="default"
                  size="sm"
                  className="w-full flex items-center justify-center"
                  aria-label="Share sports video"
                  data-testid="mobile-share-video-btn"
                >
                  <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                  Share Video
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}