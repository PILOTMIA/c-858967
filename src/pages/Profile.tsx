import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User as UserIcon, Settings, Star, TrendingUp, LogOut, Save } from "lucide-react";
import ChartPatternsDisplay from "@/components/ChartPatternsDisplay";

const ALL_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'USD/MXN',
  'EUR/JPY', 'GBP/JPY', 'EUR/GBP', 'GBP/CAD', 'AUD/JPY', 'EUR/AUD', 'GBP/AUD', 'EUR/CAD',
  'NZD/JPY', 'CAD/JPY', 'CHF/JPY', 'EUR/CHF', 'GBP/CHF', 'AUD/CHF', 'AUD/CAD', 'EUR/NZD',
  'GBP/NZD', 'XAU/USD', 'XTI/USD'
];

const TIMEFRAMES = ['1H', '4H', 'Daily', 'Weekly'];

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone_number: string | null;
  social_media_handles: Record<string, string>;
  trading_style: 'conservative' | 'moderate' | 'aggressive';
  favorite_pairs: string[];
  preferred_timeframe: string;
  notifications_enabled: boolean;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile form state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tradingStyle, setTradingStyle] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [favoritePairs, setFavoritePairs] = useState<string[]>([]);
  const [preferredTimeframe, setPreferredTimeframe] = useState('4H');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [socialMedia, setSocialMedia] = useState({
    twitter: '',
    instagram: '',
    telegram: ''
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate('/auth');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/auth');
      } else {
        // Fetch profile data
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setFullName(data.full_name || '');
        setPhoneNumber(data.phone_number || '');
        const style = data.trading_style as 'conservative' | 'moderate' | 'aggressive';
        setTradingStyle(style || 'moderate');
        setFavoritePairs(data.favorite_pairs || []);
        setPreferredTimeframe(data.preferred_timeframe || '4H');
        setNotificationsEnabled(data.notifications_enabled ?? true);
        const handles = data.social_media_handles as Record<string, string> | null;
        setSocialMedia(handles ? { twitter: handles.twitter || '', instagram: handles.instagram || '', telegram: handles.telegram || '' } : { twitter: '', instagram: '', telegram: '' });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          full_name: fullName,
          phone_number: phoneNumber,
          trading_style: tradingStyle,
          favorite_pairs: favoritePairs,
          preferred_timeframe: preferredTimeframe,
          notifications_enabled: notificationsEnabled,
          social_media_handles: socialMedia
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const toggleFavoritePair = (pair: string) => {
    setFavoritePairs(prev => 
      prev.includes(pair) 
        ? prev.filter(p => p !== pair)
        : [...prev, pair]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile & Dashboard</h1>
            <p className="text-muted-foreground">Customize your trading experience</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email || ''} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>Connect your social profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Twitter/X</Label>
                  <Input 
                    value={socialMedia.twitter} 
                    onChange={(e) => setSocialMedia({...socialMedia, twitter: e.target.value})}
                    placeholder="@username"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input 
                    value={socialMedia.instagram} 
                    onChange={(e) => setSocialMedia({...socialMedia, instagram: e.target.value})}
                    placeholder="@username"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telegram</Label>
                  <Input 
                    value={socialMedia.telegram} 
                    onChange={(e) => setSocialMedia({...socialMedia, telegram: e.target.value})}
                    placeholder="@username"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Trading Preferences */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Trading Preferences
                </CardTitle>
                <CardDescription>Customize your trading style and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Trading Style</Label>
                  <Select value={tradingStyle} onValueChange={(v: 'conservative' | 'moderate' | 'aggressive') => setTradingStyle(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      <SelectItem value="conservative">🛡️ Conservative - Lower risk, steady gains</SelectItem>
                      <SelectItem value="moderate">⚖️ Moderate - Balanced risk/reward</SelectItem>
                      <SelectItem value="aggressive">🔥 Aggressive - Higher risk, higher reward</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    {tradingStyle === 'conservative' && "Focus on high-probability setups with smaller position sizes."}
                    {tradingStyle === 'moderate' && "Balanced approach with medium position sizes and diversified entries."}
                    {tradingStyle === 'aggressive' && "Larger positions on high-conviction trades with tighter stops."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Timeframe</Label>
                  <Select value={preferredTimeframe} onValueChange={setPreferredTimeframe}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      {TIMEFRAMES.map(tf => (
                        <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive trading alerts</p>
                  </div>
                  <Switch 
                    checked={notificationsEnabled} 
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Favorite Pairs
                </CardTitle>
                <CardDescription>Select pairs to track on your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {ALL_PAIRS.map(pair => (
                    <button
                      key={pair}
                      onClick={() => toggleFavoritePair(pair)}
                      className={`text-xs px-2 py-1.5 rounded-md border transition-all ${
                        favoritePairs.includes(pair)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted border-border hover:border-primary/50'
                      }`}
                    >
                      {pair}
                    </button>
                  ))}
                </div>
                {favoritePairs.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    {favoritePairs.length} pair{favoritePairs.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Chart Patterns based on style */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Chart Patterns for You
                </CardTitle>
                <CardDescription>
                  Patterns matched to your {tradingStyle} trading style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPatternsDisplay tradingStyle={tradingStyle} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* MidasFX Banner */}
        <div className="flex justify-center my-8">
          <a 
            href="https://www.midasfx.com/?ib=1127736" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105"
          >
            <img 
              src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png" 
              alt="MidasFX Trading - Premium Forex Broker" 
              className="rounded-lg border-2 border-gray-700 shadow-lg hover:shadow-xl hover:border-primary/50"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;
