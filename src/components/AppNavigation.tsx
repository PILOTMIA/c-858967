import { useState } from 'react';
import { Menu, X, Home, TrendingUp, BookOpen, Users, BarChart3, Calendar, Settings, PieChart, Activity, Newspaper } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

const AppNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/market-analysis', label: 'Market Analysis', icon: TrendingUp },
    { path: '/cot-analysis', label: 'COT Analysis', icon: PieChart },
    { path: '/economic-radar', label: 'Economic Radar', icon: Activity },
    { path: '/news', label: 'Market News', icon: Newspaper },
    { path: '/education', label: 'Education', icon: BookOpen },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/tools', label: 'Trading Tools', icon: BarChart3 },
    { path: '/central-bank-rates', label: 'Central Banking', icon: Calendar },
    { path: '/profile', label: 'Profile', icon: Settings },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Menu Button */}
      <div className="fixed top-16 right-4 z-50 flex gap-2">
        <ThemeToggle />
        <button
          onClick={toggleMenu}
          className="bg-foreground/10 backdrop-blur-xl text-foreground p-3 rounded-full shadow-lg hover:bg-foreground/20 transition-all border border-border/30"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 animate-fade-in" onClick={toggleMenu} />
      )}

      {/* Menu Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-card/80 backdrop-blur-2xl border-l border-border/20 shadow-2xl transform transition-all duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="p-6 pt-20">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-8">Navigation</p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-foreground text-background font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
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
