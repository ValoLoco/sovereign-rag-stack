'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'dark') return <Moon className="h-5 w-5" />;
    if (theme === 'light') return <Sun className="h-5 w-5" />;
    return <Sun className="h-5 w-5 opacity-50" />;
  };

  const getLabel = () => {
    if (theme === 'dark') return 'Dark mode';
    if (theme === 'light') return 'Light mode';
    return 'System theme';
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
      title={getLabel()}
    >
      {getIcon()}
      <span className="sr-only">{getLabel()}</span>
    </Button>
  );
}
