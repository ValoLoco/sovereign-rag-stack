'use client';

import { useEffect, useRef } from 'react';
import { User, Bot, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-2">
            How can I help you today?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Ask questions about your documents, search your knowledge base, or start a conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4",
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              message.role === 'user' 
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
            )}>
              {message.role === 'user' ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>

            <div className={cn(
              "flex-1 space-y-2",
              message.role === 'user' ? 'items-end' : 'items-start'
            )}>
              <div className={cn(
                "inline-block rounded-2xl px-4 py-3 max-w-[85%]",
                message.role === 'user'
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-tr-sm'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tl-sm'
              )}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.sources && message.sources > 0 && (
                <button className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                  <ExternalLink className="h-3 w-3" />
                  {message.sources} {message.sources === 1 ? 'source' : 'sources'}
                </button>
              )}

              <time className="text-xs text-neutral-500 dark:text-neutral-500">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </time>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="inline-block rounded-2xl rounded-tl-sm px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
