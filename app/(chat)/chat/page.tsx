'use client';

import { useState } from 'react';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatError } from '@/components/chat/chat-error';
import { AdvancedSettings } from '@/components/chat/advanced-settings';
import { Sidebar } from '@/components/chat/sidebar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('ollama/qwen2.5-coder');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<{ message: string; model?: string; endpoint?: string } | null>(null);
  
  const [mode, setMode] = useState<'chat' | 'workers' | 'ralph'>('chat');
  const [workerModels, setWorkerModels] = useState<string[]>([]);
  const [ralphIterations, setRalphIterations] = useState(3);

  const handleSendMessage = async (content: string, files?: File[], settings?: any) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          model: selectedModel,
          mode,
          workerModels,
          ralphIterations,
          settings,
          files: files?.map(f => f.name),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          message: data.error || 'Failed to get response',
          model: data.model,
          endpoint: data.endpoint,
        });
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'Response here',
        timestamp: new Date(),
        sources: data.sources || 0,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError({
        message: error instanceof Error ? error.message : 'Network error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMessage) {
        handleSendMessage(lastUserMessage.content);
      }
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNewChat={handleNewChat}
        />
        
        <div className="flex-1 overflow-y-auto">
          <ChatMessages messages={messages} isLoading={isLoading} />
          
          {error && (
            <div className="max-w-3xl mx-auto px-4 py-4">
              <ChatError
                error={error.message}
                model={error.model}
                endpoint={error.endpoint}
                onRetry={handleRetry}
              />
            </div>
          )}
        </div>
        
        <AdvancedSettings
          mode={mode}
          workerModels={workerModels}
          ralphIterations={ralphIterations}
          onModeChange={setMode}
          onWorkerModelsChange={setWorkerModels}
          onRalphIterationsChange={setRalphIterations}
        />
        
        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
