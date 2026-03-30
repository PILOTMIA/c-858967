import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield } from "lucide-react";

const TermsAgreementModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showFirstTimeQuestion, setShowFirstTimeQuestion] = useState(false);

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
    <ScrollArea className="h-96 w-full rounded-xl border border-border/30 bg-muted/20 p-5">
      <div className="space-y-5 text-sm text-foreground">
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
    </ScrollArea>
  );

  if (!hasAgreed || showFirstTimeQuestion) {
    return (
      <>
        {/* Terms Agreement Modal */}
        <Dialog open={isOpen} onOpenChange={() => {}}>
          <DialogContent
            className="sm:max-w-[680px] max-h-[90vh] bg-background/95 backdrop-blur-xl border-border/30 rounded-2xl shadow-2xl"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="font-display-hero text-2xl text-center text-foreground flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                MIA FX Labs — Terms & Disclaimer
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <p className="text-center text-muted-foreground text-sm">Please read before continuing</p>

              <TermsContent />

              <div className="space-y-4">
                <div className="flex flex-row items-start space-x-3">
                  <Checkbox
                    checked={agreedToTerms}
                    onCheckedChange={handleCheckboxChange}
                    className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
                  />
                  <label className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                    I have read and agree to the terms and conditions, disclaimer, and understand the risks involved in forex trading.
                  </label>
                </div>

                <Button
                  onClick={handleAgree}
                  disabled={!agreedToTerms}
                  className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 transition-all disabled:opacity-40"
                >
                  I Agree — Continue to MIA FX Labs
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* First Time User Question Modal */}
        <Dialog open={showFirstTimeQuestion} onOpenChange={() => {}}>
          <DialogContent
            className="sm:max-w-[480px] bg-background/95 backdrop-blur-xl border-border/30 rounded-2xl shadow-2xl"
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

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => handleFirstTimeResponse(true)}
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2"
                >
                  Yes, show me around
                </Button>
                <Button
                  onClick={() => handleFirstTimeResponse(false)}
                  variant="outline"
                  className="rounded-full border-border/30 px-6 py-2"
                >
                  No, I'm familiar
                </Button>
              </div>

              <div className="bg-primary/5 p-3 rounded-xl border border-border/10">
                <p className="text-xs text-muted-foreground">
                  💡 You can always restart the tutorial from the menu if you change your mind
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
