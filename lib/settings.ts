export interface AppSettings {
  selectedModel: string;
  ollamaEndpoint?: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
}

const SETTINGS_KEY = 'sovereign-rag-settings';

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return { selectedModel: 'ollama/qwen2.5-coder' };
  
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) {
    return { selectedModel: 'ollama/qwen2.5-coder' };
  }
  
  return JSON.parse(stored);
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
