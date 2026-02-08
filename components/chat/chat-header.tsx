'use client';

import { Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onMenuClick: () => void;
}

export function ChatHeader({ onMenuClick }: ChatHeaderProps) {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <h1 className="text-lg font-semibold tracking-tight">
            flipadonga
          </h1>
        </div>

        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
