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

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tradingStyle, setTradingStyle] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [favoritePairs, setFavoritePairs] = useState<string[]>([]);
  const [preferredTimeframe, setPreferredTimeframe] = useState('4H');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [socialMedia, setSocialMedia] = useState({ twitter: '', instagram: '', telegram: '' });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) navigate('/auth');
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) navigate('/auth');
      else fetchProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
      if (error && error.code !== 'PGRST116') console.error('Error fetching profile:', error);
      if (data) {
        setFullName(data.full_name || '');
        setPhoneNumber(data.phone_number || '');
        setTradingStyle((data.trading_style as any) || 'moderate');
        setFavoritePairs(data.favorite_pairs || []);
        setPreferredTimeframe(data.preferred_timeframe || '4H');
        setNotificationsEnabled(data.notifications_enabled ?? true);
        const handles = data.social_media_handles as Record<string, string> | null;
        setSocialMedia(handles ? { twitter: handles.twitter || '', instagram: handles.instagram || '', telegram: handles.telegram || '' } : { twitter: '', instagram: '', telegram: '' });
      }
    } catch (error) { console.error('Error:', error); }
    finally { setIsLoading(false); }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        user_id: user.id, email: user.email, full_name: fullName, phone_number: phoneNumber,
        trading_style: tradingStyle, favorite_pairs: favoritePairs, preferred_timeframe: preferredTimeframe,
        notifications_enabled: notificationsEnabled, social_media_handles: socialMedia
      }, { onConflict: 'user_id' });
      if (error) throw error;
      toast.success('Profile saved successfully!');
    } catch (error) { console.error('Error saving profile:', error); toast.error('Failed to save profile'); }
    finally { setIsSaving(false); }
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); toast.success('Signed out'); navigate('/'); };
  const toggleFavoritePair = (pair: string) => setFavoritePairs(prev => prev.includes(pair) ? prev.filter(p => p !== pair) : [...prev, pair]);

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-2">Profile</h1>
            <p className="text-muted-foreground font-light">Customize your trading experience</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handleSignOut} variant="outline" className="rounded-full border-border/30">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div className="space-y-6">
            <Card className="bg-card/30 backdrop-blur-sm border-border/30 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><UserIcon className="w-4 h-4" /> Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Email</Label><Input value={user.email || ''} disabled className="bg-muted/30 rounded-xl" /></div>
                <div className="space-y-2"><Label>Full Name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your name" className="bg-card/30 border-border/30 rounded-xl" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+1 (555) 123-4567" className="bg-card/30 border-border/30 rounded-xl" /></div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 backdrop-blur-sm border-border/30 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Social Media</CardTitle>
                <CardDescription>Connect your social profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Twitter/X</Label><Input value={socialMedia.twitter} onChange={(e) => setSocialMedia({...socialMedia, twitter: e.target.value})} placeholder="@username" className="bg-card/30 border-border/30 rounded-xl" /></div>
                <div className="space-y-2"><Label>Instagram</Label><Input value={socialMedia.instagram} onChange={(e) => setSocialMedia({...socialMedia, instagram: e.target.value})} placeholder="@username" className="bg-card/30 border-border/30 rounded-xl" /></div>
                <div className="space-y-2"><Label>Telegram</Label><Input value={socialMedia.telegram} onChange={(e) => setSocialMedia({...socialMedia, telegram: e.target.value})} placeholder="@username" className="bg-card/30 border-border/30 rounded-xl" /></div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Preferences */}
          <div className="space-y-6">
            <Card className="bg-card/30 backdrop-blur-sm border-border/30 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Settings className="w-4 h-4" /> Trading Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Trading Style</Label>
                  <Select value={tradingStyle} onValueChange={(v: any) => setTradingStyle(v)}>
                    <SelectTrigger className="bg-card/30 border-border/30 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      <SelectItem value="conservative">🛡️ Conservative</SelectItem>
                      <SelectItem value="moderate">⚖️ Moderate</SelectItem>
                      <SelectItem value="aggressive">🔥 Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Timeframe</Label>
                  <Select value={preferredTimeframe} onValueChange={setPreferredTimeframe}>
                    <SelectTrigger className="bg-card/30 border-border/30 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      {TIMEFRAMES.map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div><Label>Email Notifications</Label><p className="text-xs text-muted-foreground">Receive trading alerts</p></div>
                  <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 backdrop-blur-sm border-border/30 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Star className="w-4 h-4 text-amber-400" /> Favorite Pairs</CardTitle>
                <CardDescription>Select pairs to track</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {ALL_PAIRS.map(pair => (
                    <button key={pair} onClick={() => toggleFavoritePair(pair)}
                      className={`text-xs px-2 py-1.5 rounded-lg border transition-all ${
                        favoritePairs.includes(pair) ? 'bg-foreground text-background border-foreground' : 'bg-card/20 border-border/30 hover:border-border/60'
                      }`}
                    >{pair}</button>
                  ))}
                </div>
                {favoritePairs.length > 0 && <p className="text-xs text-muted-foreground mt-3">{favoritePairs.length} pair{favoritePairs.length > 1 ? 's' : ''} selected</p>}
              </CardContent>
            </Card>
          </div>

          {/* Chart Patterns */}
          <Card className="bg-card/30 backdrop-blur-sm border-border/30 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="w-4 h-4" /> Chart Patterns for You</CardTitle>
              <CardDescription>Matched to your {tradingStyle} style</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartPatternsDisplay tradingStyle={tradingStyle} />
            </CardContent>
          </Card>
        </div>

        {/* MidasFX Banner */}
        <div className="flex justify-center mt-12">
          <a href="https://www.midasfx.com/?ib=1127736" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity duration-500">
            <img src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png" alt="MidasFX Trading" className="rounded-xl max-w-[468px]" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;
