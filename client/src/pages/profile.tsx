import { motion } from 'framer-motion';
import {
  User,
  Sparkles,
  Flame,
  Trophy,
  Target,
  Compass,
  Rocket,
  Gem,
  Sun,
  Moon,
  PieChart,
  TrendingUp,
  Bell,
  Fish,
  Award,
  Lock,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { timeAgo, cn } from '@/lib/utils';
import type { Achievement } from '@shared/types';

const iconMap: Record<string, React.ElementType> = {
  Rocket,
  Gem,
  PieChart,
  Sun,
  Moon,
  Flame,
  Compass,
  Fish,
  TrendingUp,
  Bell,
  Trophy,
  Target,
  Award,
};

const categoryColors: Record<Achievement['category'], string> = {
  trading: 'from-purple-500 to-indigo-500',
  streak: 'from-orange-500 to-amber-500',
  portfolio: 'from-emerald-500 to-teal-500',
  exploration: 'from-blue-500 to-cyan-500',
};

export default function Profile() {
  const { profile, portfolio } = useAppStore();

  const unlockedAchievements = profile.achievements.filter((a) => a.isUnlocked);
  const lockedAchievements = profile.achievements.filter((a) => !a.isUnlocked);

  const xpProgress = (profile.xp % 500) / 500 * 100;
  const xpToNextLevel = 500 - (profile.xp % 500);

  const stats = [
    { label: 'Level', value: profile.level, icon: Sparkles },
    { label: 'Total XP', value: profile.xp.toLocaleString(), icon: Trophy },
    { label: 'Streak', value: `${profile.streak} days`, icon: Flame },
    { label: 'Achievements', value: `${unlockedAchievements.length}/${profile.achievements.length}`, icon: Award },
  ];

  return (
    <div className="space-y-8">
      <header>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">Profile</h1>
            <p className="text-muted-foreground">
              Track your achievements and progress
            </p>
          </div>
        </motion.div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{profile.level}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-warning flex items-center justify-center">
                  <Flame className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">Level {profile.level}</h2>
                <p className="text-sm text-muted-foreground">
                  {xpToNextLevel} XP to next level
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile.streak > 0 && (
                <Badge variant="secondary" className="gap-1.5 py-1 px-3">
                  <Flame className="w-4 h-4 text-warning" />
                  {profile.streak} day streak
                </Badge>
              )}
              <Badge variant="outline" className="gap-1.5 py-1 px-3">
                <Sparkles className="w-4 h-4 text-primary" />
                {profile.xp.toLocaleString()} XP
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to Level {profile.level + 1}</span>
              <span className="font-mono">{profile.xp % 500} / 500 XP</span>
            </div>
            <Progress value={xpProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Unlocked Achievements ({unlockedAchievements.length})
          </h2>
          {unlockedAchievements.length === 0 ? (
            <Card className="border border-dashed border-border/50 bg-card/30">
              <CardContent className="py-12 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No achievements unlocked yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start trading and exploring to earn achievements!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements.map((achievement, index) => {
                const Icon = iconMap[achievement.icon] || Trophy;
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border border-border/50 bg-card/50 relative overflow-visible">
                      <div
                        className={cn(
                          'absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br',
                          categoryColors[achievement.category]
                        )}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <CardContent className="pt-6">
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                          <Badge variant="secondary" className="gap-1">
                            <Sparkles className="w-3 h-3" />
                            +{achievement.xpReward} XP
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {achievement.unlockedAt ? timeAgo(achievement.unlockedAt) : ''}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            Locked Achievements ({lockedAchievements.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement, index) => {
              const Icon = iconMap[achievement.icon] || Trophy;
              const hasProgress = achievement.progress !== undefined && achievement.maxProgress !== undefined;

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border border-border/50 bg-card/30 relative overflow-visible opacity-75">
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center bg-muted border border-border">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      {hasProgress && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <Progress
                            value={((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}
                            className="h-1.5"
                          />
                        </div>
                      )}
                      <div className="flex items-center mt-3 pt-3 border-t border-border/50">
                        <Badge variant="outline" className="gap-1">
                          <Sparkles className="w-3 h-3" />
                          +{achievement.xpReward} XP
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
