import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  Bell,
  User,
  Sparkles,
  Settings,
  Sun,
  Moon,
  Flame,
  Snowflake,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import type { UserProfile } from '@shared/types';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/markets', icon: TrendingUp, label: 'Markets' },
  { path: '/portfolio', icon: Wallet, label: 'Portfolio' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const themeOptions: { value: UserProfile['theme']; label: string; icon: React.ElementType }[] = [
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'bull-run', label: 'Bull Run', icon: Flame },
  { value: 'crypto-winter', label: 'Crypto Winter', icon: Snowflake },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { profile, setTheme, alerts } = useAppStore();
  const activeAlerts = alerts.filter((a) => a.isActive && !a.isTriggered).length;

  const currentThemeOption = themeOptions.find((t) => t.value === profile.theme) || themeOptions[0];
  const ThemeIcon = currentThemeOption.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary to-accent rounded-lg blur opacity-30" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                CryptoVision
              </span>
            </motion.div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;

              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={`relative gap-2 ${isActive ? 'bg-secondary' : ''}`}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.path === '/alerts' && activeAlerts > 0 && (
                      <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                        {activeAlerts}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{profile.xp.toLocaleString()} XP</span>
              <Badge variant="outline" className="text-xs">Lv {profile.level}</Badge>
            </div>

            {profile.streak > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20">
                <Flame className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium text-warning">{profile.streak}</span>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-theme">
                  <ThemeIcon className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className="gap-2"
                      data-testid={`theme-${option.value}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                      {profile.theme === option.value && (
                        <span className="ml-auto text-primary">Active</span>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex-col gap-0.5 h-auto py-2 px-4 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.path === '/alerts' && activeAlerts > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
