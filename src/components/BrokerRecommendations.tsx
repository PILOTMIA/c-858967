import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, Shield, TrendingUp, Globe } from "lucide-react";

const BrokerRecommendations = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Recommended Brokers</h2>
        <p className="text-muted-foreground">
          Start trading with our trusted broker partners
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MidasFX - US Clients */}
        <Card className="bg-card border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
            RECOMMENDED
          </div>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">MidasFX</CardTitle>
                <Badge variant="secondary" className="text-xs">🇺🇸 US Clients</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">Regulated US Broker</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-warning" />
                <span className="text-muted-foreground">Competitive Spreads</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Professional Charts & Tools</span>
              </div>
            </div>
            
            <div className="bg-primary/5 p-3 rounded-lg">
              <p className="text-xs text-primary font-medium">
                Perfect for US traders looking for reliable execution and competitive pricing
              </p>
            </div>

            <div className="space-y-2">
              <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                <a href="https://www.midasfx.com/?ib=1127736" target="_blank" rel="noopener noreferrer">
                  Open Live Account <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://www.midasfx.com/?ib=1127736" target="_blank" rel="noopener noreferrer">
                  Try Demo Account
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TradersWay - Global Clients */}
        <Card className="bg-card border-success/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <Globe className="h-4 w-4 text-success" />
              </div>
              <div>
                <CardTitle className="text-foreground">TradersWay</CardTitle>
                <Badge variant="outline" className="text-xs border-success text-success">🌍 Global Clients</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">International Broker</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-warning" />
                <span className="text-muted-foreground">Flexible Trading Conditions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">Multiple Account Types</span>
              </div>
            </div>
            
            <div className="bg-success/5 p-3 rounded-lg">
              <p className="text-xs text-success font-medium">
                Ideal for international traders with flexible account options and competitive spreads
              </p>
            </div>

            <div className="space-y-2">
              <Button className="w-full bg-success hover:bg-success/90" asChild>
                <a href="https://tradersway.com/" target="_blank" rel="noopener noreferrer">
                  Open Live Account <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
              <Button variant="outline" className="w-full border-success text-success hover:bg-success/10" asChild>
                <a href="https://tradersway.com/" target="_blank" rel="noopener noreferrer">
                  Try Demo Account
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-warning/5 p-4 rounded-lg border border-warning/20">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground mb-1">Important Risk Disclaimer</h4>
            <p className="text-sm text-muted-foreground">
              Trading forex involves significant risk and may not be suitable for all investors. 
              Always start with a demo account to practice our strategies risk-free before trading with real money.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerRecommendations;