import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) {
        toast.error(error.message.includes('Invalid login credentials') ? 'Invalid email or password.' : error.message);
      } else {
        toast.success('Welcome back!');
        navigate('/profile');
      }
    } catch { toast.error('An unexpected error occurred'); }
    finally { setIsLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) { toast.error('Passwords do not match'); return; }
    if (signupPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: { emailRedirectTo: `${window.location.origin}/profile`, data: { full_name: fullName, phone_number: phoneNumber } }
      });
      if (error) {
        toast.error(error.message.includes('already registered') ? 'This email is already registered.' : error.message);
      } else {
        toast.success('Account created! Welcome to MIA FX Labs.');
        navigate('/profile');
      }
    } catch { toast.error('An unexpected error occurred'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-primary/15 animate-glow-pulse pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] rounded-full bg-violet-500/10 animate-glow-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-border/30 shadow-2xl rounded-3xl relative z-10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="font-display-hero text-3xl font-bold text-foreground">
            MIA FX Labs
          </CardTitle>
          <CardDescription className="text-muted-foreground font-light">
            Your professional trading hub
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-card/50 border border-border/30 rounded-full p-1">
              <TabsTrigger value="login" className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full transition-all">Login</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full transition-all">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="login-email" type="email" placeholder="your@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="pl-10 bg-card/30 border-border/30 rounded-xl" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="pl-10 pr-10 bg-card/30 border-border/30 rounded-xl" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full h-11" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="full-name" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 bg-card/30 border-border/30 rounded-xl" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-email" type="email" placeholder="your@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="pl-10 bg-card/30 border-border/30 rounded-xl" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="pl-10 bg-card/30 border-border/30 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="pl-10 pr-10 bg-card/30 border-border/30 rounded-xl" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="confirm-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} className="pl-10 bg-card/30 border-border/30 rounded-xl" required />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full h-11" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
