import React, { useState, useEffect } from 'react';
import { openclaw, loadFromLocal, saveToLocal } from '../lib/api';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md gdpro-card p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-semibold text-gdpro-text">连接设置</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gdpro-bg-surface transition-colors">
            <svg className="w-5 h-5 text-gdpro-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="gdpro-label">Gateway 地址</label>
            <input
              className="gdpro-input font-mono"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://127.0.0.1:18789"
            />
            <p className="mt-1 text-2xs text-gdpro-text-muted">OpenClaw Gateway 默认运行在 18789 端口</p>
          </div>

          <div>
            <label className="gdpro-label">Bearer Token</label>
            <input
              className="gdpro-input font-mono"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="your-secret-token"
            />
            <p className="mt-1 text-2xs text-gdpro-text-muted">
              通过 openclaw config set gateway.token 设置
            </p>
          </div>

          {testResult && (
            <div className={`p-3 rounded-md text-sm ${testResult.ok ? 'bg-gdpro-success/10 text-gdpro-success border border-gdpro-success/20' : 'bg-gdpro-danger/10 text-gdpro-danger border border-gdpro-danger/20'}`}>
              {testResult.ok ? (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>连接成功 — {testResult.data?.version || 'Gateway OK'}</span>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span className="break-all">{testResult.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleTest}
            disabled={testing}
            className="gdpro-button-secondary flex-1"
          >
            {testing ? '测试中...' : '测试连接'}
          </button>
          <button
            onClick={handleSave}
            disabled={!testResult?.ok}
            className="gdpro-button flex-1"
          >
            保存并连接
          </button>
        </div>
      </div>
    </div>
  );
}
