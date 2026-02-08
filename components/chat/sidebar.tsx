'use client';

import { Settings, X, MessageSquare, FileText, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const models = [
  { id: 'ollama/llama3.3', name: 'Llama 3.3', provider: 'Ollama' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
];

export function Sidebar({ isOpen, onClose, selectedModel, onModelChange }: SidebarProps) {
  const router = useRouter();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <Image
            src="/flipadonga-logo.png"
            alt="Flipadonga"
            width={100}
            height={34}
            className="h-7 w-auto"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
                Model
              </h3>
              <div className="space-y-2">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => onModelChange(model.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      selectedModel === model.id
                        ? 'bg-neutral-100 dark:bg-neutral-800 font-medium'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    )}
                  >
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      {model.provider}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    router.push('/chat');
                    onClose();
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  disabled
                >
                  <FileText className="h-4 w-4" />
                  Documents
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  disabled
                >
                  <Brain className="h-4 w-4" />
                  Memories
                </Button>
              </div>
            </section>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => {
              router.push('/settings');
              onClose();
            }}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </aside>
    </>
  );
}
