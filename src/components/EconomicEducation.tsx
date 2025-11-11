import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Briefcase, Building2, BarChart3, Percent } from "lucide-react";

const EconomicEducation = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-display flex items-center gap-3">
            📚 Economic Indicators Education
          </CardTitle>
          <CardDescription className="text-base">
            Master the fundamental economic indicators that drive forex markets
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="bonds" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
          <TabsTrigger value="bonds" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Bonds</span>
          </TabsTrigger>
          <TabsTrigger value="rates" className="flex items-center gap-2">
            <Percent className="w-4 h-4" />
            <span className="hidden sm:inline">Interest Rates</span>
          </TabsTrigger>
          <TabsTrigger value="gdp" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">GDP</span>
          </TabsTrigger>
          <TabsTrigger value="cpi" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">CPI</span>
          </TabsTrigger>
          <TabsTrigger value="ppi" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">PPI</span>
          </TabsTrigger>
        </TabsList>

        {/* Bonds Education */}
        <TabsContent value="bonds" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary" />
                Understanding Bonds & Treasury Yields
              </CardTitle>
              <CardDescription>
                Why bond markets matter for forex traders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <h3 className="font-bold text-lg text-primary mb-2">What Are Bonds?</h3>
                  <p className="text-foreground">
                    Bonds are debt securities issued by governments and corporations. When you buy a bond, you're lending money 
                    to the issuer in exchange for periodic interest payments (coupon) and the return of principal at maturity.
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>• <strong>Government Bonds:</strong> Issued by national governments (e.g., U.S. Treasuries)</li>
                    <li>• <strong>Corporate Bonds:</strong> Issued by companies to raise capital</li>
                    <li>• <strong>Municipal Bonds:</strong> Issued by states and local governments</li>
                  </ul>
                </div>

                <div className="bg-success/5 rounded-lg p-4 border border-success/20">
                  <h3 className="font-bold text-lg text-success mb-2">Types of U.S. Treasury Securities</h3>
                  <div className="grid gap-3 mt-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">T-Bills</Badge>
                      <div className="flex-1">
                        <p className="text-sm"><strong>Treasury Bills (Short-term):</strong> Mature in 1 year or less (4, 8, 13, 26, 52 weeks)</p>
                        <p className="text-xs text-muted-foreground mt-1">Used for short-term government financing, highly liquid</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">T-Notes</Badge>
                      <div className="flex-1">
                        <p className="text-sm"><strong>Treasury Notes (Medium-term):</strong> Mature in 2-10 years</p>
                        <p className="text-xs text-muted-foreground mt-1">Most commonly traded; 2-year and 10-year are key benchmarks</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">T-Bonds</Badge>
                      <div className="flex-1">
                        <p className="text-sm"><strong>Treasury Bonds (Long-term):</strong> Mature in 20-30 years</p>
                        <p className="text-xs text-muted-foreground mt-1">Preferred by pension funds and long-term investors</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">TIPS</Badge>
                      <div className="flex-1">
                        <p className="text-sm"><strong>Treasury Inflation-Protected Securities:</strong> Principal adjusts with inflation</p>
                        <p className="text-xs text-muted-foreground mt-1">Protection against inflation risk</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                  <h3 className="font-bold text-lg text-accent mb-2">Bond Yields & Prices: The Inverse Relationship</h3>
                  <div className="space-y-3">
                    <p className="text-foreground">
                      <strong>Critical Concept:</strong> Bond prices and yields move in opposite directions.
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="bg-success/10 rounded p-3 border border-success/20">
                        <div className="text-success font-bold mb-1">📈 When Yields Rise</div>
                        <ul className="text-sm space-y-1 text-foreground">
                          <li>• Bond prices fall</li>
                          <li>• Currency strengthens</li>
                          <li>• Higher returns attract foreign capital</li>
                          <li>• Often signals economic growth or inflation concerns</li>
                        </ul>
                      </div>
                      <div className="bg-destructive/10 rounded p-3 border border-destructive/20">
                        <div className="text-destructive font-bold mb-1">📉 When Yields Fall</div>
                        <ul className="text-sm space-y-1 text-foreground">
                          <li>• Bond prices rise</li>
                          <li>• Currency weakens</li>
                          <li>• Flight to safety (risk-off)</li>
                          <li>• Often signals economic slowdown or deflation fears</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <h3 className="font-bold text-lg text-primary mb-2">Why Bonds Matter for Forex Trading</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-primary/20 text-primary">1</Badge>
                      <div>
                        <strong className="text-foreground">Yield Differentials Drive Currency Flows</strong>
                        <p className="text-muted-foreground mt-1">
                          Higher yields attract foreign investment → increases demand for that currency. Traders compare 10-year yields 
                          across countries to predict currency strength.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-primary/20 text-primary">2</Badge>
                      <div>
                        <strong className="text-foreground">Yield Curve as Economic Indicator</strong>
                        <p className="text-muted-foreground mt-1">
                          The spread between short-term and long-term yields predicts economic conditions. An inverted yield curve 
                          (short rates {'>'} long rates) often precedes recessions.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-primary/20 text-primary">3</Badge>
                      <div>
                        <strong className="text-foreground">Risk Sentiment Gauge</strong>
                        <p className="text-muted-foreground mt-1">
                          When investors buy safe-haven bonds (flight to quality), it signals risk aversion, typically strengthening 
                          USD, JPY, and CHF while weakening high-yield currencies like AUD and NZD.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-primary/20 text-primary">4</Badge>
                      <div>
                        <strong className="text-foreground">Central Bank Policy Expectations</strong>
                        <p className="text-muted-foreground mt-1">
                          Bond markets price in future interest rate changes. Rising long-term yields suggest markets expect tighter 
                          monetary policy, which typically strengthens the currency.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-warning/5 rounded-lg p-4 border border-warning/20">
                  <h3 className="font-bold text-lg text-warning mb-2">🎯 Key Trading Strategies</h3>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li>• <strong>Monitor 10-Year Yield Differentials:</strong> Compare US 10Y vs EUR 10Y, JPY 10Y to predict USD/EUR, USD/JPY direction</li>
                    <li>• <strong>Watch 2-Year Yields for Near-Term Policy:</strong> More sensitive to central bank expectations</li>
                    <li>• <strong>Track Real Yields:</strong> Nominal yield minus inflation = real yield. Higher real yields support currency</li>
                    <li>• <strong>Yield Curve Flattening/Steepening:</strong> Impacts carry trades and risk sentiment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Central Bank Rates Education */}
        <TabsContent value="rates" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-6 h-6 text-primary" />
                Central Bank Interest Rates
              </CardTitle>
              <CardDescription>
                How central banks control money supply and influence currencies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <h3 className="font-bold text-lg text-primary mb-2">What Are Central Bank Rates?</h3>
                <p className="text-foreground mb-3">
                  Central bank interest rates (also called policy rates, benchmark rates, or overnight rates) are the rates at which 
                  commercial banks can borrow from the central bank. These rates influence all other interest rates in the economy.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-background rounded p-3 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">🏦 Major Central Banks</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• <strong>Fed (US):</strong> Federal Funds Rate</li>
                      <li>• <strong>ECB (EU):</strong> Main Refinancing Rate</li>
                      <li>• <strong>BoE (UK):</strong> Bank Rate</li>
                      <li>• <strong>BoJ (Japan):</strong> Policy Rate</li>
                      <li>• <strong>BoC (Canada):</strong> Overnight Rate</li>
                      <li>• <strong>RBA (Australia):</strong> Cash Rate</li>
                    </ul>
                  </div>
                  <div className="bg-background rounded p-3 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">📊 Rate Decision Frequency</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Fed: 8 meetings/year (every 6 weeks)</li>
                      <li>• ECB: 8 meetings/year</li>
                      <li>• BoE: 8 meetings/year</li>
                      <li>• BoJ: 8 meetings/year</li>
                      <li>• RBA: 11 meetings/year (monthly except Jan)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-success/5 rounded-lg p-4 border border-success/20">
                <h3 className="font-bold text-lg text-success mb-3">Why Interest Rates Matter Most</h3>
                <div className="space-y-3">
                  <div className="bg-background rounded p-3">
                    <h4 className="font-semibold text-foreground mb-2">💰 Capital Flows & Carry Trades</h4>
                    <p className="text-sm text-muted-foreground">
                      Higher interest rates attract foreign investment seeking better returns. This is the foundation of "carry trades" 
                      where investors borrow in low-rate currencies (e.g., JPY at 0.25%) and invest in high-rate currencies (e.g., USD at 5%).
                    </p>
                  </div>
                  <div className="bg-background rounded p-3">
                    <h4 className="font-semibold text-foreground mb-2">📈 Inflation Control</h4>
                    <p className="text-sm text-muted-foreground">
                      Central banks raise rates to combat inflation (tightening) and lower rates to stimulate growth (easing). 
                      Rate decisions directly reflect economic health and central bank confidence.
                    </p>
                  </div>
                  <div className="bg-background rounded p-3">
                    <h4 className="font-semibold text-foreground mb-2">🔮 Forward Guidance & Expectations</h4>
                    <p className="text-sm text-muted-foreground">
                      Markets move on rate expectations, not just current rates. If the Fed signals future hikes, USD strengthens 
                      immediately even before the actual rate change. This is why "dot plots" and central bank speeches matter.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                <h3 className="font-bold text-lg text-accent mb-3">Rate Differential Trading Strategy</h3>
                <p className="text-foreground mb-3">
                  The interest rate differential between two countries is the <strong>single most important fundamental factor</strong> for 
                  currency pairs.
                </p>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-success mb-2">Example: USD/JPY</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fed Rate:</span>
                      <span className="font-mono font-bold text-foreground">5.50%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">BoJ Rate:</span>
                      <span className="font-mono font-bold text-foreground">0.25%</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between">
                      <span className="text-foreground font-semibold">Rate Differential:</span>
                      <span className="font-mono font-bold text-primary">+5.25%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      This massive differential keeps USD/JPY elevated and supports carry trades. If the Fed cuts or BoJ hikes, 
                      this spread narrows → USD/JPY falls.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-warning/5 rounded-lg p-4 border border-warning/20">
                <h3 className="font-bold text-lg text-warning mb-2">🎯 Trading Central Bank Events</h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>• <strong>Before Decision:</strong> Position based on consensus expectations and economic data</li>
                  <li>• <strong>Rate Surprise:</strong> Unexpected changes cause sharp, immediate price moves (often 100+ pips)</li>
                  <li>• <strong>Statement & Press Conference:</strong> Forward guidance matters more than the decision itself</li>
                  <li>• <strong>Hawkish vs Dovish:</strong> Hawkish (pro-rate hikes) = currency up, Dovish (pro-rate cuts) = currency down</li>
                  <li>• <strong>Dot Plots (Fed):</strong> Show where FOMC members expect rates in future - moves markets significantly</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GDP Education */}
        <TabsContent value="gdp" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                Gross Domestic Product (GDP)
              </CardTitle>
              <CardDescription>
                The ultimate measure of economic health and growth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <h3 className="font-bold text-lg text-primary mb-2">What Is GDP?</h3>
                <p className="text-foreground mb-3">
                  GDP (Gross Domestic Product) is the total monetary value of all finished goods and services produced within a country 
                  during a specific time period. It's the broadest measure of economic activity.
                </p>
                <div className="bg-background rounded p-3 border border-border">
                  <p className="font-mono text-sm text-foreground">
                    GDP = C + I + G + (X - M)
                  </p>
                  <ul className="text-xs space-y-1 text-muted-foreground mt-2">
                    <li>C = Consumer Spending (typically 60-70% of GDP)</li>
                    <li>I = Business Investment</li>
                    <li>G = Government Spending</li>
                    <li>X - M = Net Exports (Exports minus Imports)</li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-success/5 rounded-lg p-4 border border-success/20">
                  <h3 className="font-bold text-success mb-2">📊 Types of GDP</h3>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li>• <strong>Nominal GDP:</strong> At current prices</li>
                    <li>• <strong>Real GDP:</strong> Adjusted for inflation (more important)</li>
                    <li>• <strong>GDP Growth Rate:</strong> Percentage change quarter-over-quarter or year-over-year</li>
                    <li>• <strong>GDP Per Capita:</strong> GDP divided by population</li>
                  </ul>
                </div>
                <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                  <h3 className="font-bold text-accent mb-2">📅 Release Schedule</h3>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li>• <strong>Advance:</strong> ~1 month after quarter end (most volatile)</li>
                    <li>• <strong>Preliminary:</strong> ~2 months after quarter</li>
                    <li>• <strong>Final:</strong> ~3 months after quarter</li>
                    <li className="text-xs text-muted-foreground mt-2">The advance reading has the biggest market impact</li>
                  </ul>
                </div>
              </div>

              <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                <h3 className="font-bold text-lg text-accent mb-3">Why GDP Matters for Forex</h3>
                <div className="space-y-3">
                  <div className="bg-background rounded p-3 border border-border">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Badge className="bg-success/20 text-success">Strong GDP</Badge>
                      <span>leads to Currency Appreciation</span>
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Higher growth attracts foreign investment</li>
                      <li>• Central bank may raise interest rates to prevent overheating</li>
                      <li>• Improved employment and corporate profits</li>
                      <li>• Example: US GDP beats expectations → USD strengthens</li>
                    </ul>
                  </div>
                  <div className="bg-background rounded p-3 border border-border">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Badge className="bg-destructive/20 text-destructive">Weak GDP</Badge>
                      <span>leads to Currency Depreciation</span>
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Signals economic slowdown or recession</li>
                      <li>• Central bank may cut rates to stimulate growth</li>
                      <li>• Reduced foreign investment appeal</li>
                      <li>• Example: Eurozone GDP contraction → EUR weakens</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <h3 className="font-bold text-lg text-primary mb-2">🎯 GDP Trading Strategy</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary/20 text-primary">1</Badge>
                    <div>
                      <strong className="text-foreground">Compare Actual vs Forecast</strong>
                      <p className="text-muted-foreground mt-1">
                        Markets move on surprises. GDP growth of 2.5% vs expected 2.0% = positive surprise = currency up.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary/20 text-primary">2</Badge>
                    <div>
                      <strong className="text-foreground">Watch GDP Components</strong>
                      <p className="text-muted-foreground mt-1">
                        Strong consumer spending (C) and business investment (I) = sustainable growth. Weak exports = trade concerns.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary/20 text-primary">3</Badge>
                    <div>
                      <strong className="text-foreground">Context Matters</strong>
                      <p className="text-muted-foreground mt-1">
                        GDP revision surprises can move markets. If final GDP is significantly different from advance, reassess positions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-warning/5 rounded-lg p-4 border border-warning/20">
                <h3 className="font-bold text-warning mb-2">⚡ Key GDP Benchmarks</h3>
                <ul className="text-sm space-y-1 text-foreground">
                  <li>• <strong>Above 3%:</strong> Strong growth (often leads to rate hikes)</li>
                  <li>• <strong>2-3%:</strong> Healthy, sustainable growth</li>
                  <li>• <strong>1-2%:</strong> Moderate growth</li>
                  <li>• <strong>0-1%:</strong> Stagnation</li>
                  <li>• <strong>Negative:</strong> Recession (2 consecutive negative quarters)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CPI Education */}
        <TabsContent value="cpi" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Consumer Price Index (CPI)
              </CardTitle>
              <CardDescription>
                The most watched inflation indicator that moves markets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <h3 className="font-bold text-lg text-primary mb-2">What Is CPI?</h3>
                <p className="text-foreground mb-3">
                  The Consumer Price Index (CPI) measures the average change in prices paid by consumers for a basket of goods and 
                  services over time. It's the primary gauge of inflation affecting everyday purchases.
                </p>
                <div className="bg-background rounded p-3 border border-border">
                  <h4 className="font-semibold text-foreground mb-2">📦 CPI Basket Categories</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>• Food & Beverages</div>
                    <div>• Housing (biggest weight ~32%)</div>
                    <div>• Apparel</div>
                    <div>• Transportation</div>
                    <div>• Medical Care</div>
                    <div>• Recreation</div>
                    <div>• Education</div>
                    <div>• Other Goods & Services</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-success/5 rounded-lg p-4 border border-success/20">
                  <h3 className="font-bold text-success mb-3">📊 Types of CPI</h3>
                  <div className="space-y-3">
                    <div>
                      <Badge className="bg-success/20 text-success mb-1">Headline CPI</Badge>
                      <p className="text-sm text-foreground">Includes all items in the basket, including food and energy</p>
                    </div>
                    <div>
                      <Badge className="bg-primary/20 text-primary mb-1">Core CPI</Badge>
                      <p className="text-sm text-foreground">
                        <strong>Most Important:</strong> Excludes food and energy (volatile). Fed watches this closely.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                  <h3 className="font-bold text-accent mb-3">📅 Release Info</h3>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li>• <strong>Frequency:</strong> Monthly</li>
                    <li>• <strong>Release Day:</strong> Mid-month for previous month</li>
                    <li>• <strong>Time:</strong> 8:30 AM ET (US)</li>
                    <li>• <strong>Source:</strong> Bureau of Labor Statistics</li>
                    <li className="text-xs text-muted-foreground mt-2">One of the highest-impact data releases</li>
                  </ul>
                </div>
              </div>

              <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                <h3 className="font-bold text-lg text-accent mb-3">Why CPI Dominates Forex Markets</h3>
                <div className="space-y-3">
                  <div className="bg-background rounded p-3 border border-border">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Badge className="bg-destructive/20 text-destructive">High CPI</Badge>
                      <span>leads to Hawkish Central Bank and Currency UP</span>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      When inflation is above target (usually 2%), central banks raise interest rates to cool the economy. 
                      Higher rates = stronger currency. CPI above expectations often causes immediate currency appreciation.
                    </p>
                  </div>
                  <div className="bg-background rounded p-3 border border-border">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Badge className="bg-success/20 text-success">Low CPI</Badge>
                      <span>leads to Dovish Central Bank and Currency DOWN</span>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Low inflation gives central banks room to cut rates or keep them low to stimulate growth. 
                      Lower rates = weaker currency. Below-target CPI may trigger rate cut expectations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <h3 className="font-bold text-lg text-primary mb-3">🎯 CPI Trading Strategy</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary/20 text-primary">1</Badge>
                    <div>
                      <strong className="text-foreground">Focus on Core CPI</strong>
                      <p className="text-muted-foreground mt-1">
                        Markets react more to Core CPI (ex-food & energy) because it's smoother and what the Fed targets.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary/20 text-primary">2</Badge>
                    <div>
                      <strong className="text-foreground">Watch Month-over-Month AND Year-over-Year</strong>
                      <p className="text-muted-foreground mt-1">
                        MoM shows recent trend; YoY shows overall inflation trajectory. Both matter for rate expectations.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary/20 text-primary">3</Badge>
                    <div>
                      <strong className="text-foreground">Compare to Central Bank Target</strong>
                      <p className="text-muted-foreground mt-1">
                        Most central banks target 2% inflation. CPI consistently above 3% = rate hikes coming. Below 1% = cuts likely.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary/20 text-primary">4</Badge>
                    <div>
                      <strong className="text-foreground">Anticipate Volatility</strong>
                      <p className="text-muted-foreground mt-1">
                        CPI releases often cause 50-100+ pip moves in major pairs within minutes. Use tight stops and be prepared.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-warning/5 rounded-lg p-4 border border-warning/20">
                <h3 className="font-bold text-warning mb-2">⚡ CPI Interpretation Guide</h3>
                <div className="space-y-2 text-sm text-foreground">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-destructive/10 rounded p-2">
                    <span><strong>Above 4% YoY:</strong></span>
                    <Badge className="bg-destructive/20 text-destructive">High Inflation - Aggressive Hikes</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-warning/10 rounded p-2">
                    <span><strong>2.5-4% YoY:</strong></span>
                    <Badge className="bg-warning/20 text-warning">Elevated - Likely Rate Hikes</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-success/10 rounded p-2">
                    <span><strong>1.5-2.5% YoY:</strong></span>
                    <Badge className="bg-success/20 text-success">Target Range - Rates Stable</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-primary/10 rounded p-2">
                    <span><strong>Below 1.5% YoY:</strong></span>
                    <Badge className="bg-primary/20 text-primary">Low Inflation - Rate Cuts Possible</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PPI Education */}
        <TabsContent value="ppi" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                Producer Price Index (PPI)
              </CardTitle>
              <CardDescription>
                Leading inflation indicator from the producer's perspective
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <h3 className="font-bold text-lg text-primary mb-2">What Is PPI?</h3>
                <p className="text-foreground mb-3">
                  The Producer Price Index (PPI) measures the average change in selling prices received by domestic producers for their 
                  output. It tracks inflation at the wholesale level before it reaches consumers.
                </p>
                <div className="bg-background rounded p-3 border border-border">
                  <h4 className="font-semibold text-foreground mb-2">🏭 PPI Categories</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <strong>Final Demand:</strong> Goods and services sold for final use (most important)</li>
                    <li>• <strong>Intermediate Demand:</strong> Goods used in production of other goods</li>
                    <li>• <strong>Crude Goods:</strong> Raw materials (oil, metals, agricultural products)</li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-success/5 rounded-lg p-4 border border-success/20">
                  <h3 className="font-bold text-success mb-3">🔄 PPI vs CPI</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <Badge className="bg-primary/20 text-primary mb-1">PPI</Badge>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Measures producer prices</li>
                        <li>• Leading indicator</li>
                        <li>• Excludes imports</li>
                        <li>• Includes raw materials</li>
                      </ul>
                    </div>
                    <div>
                      <Badge className="bg-success/20 text-success mb-1">CPI</Badge>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Measures consumer prices</li>
                        <li>• Lagging indicator</li>
                        <li>• Includes imports</li>
                        <li>• Final retail prices</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                  <h3 className="font-bold text-accent mb-3">📅 Release Info</h3>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li>• <strong>Frequency:</strong> Monthly</li>
                    <li>• <strong>Timing:</strong> Released before CPI</li>
                    <li>• <strong>Time:</strong> 8:30 AM ET (US)</li>
                    <li>• <strong>Source:</strong> Bureau of Labor Statistics</li>
                    <li className="text-xs text-muted-foreground mt-2">Used to predict upcoming CPI trends</li>
                  </ul>
                </div>
              </div>

              <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                <h3 className="font-bold text-lg text-accent mb-3">Why PPI Matters for Forex</h3>
                <div className="space-y-3">
                  <div className="bg-background rounded p-3 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">💡 Leading Inflation Indicator</h4>
                    <p className="text-sm text-muted-foreground">
                      Rising producer costs eventually get passed to consumers. High PPI today often means high CPI next month. 
                      Traders use PPI to anticipate CPI and position ahead of rate expectations.
                    </p>
                  </div>
                  <div className="bg-background rounded p-3 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">🏭 Supply Chain Insights</h4>
                    <p className="text-sm text-muted-foreground">
                      PPI reveals inflationary pressures in the production pipeline. Surging raw material costs (crude PPI) signal 
                      potential inflation even before it shows up in final goods.
                    </p>
                  </div>
                  <div className="bg-background rounded p-3 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">📊 Corporate Profit Margins</h4>
                    <p className="text-sm text-muted-foreground">
                      When PPI rises faster than CPI, companies may struggle to pass costs to consumers, squeezing margins. 
                      This affects stock markets and risk sentiment, indirectly impacting currencies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <h3 className="font-bold text-lg text-primary mb-3">🎯 PPI Trading Strategy</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary/20 text-primary">1</Badge>
                    <div>
                      <strong className="text-foreground">Use PPI to Forecast CPI</strong>
                      <p className="text-muted-foreground mt-1">
                        If PPI surges unexpectedly, expect higher CPI next month. Position accordingly for central bank reaction.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary/20 text-primary">2</Badge>
                    <div>
                      <strong className="text-foreground">Monitor Core PPI</strong>
                      <p className="text-muted-foreground mt-1">
                        Like CPI, Core PPI (ex-food & energy) is more important for sustained inflation trends. Markets focus here.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary/20 text-primary">3</Badge>
                    <div>
                      <strong className="text-foreground">Watch Commodity-Heavy Currencies</strong>
                      <p className="text-muted-foreground mt-1">
                        Rising crude/commodity PPI often strengthens AUD, CAD, NZD (commodity exporters) and weakens importers like JPY.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary/20 text-primary">4</Badge>
                    <div>
                      <strong className="text-foreground">Less Volatile Than CPI</strong>
                      <p className="text-muted-foreground mt-1">
                        PPI releases typically cause smaller market moves than CPI, but still important for confirming inflation narrative.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-warning/5 rounded-lg p-4 border border-warning/20">
                <h3 className="font-bold text-warning mb-2">📈 PPI-to-CPI Transmission</h3>
                <div className="space-y-3">
                  <div className="bg-background rounded p-3 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">1️⃣</span>
                      <span className="font-semibold text-foreground">Raw Material Costs Rise (Crude PPI)</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8">Oil prices spike, metals surge, agricultural costs up</p>
                  </div>
                  <div className="bg-background rounded p-3 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">2️⃣</span>
                      <span className="font-semibold text-foreground">Producers Pay More (PPI Rises)</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8">Manufacturing and processing costs increase, shown in PPI data</p>
                  </div>
                  <div className="bg-background rounded p-3 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">3️⃣</span>
                      <span className="font-semibold text-foreground">Costs Passed to Consumers (CPI Rises)</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8">Retail prices increase 1-3 months later, reflected in CPI</p>
                  </div>
                  <div className="bg-background rounded p-3 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">4️⃣</span>
                      <span className="font-semibold text-foreground">Central Bank Reacts (Rate Hikes)</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8">Fed/ECB raises rates to control inflation → Currency strengthens</p>
                  </div>
                </div>
              </div>

              <div className="bg-success/5 rounded-lg p-4 border border-success/20">
                <h3 className="font-bold text-success mb-2">✅ Key Takeaway</h3>
                <p className="text-foreground">
                  <strong>PPI is the "early warning system" for inflation.</strong> While CPI gets more attention, savvy traders watch PPI 
                  to position ahead of CPI surprises and central bank policy shifts. A sustained divergence between PPI and CPI 
                  (PPI rising faster) signals building inflation pressure that will eventually reach consumers.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EconomicEducation;
