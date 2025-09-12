import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Users, Trophy, Zap, Shield, Globe, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "AI-Powered Analysis",
      description: "Advanced computer vision analyzes your athletic performance with precision"
    },
    {
      icon: <Users className="h-8 w-8 text-secondary" />,
      title: "Scout Connections",
      description: "Connect directly with verified sports scouts and talent recruiters"
    },
    {
      icon: <Trophy className="h-8 w-8 text-accent" />,
      title: "Performance Tracking",
      description: "Track your progress and compete on national leaderboards"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Verified Results",
      description: "AI ensures authentic assessments with tamper-proof analysis"
    },
    {
      icon: <Globe className="h-8 w-8 text-secondary" />,
      title: "Multi-Language",
      description: "Available in Hindi, Gujarati, English and more regional languages"
    },
    {
      icon: <Star className="h-8 w-8 text-accent" />,
      title: "Achievements",
      description: "Earn badges and unlock achievements as you improve your skills"
    }
  ];

  const stats = [
    { value: "12,847", label: "Registered Athletes" },
    { value: "8,932", label: "Assessments Completed" },
    { value: "1,203", label: "Talent Discovered" },
    { value: "24,567", label: "Scout Views" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-heading font-bold mb-6 animate-glow">
              KALA KAUSHAL
            </h1>
            <div className="typewriter text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              AI-Powered Sports Talent Assessment Platform
            </div>
            <p className="text-lg md:text-xl text-foreground mb-8 max-w-3xl mx-auto">
              Democratizing athletic talent discovery across India with AI-powered video analysis, 
              connecting aspiring athletes with scouts and opportunities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg ripple hover-glow"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login-primary"
            >
              <PlayCircle className="mr-2 h-6 w-6" />
              Start Your Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-secondary text-secondary hover:bg-secondary/10 px-8 py-4 text-lg hover-glow"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login-scout"
            >
              <Users className="mr-2 h-6 w-6" />
              Scout Dashboard
            </Button>
          </motion.div>

          {/* Language Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            <Badge variant="secondary" className="text-sm">🇬🇧 English</Badge>
            <Badge variant="secondary" className="text-sm">🇮🇳 हिंदी</Badge>
            <Badge variant="secondary" className="text-sm">🇮🇳 ગુજરાતી</Badge>
            <Badge variant="secondary" className="text-sm">+ More Languages</Badge>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Revolutionizing Sports Talent Discovery
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our cutting-edge AI technology and comprehensive platform provide everything 
              needed to identify, nurture, and showcase athletic talent.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="glow-border hover-glow h-full">
                  <CardHeader>
                    <div className="mb-4 p-3 bg-muted rounded-lg w-fit">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-heading font-bold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get started in just three simple steps and begin your journey to athletic excellence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Profile",
                description: "Sign up and create your athlete profile with basic information and sports preferences.",
                color: "text-primary"
              },
              {
                step: "02", 
                title: "Record Tests",
                description: "Use your smartphone to record standardized fitness tests with AI-guided instructions.",
                color: "text-secondary"
              },
              {
                step: "03",
                title: "Get Discovered",
                description: "Receive performance analysis, track progress, and get noticed by verified scouts.",
                color: "text-accent"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`text-6xl font-heading font-bold ${step.color} mb-4 animate-float`} 
                     style={{ animationDelay: `${index * 0.5}s` }}>
                  {step.step}
                </div>
                <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Ready to Unlock Your Potential?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of athletes already using Kala Kaushal to showcase their talent 
              and connect with opportunities across India.
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-xl ripple hover-glow animate-glow"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-get-started"
            >
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-heading font-bold text-primary mb-4">KALA KAUSHAL</h3>
          <p className="text-muted-foreground mb-4">
            Democratizing athletic talent discovery across India
          </p>
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
