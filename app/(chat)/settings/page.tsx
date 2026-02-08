'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Settings {
  anthropicApiKey: string;
  openaiApiKey: string;
  ollamaEndpoint: string;
  ragEnabled: boolean;
  memoryEnabled: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    anthropicApiKey: '',
    openaiApiKey: '',
    ollamaEndpoint: 'http://localhost:11434',
    ragEnabled: true,
    memoryEnabled: true,
  });
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('flipadonga-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('flipadonga-settings', JSON.stringify(settings));
    setSaveMessage('Settings saved successfully');
    setIsSaving(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/chat')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">AI Models</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                <div className="relative">
                  <Input
                    id="anthropic-key"
                    type={showAnthropicKey ? 'text' : 'password'}
                    placeholder="sk-ant-..."
                    value={settings.anthropicApiKey}
                    onChange={(e) => setSettings({ ...settings, anthropicApiKey: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    {showAnthropicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  For Claude models. Get your key from{' '}
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-900 dark:text-neutral-100 hover:underline"
                  >
                    console.anthropic.com
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <div className="relative">
                  <Input
                    id="openai-key"
                    type={showOpenAIKey ? 'text' : 'password'}
                    placeholder="sk-..."
                    value={settings.openaiApiKey}
                    onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  For GPT models. Get your key from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-900 dark:text-neutral-100 hover:underline"
                  >
                    platform.openai.com
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ollama-endpoint">Ollama Endpoint</Label>
                <Input
                  id="ollama-endpoint"
                  type="url"
                  placeholder="http://localhost:11434"
                  value={settings.ollamaEndpoint}
                  onChange={(e) => setSettings({ ...settings, ollamaEndpoint: e.target.value })}
                />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Local: <code className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">http://localhost:11434</code><br />
                  Remote: Use your Tailscale IP or VPS endpoint
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Connectors</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.ragEnabled}
                  onChange={(e) => setSettings({ ...settings, ragEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500"
                />
                <div>
                  <div className="font-medium">RAG (Document Search)</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Search uploaded documents for context
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.memoryEnabled}
                  onChange={(e) => setSettings({ ...settings, memoryEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500"
                />
                <div>
                  <div className="font-medium">Memory</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Remember context across conversations
                  </div>
                </div>
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Multi-Model Setup</h2>
            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <p>
                <strong className="text-neutral-900 dark:text-neutral-100">Chat + Workers:</strong> Run multiple models in parallel for specialized tasks
              </p>
              <p>
                <strong className="text-neutral-900 dark:text-neutral-100">RALPH Loop:</strong> Iterative refinement using the same model multiple times
              </p>
              <p className="text-xs mt-2">
                Configure in chat interface via advanced options (coming soon)
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <p>
                <strong className="text-neutral-900 dark:text-neutral-100">Version:</strong> 0.1.0
              </p>
              <p>
                <strong className="text-neutral-900 dark:text-neutral-100">Deployment:</strong> Vercel Edge
              </p>
              <p>
                <strong className="text-neutral-900 dark:text-neutral-100">Repository:</strong>{' '}
                <a
                  href="https://github.com/ValoLoco/sovereign-rag-stack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-900 dark:text-neutral-100 hover:underline"
                >
                  github.com/ValoLoco/sovereign-rag-stack
                </a>
              </p>
            </div>
          </section>

          <div className="flex items-center gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
            {saveMessage && (
              <span className="text-sm text-green-600 dark:text-green-400">
                {saveMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
