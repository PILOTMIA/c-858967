import { AlertTriangle, Info, ShieldAlert, Scale, FileWarning, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

const RiskDisclaimer = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <AlertTriangle className="w-10 h-10 text-destructive" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Risk Disclosure & Disclaimer</h1>
            <p className="text-muted-foreground">Last Updated: December 10, 2024</p>
          </div>
        </div>

        {/* Critical Warning Banner */}
        <Alert variant="destructive" className="mb-8 border-2 border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="text-base font-semibold">
            ⚠️ CRITICAL WARNING
            <p className="mt-2 font-normal">
              TRADING AND INVESTING IN FINANCIAL MARKETS INVOLVES SUBSTANTIAL RISK OF LOSS. YOU CAN LOSE SOME OR ALL OF YOUR INVESTED CAPITAL. THIS PLATFORM PROVIDES EDUCATIONAL CONTENT ONLY AND DOES NOT OFFER FINANCIAL, INVESTMENT, OR TRADING ADVICE.
            </p>
          </AlertDescription>
        </Alert>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. ABOUT THIS DISCLOSURE</h2>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  This Risk Disclosure and Disclaimer ("Disclosure") is provided by Men In Action LLC ("we," "us," "our," or "Company"). This Disclosure applies to all users of the MIA Trading platform (the "Platform").
                </p>
                <p className="text-foreground font-semibold">
                  By using the Platform, you acknowledge that you have read, understood, and agree to the risks described in this Disclosure.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. EDUCATIONAL PLATFORM - NOT FINANCIAL ADVICE</h2>
            
            <Alert className="mb-4 bg-primary/10 border-primary/30">
              <Info className="h-5 w-5 text-primary" />
              <AlertDescription className="text-primary font-medium">
                Educational Purpose Only
                <p className="mt-2 font-normal text-muted-foreground">
                  MIA Trading is an educational and analytical platform designed to provide market analysis, economic data visualization, chart pattern recognition, and educational resources for learning about financial markets.
                </p>
              </AlertDescription>
            </Alert>

            <Card className="bg-card border-border mb-4">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">2.1 No Trading Signals or Recommendations</h3>
                <p className="text-foreground font-semibold mb-3">MIA TRADING DOES NOT PROVIDE:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Trading signals or alerts</li>
                  <li>Buy or sell recommendations</li>
                  <li>Investment advice or financial advisory services</li>
                  <li>Portfolio management services</li>
                  <li>Trade execution services</li>
                  <li>Personalized financial planning</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border mb-4">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">2.2 Educational Content</h3>
                <p className="text-muted-foreground mb-3">
                  All content provided on the Platform—including but not limited to market analysis, economic data, chart patterns, AI-generated insights, reports, educational materials, and commentary—is for <strong className="text-foreground">informational and educational purposes only</strong>.
                </p>
                <p className="text-foreground font-semibold">
                  This content should NOT be construed as financial, investment, trading, tax, or legal advice.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border mb-4">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">2.3 Your Independent Responsibility</h3>
                <p className="text-muted-foreground mb-3">You are solely and exclusively responsible for:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>All investment and trading decisions you make</li>
                  <li>Evaluating the risks and suitability of any investment</li>
                  <li>Conducting your own due diligence and research</li>
                  <li>Consulting with qualified and licensed financial advisors, tax professionals, or attorneys before making any investment decisions</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">2.4 No Account Management</h3>
                <p className="text-muted-foreground mb-3">We do <strong className="text-foreground">NOT</strong>:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Manage, control, direct, or advise on your trading accounts</li>
                  <li>Have access to your brokerage, investment, or financial accounts</li>
                  <li>Execute trades on your behalf</li>
                  <li>Make investment decisions for you</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  The management of your financial accounts is entirely your responsibility, and we have no involvement, liability, or responsibility for your account activities or results.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. HIGH RISK OF LOSS - COMPREHENSIVE WARNING</h2>
            
            <Alert variant="destructive" className="mb-4 bg-destructive/10 border-destructive/50">
              <ShieldAlert className="h-5 w-5" />
              <AlertDescription className="font-semibold">
                ⛔ SUBSTANTIAL RISK OF FINANCIAL LOSS
                <p className="mt-2 font-normal">
                  TRADING FOREIGN EXCHANGE (FOREX), FUTURES, OPTIONS, CONTRACTS FOR DIFFERENCE (CFDs), CRYPTOCURRENCIES, STOCKS, COMMODITIES, BONDS, AND OTHER FINANCIAL INSTRUMENTS CARRIES A HIGH LEVEL OF RISK AND IS NOT SUITABLE FOR ALL INVESTORS.
                </p>
              </AlertDescription>
            </Alert>

            <Card className="bg-card border-border mb-4">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">3.1 Risk of Total Loss</h3>
                <p className="text-destructive font-bold mb-3">YOU CAN LOSE SOME OR ALL OF YOUR INVESTED CAPITAL.</p>
                <p className="text-muted-foreground mb-3">You expressly acknowledge and understand that:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>The possibility exists that you could sustain a <strong className="text-foreground">loss of some or all of your initial investment</strong></li>
                  <li>You should not invest money that you <strong className="text-foreground">cannot afford to lose</strong></li>
                  <li>Losses can accumulate rapidly, especially in volatile markets</li>
                  <li>You may lose more than your initial deposit, particularly when using leverage</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border mb-4">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">3.2 Leverage and Margin Risk</h3>
                <p className="text-foreground font-semibold mb-3">Leverage magnifies both potential profits AND potential losses.</p>
                <p className="text-muted-foreground mb-3">When trading on margin or using leverage:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Small price movements can result in substantial gains or losses</li>
                  <li>You can lose more than your initial margin deposit</li>
                  <li>You may be required to deposit additional funds on short notice to maintain your positions</li>
                  <li>If you fail to meet a margin call, your positions may be liquidated at a loss</li>
                  <li>You will be liable for any resulting deficit in your account</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">3.3 Market Volatility</h3>
                <p className="text-muted-foreground mb-3">Financial markets are inherently volatile and unpredictable:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Prices can change rapidly, dramatically, and without warning</li>
                  <li>Market conditions can deteriorate quickly</li>
                  <li>Sudden news events can cause extreme price fluctuations</li>
                  <li>Liquidity can dry up, making it difficult or impossible to exit positions</li>
                  <li>Gaps in pricing can occur, bypassing stop-loss orders</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. SPECIFIC INVESTMENT RISKS</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">4.1 Forex Trading</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                    <li>24-hour markets with constant price movement</li>
                    <li>High leverage magnifies gains and losses</li>
                    <li>Currency values affected by global events</li>
                    <li>Counterparty risk with broker/dealer</li>
                    <li>Potential for catastrophic losses</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">4.2 Futures and Options</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                    <li>Options can expire worthless (100% loss)</li>
                    <li>Futures can result in unlimited losses</li>
                    <li>Complex pricing and time decay</li>
                    <li>Limited time to be correct</li>
                    <li>High leverage requirements</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">4.3 Cryptocurrencies</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                    <li>Extreme price volatility (50%+ daily swings)</li>
                    <li>Unregulated markets in many jurisdictions</li>
                    <li>Risk of hacking, fraud, and theft</li>
                    <li>Limited consumer protections</li>
                    <li>Regulatory uncertainty</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">4.4 Stocks and Commodities</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                    <li>Company-specific risks (bankruptcy, scandals)</li>
                    <li>Market-wide risks (recessions, crashes)</li>
                    <li>Sector-specific regulatory changes</li>
                    <li>Weather and geopolitical events</li>
                    <li>Stocks can become worthless</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. NO PERFORMANCE GUARANTEES</h2>
            
            <Card className="bg-card border-border mb-4">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">5.1 No Guarantees of Profit</h3>
                <p className="text-foreground font-semibold mb-3">We make NO representations, warranties, promises, or guarantees that:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>You will earn any money, income, or profits</li>
                  <li>You will make successful or profitable trades</li>
                  <li>You will achieve any specific financial results</li>
                  <li>Any analytical content will lead to profitable trading</li>
                  <li>Historical trends or patterns will repeat</li>
                  <li>The Platform will help you avoid losses</li>
                </ul>
              </CardContent>
            </Card>

            <Alert className="mb-4 bg-amber-500/10 border-amber-500/30">
              <FileWarning className="h-5 w-5 text-amber-500" />
              <AlertDescription className="text-amber-600 dark:text-amber-400 font-semibold">
                5.2 Past Performance Not Indicative of Future Results
                <p className="mt-2 font-normal text-muted-foreground">
                  PAST PERFORMANCE IS NOT INDICATIVE, PREDICTIVE, OR A GUARANTEE OF FUTURE RESULTS. Historical market data, backtested strategies, and past trading results do not predict future performance and should not be relied upon for investment decisions.
                </p>
              </AlertDescription>
            </Alert>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">5.3 Hypothetical Performance</h3>
                <p className="text-foreground font-semibold mb-3">HYPOTHETICAL OR SIMULATED PERFORMANCE RESULTS HAVE INHERENT LIMITATIONS.</p>
                <p className="text-muted-foreground">
                  Simulated results do not represent actual trading, are not impacted by fees or slippage, may not account for liquidity constraints, and are designed with the benefit of hindsight.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. SUITABILITY AND DUE DILIGENCE</h2>
            
            <Card className="bg-card border-border mb-4">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">6.1 Assess Your Suitability</h3>
                <p className="text-foreground font-semibold mb-3">Trading and investing may not be appropriate for everyone.</p>
                <p className="text-muted-foreground mb-3">Before engaging in any trading activities, carefully consider:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong className="text-foreground">Investment Objectives:</strong> What are your specific financial goals?</li>
                  <li><strong className="text-foreground">Experience Level:</strong> Do you have sufficient knowledge?</li>
                  <li><strong className="text-foreground">Risk Tolerance:</strong> Can you tolerate substantial losses?</li>
                  <li><strong className="text-foreground">Financial Situation:</strong> Can you afford to lose the money?</li>
                  <li><strong className="text-foreground">Time Horizon:</strong> Do you have time to monitor investments?</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">6.2 Consult Professional Advisors</h3>
                <p className="text-foreground font-semibold mb-3">You should consult with qualified, licensed professionals:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong className="text-foreground">Financial Advisor:</strong> For personalized investment advice</li>
                  <li><strong className="text-foreground">Tax Professional:</strong> For tax implications and strategies</li>
                  <li><strong className="text-foreground">Attorney:</strong> For legal considerations</li>
                  <li><strong className="text-foreground">Accountant:</strong> For financial planning</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. DATA ACCURACY AND DISCLAIMER</h2>
            
            <Card className="bg-card border-border mb-4">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">7.1 Third-Party Data Sources</h3>
                <p className="text-muted-foreground">
                  MIA Trading aggregates data from various third-party sources including government agencies (FRED, CFTC, BLS, ECB, BOE, BOJ, etc.), financial data providers, and market exchanges.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border mb-4">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">7.2 No Warranty of Accuracy</h3>
                <p className="text-foreground font-semibold mb-3">
                  While we strive for accuracy, we do NOT guarantee the accuracy, completeness, timeliness, or reliability of any data or information provided.
                </p>
                <p className="text-muted-foreground">
                  Data may be delayed, incomplete, inaccurate, subject to errors, or revised after publication.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">7.3 AI-Generated Content</h3>
                <p className="text-muted-foreground">
                  Some content on the Platform is generated or enhanced by artificial intelligence. AI-generated content may contain errors, inaccuracies, or biases and should be independently verified before making decisions.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. REGULATORY COMPLIANCE</h2>
            
            <Card className="bg-card border-border mb-4">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">8.1 US Regulatory Compliance</h3>
                <p className="text-muted-foreground mb-3">
                  This platform complies with National Futures Association (NFA) requirements for educational materials.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>No part of this Platform constitutes a solicitation to buy or sell any futures, options, or forex contracts</li>
                  <li>CFTC RULE 4.41: Hypothetical or simulated performance results have certain limitations</li>
                  <li>The content does not constitute investment advice as defined by the SEC</li>
                  <li>We are not registered investment advisors</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">8.2 UK & EU Regulatory Compliance</h3>
                <p className="text-muted-foreground mb-3">
                  This Platform provides general market analysis and educational content only. It does not constitute investment advice under MiFID II.
                </p>
                <Alert variant="destructive" className="mt-4 bg-destructive/10 border-destructive/50">
                  <AlertDescription>
                    <strong>CFD Risk Warning:</strong> CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. You should consider whether you understand how CFDs work and whether you can afford the high risk of losing your money.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. LIMITATION OF LIABILITY</h2>
            
            <Alert variant="destructive" className="mb-4 bg-destructive/10 border-destructive/50">
              <Scale className="h-5 w-5" />
              <AlertDescription className="font-semibold">
                9.1 No Liability for Trading Losses
                <p className="mt-2 font-normal">
                  MEN IN ACTION LLC IS NOT LIABLE FOR ANY TRADING LOSSES, INVESTMENT LOSSES, FINANCIAL LOSSES, OR DAMAGES OF ANY KIND RESULTING FROM: your use of or reliance on the Platform, any decisions you make based on Platform content, market movements or volatility, errors in data or content, or your interpretation of information provided.
                </p>
              </AlertDescription>
            </Alert>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">9.2 Platform "As Is"</h3>
                <p className="text-muted-foreground">
                  THE PLATFORM AND ALL CONTENT ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, OR NON-INFRINGEMENT.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. YOUR ACKNOWLEDGMENT</h2>
            
            <Card className="bg-primary/10 border-primary/30 mb-4">
              <CardContent className="pt-6">
                <p className="text-foreground font-semibold mb-4">BY USING THE MIA TRADING PLATFORM, YOU ACKNOWLEDGE AND AGREE THAT:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>You have read and understood this entire Risk Disclosure and Disclaimer</li>
                  <li>You understand that trading and investing carry substantial risk of loss</li>
                  <li>You can lose some or all of your invested capital</li>
                  <li>MIA Trading provides educational content only, not financial advice</li>
                  <li>You are solely responsible for your own investment and trading decisions</li>
                  <li>You will consult qualified professionals before making investment decisions</li>
                  <li>Past performance does not guarantee future results</li>
                  <li>Men In Action LLC is not liable for any trading or investment losses you may incur</li>
                  <li>You accept all risks associated with using the Platform and making financial decisions</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">11. CONTACT INFORMATION</h2>
            
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="text-foreground font-semibold mb-2">Men In Action LLC</p>
                    <p className="text-muted-foreground">
                      If you have questions about this Risk Disclosure, please contact us through our platform support channels.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Final Warning */}
          <Alert variant="destructive" className="border-2 border-destructive bg-destructive/10">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="font-bold text-lg">
              Final Warning
              <p className="mt-2 font-normal text-base">
                IF YOU DO NOT UNDERSTAND THE RISKS DESCRIBED IN THIS DISCLOSURE, OR IF YOU CANNOT AFFORD TO LOSE THE MONEY YOU ARE CONSIDERING INVESTING, YOU SHOULD NOT TRADE OR INVEST IN FINANCIAL MARKETS.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default RiskDisclaimer;
