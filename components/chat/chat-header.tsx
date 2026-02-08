'use client';

import { Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
}

export function ChatHeader({ onToggleSidebar, onNewChat }: ChatHeaderProps) {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-9 w-9 lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <Image
              src="/flipadonga-logo.png"
              alt="Flipadonga"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="h-9 w-9"
            title="New chat"
          >
            <Plus className="h-5 w-5" />
            <span className="sr-only">New chat</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
