import { useState } from 'react';
import { Menu, X, Home, TrendingUp, BookOpen, Users, BarChart3, Calendar, Settings, Activity, Newspaper, Gem, Compass, Globe2, Gauge, ClipboardList } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';

const AppNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/market-analysis', label: 'Market Analysis', icon: TrendingUp },
    { path: '/weekly-playbook', label: 'Weekly Playbook', icon: ClipboardList },
    { path: '/cot-analysis', label: 'COT Analysis', icon: BarChart3 },
    { path: '/sentiment-matrix', label: 'Sentiment Matrix', icon: Compass },
    { path: '/currency-flow', label: 'Currency Flow', icon: Globe2 },
    { path: '/vix-watch', label: 'VIX Watch', icon: Gauge },
    { path: '/economic-radar', label: 'Economic Radar', icon: Activity },
    { path: '/economic-calendar', label: 'Economic Calendar', icon: Calendar },
    { path: '/news', label: 'Market News', icon: Newspaper },
    { path: '/metals', label: 'Metals / Gold', icon: Gem },
    { path: '/education', label: 'Education', icon: BookOpen },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/tools', label: 'Trading Tools', icon: BarChart3 },
    { path: '/central-bank-rates', label: 'Central Banking', icon: Calendar },
    { path: '/profile', label: 'Profile', icon: Settings },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-[46px] z-40 hidden w-[72px] flex-col items-center border-r border-border/70 bg-card/95 py-3 backdrop-blur-xl lg:flex">
        <Link to="/" className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 font-mono text-xs font-black text-primary" aria-label="MIA FX Labs dashboard">MIA</Link>
        <nav className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto px-2">
          {menuItems.slice(0, 11).map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return <Link key={item.path} to={item.path} title={item.label} aria-label={item.label} className={`flex h-10 w-10 items-center justify-center rounded-sm border transition-colors ${active ? 'border-primary/50 bg-primary/15 text-primary' : 'border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground'}`}><Icon className="h-4 w-4" /></Link>;
          })}
        </nav>
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="mt-1 h-10 w-10" onClick={toggleMenu} aria-label="Open all navigation"><Menu className="h-4 w-4" /></Button>
      </aside>

      <div className="fixed right-3 top-[54px] z-50 flex gap-2 lg:hidden">
        <ThemeToggle />
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMenu}
          className="h-10 w-10 bg-card/95 backdrop-blur-xl"
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 animate-fade-in" onClick={toggleMenu} />
      )}

      {/* Menu Panel */}
      <div className={`fixed top-0 right-0 h-full w-[min(22rem,92vw)] bg-card/95 backdrop-blur-2xl border-l border-border/70 shadow-2xl transform transition-all duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="p-6 pt-20">
          <div className="mb-6 border-b border-border/70 pb-4"><p className="hq-kicker">MIA FX Labs</p><p className="mt-1 text-xl font-black uppercase text-foreground">Trading terminal</p></div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-sm border transition-all duration-200 ${
                    isActive
                      ? 'border-primary/40 bg-primary/10 text-primary font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default AppNavigation;
