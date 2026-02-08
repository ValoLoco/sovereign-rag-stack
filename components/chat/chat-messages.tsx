'use client';

import { Bot, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: number;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-2xl font-semibold tracking-tight">
            How can I help you today?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Ask anything, upload documents, or explore your knowledge base.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className="flex gap-4"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              {message.role === 'user' ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
              {message.sources && message.sources > 0 && (
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  {message.sources} source{message.sources > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
