'use client';

import { X, MessageSquare, Settings, LogOut, Cpu, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const models = [
  { id: 'ollama/llama3.3', name: 'Llama 3.3', provider: 'Ollama', local: true },
  { id: 'ollama/qwen2.5', name: 'Qwen 2.5', provider: 'Ollama', local: true },
  { id: 'ollama/deepseek-r1', name: 'DeepSeek R1', provider: 'Ollama', local: true },
  { id: 'anthropic/claude-sonnet', name: 'Claude Sonnet 4', provider: 'Anthropic', local: false },
];

const connectors = [
  { id: 'rag', name: 'Knowledge Base', enabled: true },
  { id: 'memory', name: 'Personal Memory', enabled: true },
  { id: 'web', name: 'Web Search', enabled: false },
];

export function Sidebar({ isOpen, onClose, selectedModel, onModelChange }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-40"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transform transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="font-semibold">flipadonga</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Model
                </h3>
                <div className="space-y-1">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => onModelChange(model.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        selectedModel === model.id
                          ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className={cn(
                            "text-xs",
                            selectedModel === model.id
                              ? "text-white/70 dark:text-neutral-900/70"
                              : "text-neutral-500"
                          )}>
                            {model.provider}
                          </div>
                        </div>
                        {model.local && (
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            selectedModel === model.id
                              ? "bg-white/20 dark:bg-neutral-900/20"
                              : "bg-neutral-200 dark:bg-neutral-800"
                          )}>
                            Local
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Plug className="h-4 w-4" />
                  Connectors
                </h3>
                <div className="space-y-1">
                  {connectors.map((connector) => (
                    <div
                      key={connector.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <span>{connector.name}</span>
                      <div className={cn(
                        "w-8 h-5 rounded-full transition-colors cursor-pointer",
                        connector.enabled 
                          ? "bg-neutral-900 dark:bg-neutral-100" 
                          : "bg-neutral-300 dark:bg-neutral-700"
                      )}>
                        <div className={cn(
                          "w-4 h-4 rounded-full bg-white dark:bg-neutral-900 transition-transform mt-0.5",
                          connector.enabled ? "ml-3.5" : "ml-0.5"
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Recent Chats
                </h3>
                <div className="space-y-1">
                  <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    <div className="font-medium truncate">BUENATURA overview</div>
                    <div className="text-xs text-neutral-500">2 hours ago</div>
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    <div className="font-medium truncate">RAG architecture questions</div>
                    <div className="text-xs text-neutral-500">Yesterday</div>
                  </button>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
