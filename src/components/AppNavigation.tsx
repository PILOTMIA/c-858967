
import { useState } from 'react';
import { Menu, X, Home, TrendingUp, BookOpen, Users, BarChart3, Calendar, Settings, PieChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

const AppNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/market-analysis', label: 'Market Analysis', icon: TrendingUp },
    { path: '/cot-analysis', label: 'COT Analysis', icon: PieChart },
    { path: '/education', label: 'Education', icon: BookOpen },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/tools', label: 'Trading Tools', icon: BarChart3 },
    { path: '/central-bank-rates', label: 'Central Bank Rates', icon: Calendar },
    { path: '/profile', label: 'Profile', icon: Settings },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Menu Button and Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <ThemeToggle />
        <button
          onClick={toggleMenu}
          className="bg-card border border-border text-foreground p-3 rounded-lg shadow-lg hover:bg-accent transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-card border-l border-border text-foreground transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 pt-20">
          <h2 className="text-2xl font-bold mb-8">Navigation</h2>
          <nav className="space-y-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleMenu}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent text-muted-foreground hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
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
