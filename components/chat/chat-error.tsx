'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatErrorProps {
  error: string;
  model?: string;
  endpoint?: string;
  onRetry: () => void;
}

export function ChatError({ error, model, endpoint, onRetry }: ChatErrorProps) {
  return (
    <div className="flex items-center gap-3 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-medium text-red-900 dark:text-red-100">Failed to connect to model</p>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
        {(model || endpoint) && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            Model: {model} | Endpoint: {endpoint?.substring(0, 30)}...
          </p>
        )}
      </div>
      <Button onClick={onRetry} variant="outline" size="sm">
        Retry
      </Button>
    </div>
  );
}
