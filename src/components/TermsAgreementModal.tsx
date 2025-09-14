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
    // Check if user has already agreed to terms
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
      // If not first time, mark tutorial as seen
      localStorage.setItem('hasSeenTutorial', 'true');
    }
    // If first time, leave hasSeenTutorial unset so tutorial will show
    setHasAgreed(true);
    setShowFirstTimeQuestion(false);
  };

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    setAgreedToTerms(checked === true);
  };

  const TermsContent = () => (
    <ScrollArea className="h-96 w-full rounded-md border border-gray-600 bg-black p-4">
      <div className="space-y-4 text-sm text-white">
        <div>
          <h3 className="font-bold text-lg mb-2 text-white">Disclaimer:</h3>
          <p className="mb-4 text-gray-300">
            Forex comes with risk and inevitably there are losses. No trading method or system is guaranteed to make profits, therefore always remember that trading can result in a loss. MEN IN ACTION LLC does not provide financial, investment or legal advice. Trading setups/analysis provided to you within this group are not solicited to enter into any trade, transaction or recommendation. You acknowledge that it is solely your decision as to which, if any, MEN IN ACTION LLC setups to use for trading.
          </p>
          <p className="mb-4 text-gray-300">
            Past performance is not indicative of future results. MEN IN ACTION LLC will not provide advice as to the appropriateness of Forex Trading for you. If you choose to place any of the trades within this group, these are at your own risk and MEN IN ACTION LLC are not responsible for any profits or losses associated with any of the trading chart setups/analysis posted within this group. MEN IN ACTION LLC are not accountable for your trading in any way.
          </p>
          <p className="mb-4 font-semibold text-yellow-400">
            By entering this group, you agree to the above disclaimer.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base mb-2 text-white">Chart Analysis:</h3>
          <p className="mb-4 text-gray-300">
            It is entirely your choice whether you choose to trade using the chart set up sent, or whether you pick and choose a selection of them. Some people will place all of them, some people don't and this is personal preference. It all comes down to appropriate risk management as everybody is different, and everyone's account sizes are too. Chart analysis may give an indications of a direction. You can choose when you wish to enter, and when to exit. You don't have to enter the trade when we send it.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base mb-2 text-white">When to close trades:</h3>
          <p className="mb-4 text-gray-300">
            Our chart analysis is an indication of direction in which a pair may go, but markets change second by second, and there are going to be times where the price reaches close to the Targets but doesn't quite. This is why we say, 'keep an eye on your trades and close when you're happy with the profit you've made'. A target is never a guarantee that the price will hit this figure, but is an informed indication of where we think it may reach.
          </p>
          <p className="mb-4 text-gray-300">
            There are also going to be scenarios where your trades start to go negative and in to Red. This is completely normal and you shouldn't panic. Emotions can get the better of you in trading and can cause you losses. Just remember, 'it's not a loss until you lock it in as one'. This can be managed by using appropriate lot sizes. Please see the pinned message regarding lot sizes.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base mb-2 text-white">Lot sizes:</h3>
          <p className="text-gray-300">
            Lot sizes pay a crucial role in forex trading as they are your primary method of risk management. Again, it is entirely your choice as to how much you choose to trade with, but as a general rule of thumb, you should only ever risk 1-2% of your account per trade. You should never be in a position where you're having to close trades because you don't have enough margin in your account. If this is happening, you're lot sizes are too big and you're risking too much.
          </p>
        </div>
      </div>
    </ScrollArea>
  );

  // Don't render the main content until user has agreed and answered first-time question
  if (!hasAgreed || showFirstTimeQuestion) {
    return (
      <>
        {/* Terms Agreement Modal */}
        <Dialog open={isOpen} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-black border-gray-700" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-white">
                <Shield className="w-6 h-6 inline mr-2 text-yellow-500" />
                Men In Action LLC - Terms & Disclaimer
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-white font-semibold mb-4">Please read before continuing:</p>
              </div>

              <TermsContent />

              <div className="space-y-4">
                <div className="flex flex-row items-start space-x-3 space-y-0">
                  <Checkbox
                    checked={agreedToTerms}
                    onCheckedChange={handleCheckboxChange}
                    className="border-gray-600 data-[state=checked]:bg-yellow-500"
                  />
                  <div className="space-y-1 leading-none">
                    <label className="text-sm text-gray-200 cursor-pointer">
                      I have read and agree to the terms and conditions, disclaimer, and understand the risks involved in forex trading.
                    </label>
                  </div>
                </div>

                <Button
                  onClick={handleAgree}
                  disabled={!agreedToTerms}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold disabled:opacity-50"
                >
                  I Agree - Continue to Website
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* First Time User Question Modal */}
        <Dialog open={showFirstTimeQuestion} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-[500px] bg-background border-border" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center text-foreground">
                Welcome to Men In Action Trading!
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 text-center">
              <div>
                <p className="text-muted-foreground mb-4">
                  Are you new to our platform or forex trading in general?
                </p>
                <p className="text-sm text-muted-foreground">
                  We can show you around with a quick tutorial to help you get started!
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => handleFirstTimeResponse(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2"
                >
                  Yes, show me around!
                </Button>
                <Button
                  onClick={() => handleFirstTimeResponse(false)}
                  variant="outline"
                  className="px-6 py-2"
                >
                  No, I'm familiar
                </Button>
              </div>

              <div className="bg-primary/5 p-3 rounded-lg">
                <p className="text-xs text-primary">
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
