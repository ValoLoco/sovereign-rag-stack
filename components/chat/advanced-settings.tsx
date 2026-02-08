'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface AdvancedSettingsProps {
  mode: 'chat' | 'workers' | 'ralph';
  workerModels: string[];
  ralphIterations: number;
  onModeChange: (mode: 'chat' | 'workers' | 'ralph') => void;
  onWorkerModelsChange: (models: string[]) => void;
  onRalphIterationsChange: (iterations: number) => void;
}

const availableModels = [
  { id: 'ollama/llama3.3', name: 'Llama 3.3' },
  { id: 'ollama/qwen2.5-coder', name: 'Qwen 2.5 Coder' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'openai/gpt-4', name: 'GPT-4' },
];

export function AdvancedSettings({
  mode,
  workerModels,
  ralphIterations,
  onModeChange,
  onWorkerModelsChange,
  onRalphIterationsChange,
}: AdvancedSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleWorkerModel = (modelId: string) => {
    if (workerModels.includes(modelId)) {
      onWorkerModelsChange(workerModels.filter(m => m !== modelId));
    } else {
      if (workerModels.length < 3) {
        onWorkerModelsChange([...workerModels, modelId]);
      }
    }
  };

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="max-w-3xl mx-auto px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between py-2 text-xs text-neutral-600 dark:text-neutral-400"
        >
          <span>Advanced</span>
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>

        {isExpanded && (
          <div className="pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mode" className="text-xs">
                Mode
              </Label>
              <Select value={mode} onValueChange={onModeChange}>
                <SelectTrigger id="mode" className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat (single model)</SelectItem>
                  <SelectItem value="workers">Workers (parallel)</SelectItem>
                  <SelectItem value="ralph">Ralph (iterative)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === 'workers' && (
              <div className="space-y-2">
                <Label className="text-xs">
                  Worker Models (max 3)
                </Label>
                <div className="space-y-2">
                  {availableModels.map((model) => (
                    <div key={model.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={model.id}
                        checked={workerModels.includes(model.id)}
                        onCheckedChange={() => toggleWorkerModel(model.id)}
                        disabled={!workerModels.includes(model.id) && workerModels.length >= 3}
                      />
                      <label
                        htmlFor={model.id}
                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {model.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === 'ralph' && (
              <div className="space-y-2">
                <Label htmlFor="iterations" className="text-xs">
                  Iterations (1-10)
                </Label>
                <Input
                  id="iterations"
                  type="number"
                  min={1}
                  max={10}
                  value={ralphIterations}
                  onChange={(e) => onRalphIterationsChange(parseInt(e.target.value) || 3)}
                  className="h-8 text-xs"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
