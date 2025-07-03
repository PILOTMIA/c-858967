
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Users, Crown, TrendingUp, Clock, Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  experience: z.string().min(10, "Please tell us about your trading experience"),
  membershipTier: z.enum(["1month", "3month", "6month", "12month"]),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions"),
});

const ClientSignup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const membershipPlans = [
    { id: "1month", duration: "1 Month", price: "$50", savings: "", monthlyRate: "$50/Month" },
    { id: "3month", duration: "3 Months", price: "$130", savings: "Save $20", monthlyRate: "$43.3/Month" },
    { id: "6month", duration: "6 Months", price: "$220", savings: "Save $80", monthlyRate: "$36.6/Month" },
    { id: "12month", duration: "12 Months", price: "$390", savings: "Save $210", monthlyRate: "$32.5/Month" },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      experience: "",
      membershipTier: "1month",
      agreeToTerms: false,
    },
  });

  const selectedPlan = membershipPlans.find(plan => plan.id === form.watch("membershipTier"));

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    console.log('VIP Membership signup:', values);
    
    // Mock submission with membership details
    setTimeout(() => {
      alert(`Thank you! Your VIP membership request has been sent. 

Selected Plan: ${selectedPlan?.duration} - ${selectedPlan?.price}
Payment Method: PayPal (https://www.paypal.me/MENINACTIONLLC)

We will contact you with access details for the VIP Telegram group.`);
      setIsSubmitting(false);
      setIsOpen(false);
      form.reset();
    }, 2000);
  };

  const TermsAndConditions = () => (
    <ScrollArea className="h-96 w-full rounded-md border p-4">
      <div className="space-y-4 text-sm">
        <div>
          <h3 className="font-bold text-lg mb-2">Disclaimer:</h3>
          <p className="mb-4">
            Forex comes with risk and inevitably there are losses. No trading method or system is guaranteed to make profits, therefore always remember that trading can result in a loss. MEN IN ACTION LLC does not provide financial, investment or legal advice. Trading setups/analysis provided to you within this group are not solicited to enter into any trade, transaction or recommendation. You acknowledge that it is solely your decision as to which, if any, MEN IN ACTION LLC setups to use for trading.
          </p>
          <p className="mb-4">
            Past performance is not indicative of future results. MEN IN ACTION LLC will not provide advice as to the appropriateness of Forex Trading for you. If you choose to place any of the trades within this group, these are at your own risk and MEN IN ACTION LLC are not responsible for any profits or losses associated with any of the trading chart setups/analysis posted within this group. MEN IN ACTION LLC are not accountable for your trading in any way.
          </p>
          <p className="mb-4 font-semibold">
            By entering this group, you agree to the above disclaimer.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base mb-2">Chart Analysis:</h3>
          <p className="mb-4">
            It is entirely your choice whether you choose to trade using the chart set up sent, or whether you pick and choose a selection of them. Some people will place all of them, some people don't and this is personal preference. It all comes down to appropriate risk management as everybody is different, and everyone's account sizes are too. Chart analysis may give an indications of a direction. You can choose when you wish to enter, and when to exit. You don't have to enter the trade when we send it.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base mb-2">When to close trades:</h3>
          <p className="mb-4">
            Our chart analysis is an indication of direction in which a pair may go, but markets change second by second, and there are going to be times where the price reaches close to the Targets but doesn't quite. This is why we say, 'keep an eye on your trades and close when you're happy with the profit you've made'. A target is never a guarantee that the price will hit this figure, but is an informed indication of where we think it may reach.
          </p>
          <p className="mb-4">
            There are also going to be scenarios where your trades start to go negative and in to Red. This is completely normal and you shouldn't panic. Emotions can get the better of you in trading and can cause you losses. Just remember, 'it's not a loss until you lock it in as one'. This can be managed by using appropriate lot sizes. Please see the pinned message regarding lot sizes.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base mb-2">Lot sizes:</h3>
          <p>
            Lot sizes pay a crucial role in forex trading as they are your primary method of risk management. Again, it is entirely your choice as to how much you choose to trade with, but as a general rule of thumb, you should only ever risk 1-2% of your account per trade. You should never be in a position where you're having to close trades because you don't have enough margin in your account. If this is happening, you're lot sizes are too big and you're risking too much.
          </p>
        </div>
      </div>
    </ScrollArea>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold">
          <Crown className="w-4 h-4 mr-2" />
          Join VIP Membership
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            <Crown className="w-6 h-6 inline mr-2 text-yellow-500" />
            Men In Action LLC's FOREX IDEAS
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* VIP Benefits */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">💎</span>
                <p>Buy the VIP membership and you will have instant and easy access to our Forex, Cryptocurrency, Gold ideas and technical analysis.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">💡</span>
                <p>If you are a full-time trader, you would be able to use our experts' daily technical analysis for Forex pairs and Cryptocurrencies to find the best trading opportunities in order to save your time and increase your profit.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">💡</span>
                <p>If you are a student or you have any other jobs, or even if you don't have a lot experience in this market, by using the principles of money management and our technical analysis you would be able to make a second source of income for yourself.</p>
              </div>
            </div>
          </div>

          {/* Pricing Plans */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-center">🔽Premium Service Fee 🔽</h3>
            <div className="grid grid-cols-2 gap-3">
              {membershipPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    form.watch("membershipTier") === plan.id
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => form.setValue("membershipTier", plan.id as any)}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <span className="text-yellow-600 mr-1">💎</span>
                      <span className="font-semibold">{plan.duration}</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">{plan.price}</div>
                    {plan.savings && (
                      <div className="text-xs text-red-600 font-medium">{plan.savings}</div>
                    )}
                    <div className="text-xs text-gray-600">{plan.monthlyRate}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-3 space-y-1">
              <p className="text-sm">Payment method is through PayPal.</p>
              <a 
                href="https://www.paypal.me/MENINACTIONLLC" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                https://www.paypal.me/MENINACTIONLLC
              </a>
              <div className="flex items-center justify-center gap-2 text-sm text-orange-600 font-medium">
                <Clock className="w-4 h-4" />
                This offer is for a limited time
              </div>
              <p className="text-xs text-gray-600">💠VIP members also can use the offer to extend their membership for the future as well.</p>
            </div>
          </div>

          {/* Contact Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trading Experience</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about your forex trading experience..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Terms and Conditions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Terms and Conditions
                  </FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTerms(!showTerms)}
                  >
                    {showTerms ? "Hide" : "Read"} Terms
                  </Button>
                </div>
                
                {showTerms && <TermsAndConditions />}
                
                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I have read and agree to the terms and conditions, disclaimer, and understand the risks involved in forex trading.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : `Request VIP Access - ${selectedPlan?.price}`}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientSignup;
