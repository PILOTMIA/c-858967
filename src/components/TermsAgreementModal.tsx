import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, FileText, ChevronRight } from "lucide-react";

const TermsAgreementModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showFirstTimeQuestion, setShowFirstTimeQuestion] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const hasUserAgreed = localStorage.getItem('termsAgreed');
    if (!hasUserAgreed) {
      setIsOpen(true);
    } else {
      setHasAgreed(true);
    }
  }, []);

  const handleAgree = () => {
    if (agreedToTerms) {
      localStorage.setItem('termsAgreed', 'true');
      setIsOpen(false);
      setShowReview(false);
      setShowFirstTimeQuestion(true);
    }
  };

  const handleFirstTimeResponse = (isFirstTime: boolean) => {
    if (!isFirstTime) {
      localStorage.setItem('hasSeenTutorial', 'true');
    }
    setHasAgreed(true);
    setShowFirstTimeQuestion(false);
  };

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    setAgreedToTerms(checked === true);
  };

  const TermsContent = () => (
    <div className="space-y-6 text-sm text-foreground">
      <div>
        <h3 className="font-display-hero text-lg mb-3 text-foreground">Disclaimer</h3>
        <p className="mb-4 text-muted-foreground leading-relaxed">
          Forex comes with risk and inevitably there are losses. No trading method or system is guaranteed to make profits, therefore always remember that trading can result in a loss. MEN IN ACTION LLC does not provide financial, investment or legal advice. Trading setups/analysis provided to you within this group are not solicited to enter into any trade, transaction or recommendation. You acknowledge that it is solely your decision as to which, if any, MEN IN ACTION LLC setups to use for trading.
        </p>
        <p className="mb-4 text-muted-foreground leading-relaxed">
          Past performance is not indicative of future results. MEN IN ACTION LLC will not provide advice as to the appropriateness of Forex Trading for you. If you choose to place any of the trades within this group, these are at your own risk and MEN IN ACTION LLC are not responsible for any profits or losses associated with any of the trading chart setups/analysis posted within this group. MEN IN ACTION LLC are not accountable for your trading in any way.
        </p>
        <p className="mb-4 font-medium text-amber-400">
          By entering this group, you agree to the above disclaimer.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-2">Chart Analysis</h3>
        <p className="mb-4 text-muted-foreground leading-relaxed">
          It is entirely your choice whether you choose to trade using the chart set up sent, or whether you pick and choose a selection of them. Some people will place all of them, some people don't and this is personal preference. It all comes down to appropriate risk management as everybody is different, and everyone's account sizes are too. Chart analysis may give an indications of a direction. You can choose when you wish to enter, and when to exit. You don't have to enter the trade when we send it.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-2">When to Close Trades</h3>
        <p className="mb-4 text-muted-foreground leading-relaxed">
          Our chart analysis is an indication of direction in which a pair may go, but markets change second by second, and there are going to be times where the price reaches close to the Targets but doesn't quite. This is why we say, 'keep an eye on your trades and close when you're happy with the profit you've made'. A target is never a guarantee that the price will hit this figure, but is an informed indication of where we think it may reach.
        </p>
        <p className="mb-4 text-muted-foreground leading-relaxed">
          There are also going to be scenarios where your trades start to go negative and in to Red. This is completely normal and you shouldn't panic. Emotions can get the better of you in trading and can cause you losses. Just remember, 'it's not a loss until you lock it in as one'. This can be managed by using appropriate lot sizes. Please see the pinned message regarding lot sizes.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-2">Lot Sizes</h3>
        <p className="text-muted-foreground leading-relaxed">
          Lot sizes pay a crucial role in forex trading as they are your primary method of risk management. Again, it is entirely your choice as to how much you choose to trade with, but as a general rule of thumb, you should only ever risk 1-2% of your account per trade. You should never be in a position where you're having to close trades because you don't have enough margin in your account. If this is happening, you're lot sizes are too big and you're risking too much.
        </p>
      </div>
    </div>
  );

  if (!hasAgreed || showFirstTimeQuestion) {
    return (
      <>
        {/* Terms Agreement Modal */}
        <Dialog open={isOpen} onOpenChange={() => {}}>
          <DialogContent
            className="w-[calc(100vw-1rem)] max-w-[680px] max-h-[95vh] overflow-hidden p-0 bg-background/95 backdrop-blur-xl border-border/30 rounded-2xl shadow-2xl flex flex-col"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 shrink-0">
              <DialogTitle className="font-display-hero text-xl sm:text-2xl text-center text-foreground flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                MIA FX Labs — Terms &amp; Disclaimer
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-6">
              {/* Compact summary — always visible on mobile */}
              <div className="shrink-0 mb-4">
                <p className="text-center text-muted-foreground text-sm sm:text-base">
                  Please review and agree to our terms before continuing.
                </p>
              </div>

              {/* Expandable terms review */}
              {showReview ? (
                <ScrollArea className="flex-1 min-h-0 rounded-xl border border-border/30 bg-muted/20 p-4 sm:p-5">
                  <TermsContent />
                </ScrollArea>
              ) : (
                <button
                  onClick={() => setShowReview(true)}
                  className="shrink-0 w-full flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/20 p-4 text-left active:bg-muted/40 transition-colors min-h-[56px]"
                  aria-label="Review full terms and disclaimer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm sm:text-base">Review Terms &amp; Disclaimer</p>
                      <p className="text-xs text-muted-foreground">Tap to read the full agreement</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </button>
              )}

              {/* Always-visible action bar */}
              <div className="shrink-0 bg-background/95 backdrop-blur-xl pt-4 pb-5 sm:pb-6 space-y-4">
                <label className="flex items-start gap-3 rounded-xl border border-border/40 p-4 cursor-pointer active:bg-muted/40 min-h-[56px]">
                  <Checkbox
                    checked={agreedToTerms}
                    onCheckedChange={handleCheckboxChange}
                    className="h-6 w-6 border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5 shrink-0"
                  />
                  <span className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    I have read and agree to the terms and conditions, disclaimer, and understand the risks involved in forex trading.
                  </span>
                </label>

                <Button
                  onClick={handleAgree}
                  disabled={!agreedToTerms}
                  className="w-full min-h-[56px] rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base sm:text-lg transition-all disabled:opacity-40"
                >
                  I Agree — Continue
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* First Time User Question Modal */}
        <Dialog open={showFirstTimeQuestion} onOpenChange={() => {}}>
          <DialogContent
            className="w-[calc(100vw-1rem)] max-w-[480px] bg-background/95 backdrop-blur-xl border-border/30 rounded-2xl shadow-2xl"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="font-display-hero text-xl text-center text-foreground">
                Welcome to MIA FX Labs
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 text-center">
              <div>
                <p className="text-muted-foreground mb-3">
                  Are you new to our platform or forex trading in general?
                </p>
                <p className="text-sm text-muted-foreground">
                  We can show you around with a quick tutorial to help you get started.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => handleFirstTimeResponse(true)}
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 min-h-[48px]"
                >
                  Yes, show me around
                </Button>
                <Button
                  onClick={() => handleFirstTimeResponse(false)}
                  variant="outline"
                  className="rounded-full border-border/30 px-6 py-3 min-h-[48px]"
                >
                  No, I'm familiar
                </Button>
              </div>

              <div className="bg-primary/5 p-3 rounded-xl border border-border/10">
                <p className="text-xs text-muted-foreground">
                  You can always restart the tutorial from the menu if you change your mind
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
};

export default TermsAgreementModal;
