import React, { useState, useEffect } from 'react';
import { Plug, X, Check, AlertCircle } from 'lucide-react';
import { openclaw } from '../lib/api';
import { loadFromLocal, saveToLocal } from '../lib/storage';

export default function ConnectionSetup({ isOpen, onClose, onConnect }) {
  const [url, setUrl] = useState(loadFromLocal('gateway_url') || 'http://127.0.0.1:18789');
  const [token, setToken] = useState(loadFromLocal('gateway_token') || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(loadFromLocal('gateway_url') || 'http://127.0.0.1:18789');
      setToken(loadFromLocal('gateway_token') || '');
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    openclaw.setConfig(url, token);
    try {
      const result = await openclaw.healthCheck();
      setTestResult({ ok: true, data: result });
    } catch (err) {
      setTestResult({ ok: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    saveToLocal('gateway_url', url);
    saveToLocal('gateway_token', token);
    openclaw.setConfig(url, token);
    onConnect(url, token);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-md gdpro-card p-5 animate-scale-in rounded-[10px]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Plug className="w-4 h-4 text-gdpro-accent" strokeWidth={2} />
            <h2 className="text-[15px] font-semibold text-gdpro-text tracking-tight">连接设置</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gdpro-bg-hover transition-colors">
            <X className="w-4 h-4 text-gdpro-text-secondary" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="gdpro-label">Gateway 地址</label>
            <input className="gdpro-input font-mono text-[12px]" value={url}
              onChange={(e) => setUrl(e.target.value)} placeholder="http://127.0.0.1:18789" />
            <p className="mt-1 text-[10px] text-gdpro-text-muted">OpenClaw Gateway 默认运行在 18789 端口</p>
          </div>

          <div>
            <label className="gdpro-label">Bearer Token</label>
            <input className="gdpro-input font-mono text-[12px]" type="password" value={token}
              onChange={(e) => setToken(e.target.value)} placeholder="your-secret-token" />
            <p className="mt-1 text-[10px] text-gdpro-text-muted">通过 openclaw config set gateway.token 设置</p>
          </div>

          {testResult && (
            <div className={`p-2.5 rounded-md text-[12px] ${testResult.ok ? 'bg-gdpro-success/8 text-gdpro-success border border-gdpro-success/15' : 'bg-gdpro-danger/8 text-gdpro-danger border border-gdpro-danger/15'}`}>
              {testResult.ok ? (
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                  <span>连接成功 — {testResult.data?.version || 'Gateway OK'}</span>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="break-all">{testResult.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={handleTest} disabled={testing}
            className="gdpro-button-secondary flex-1 text-[12px]">
            {testing ? '测试中...' : '测试连接'}
          </button>
          <button onClick={handleSave} disabled={!testResult?.ok}
            className="gdpro-button flex-1 text-[12px]">
            保存并连接
          </button>
        </div>
      </div>
    </div>
  );
}
