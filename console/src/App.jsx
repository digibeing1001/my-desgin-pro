import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ConnectionSetup from './components/ConnectionSetup';
import PhaseNavigator from './components/PhaseNavigator';
import ChatPanel from './components/ChatPanel';
import AssetGallery from './components/AssetGallery';
import { openclaw, loadFromLocal } from './lib/api';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [galleryTab, setGalleryTab] = useState('assets');
  const [assets, setAssets] = useState([]);

  // 初始化：尝试从 localStorage 恢复连接配置
  useEffect(() => {
    const savedUrl = loadFromLocal('gateway_url');
    const savedToken = loadFromLocal('gateway_token');
    if (savedUrl) {
      openclaw.setConfig(savedUrl, savedToken || '');
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('connecting');
    try {
      await openclaw.healthCheck();
      setConnectionStatus('connected');
    } catch {
      setConnectionStatus('disconnected');
    }
  };

  const handleConnect = useCallback((url, token) => {
    openclaw.setConfig(url, token);
    checkConnection();
  }, []);

  const handleSendMessage = async (text, files = []) => {
    if (!text && files.length === 0) return;

    // 添加用户消息到界面
    const userMessage = {
      role: 'user',
      text,
      attachments: files.map(f => ({ name: f.name, type: f.type })),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // TODO: 实际上传文件到项目目录
      // MVP 阶段先发送文本消息
      const response = await openclaw.sendMessage(text);

      const agentMessage = {
        role: 'assistant',
        text: response.response || response.text || JSON.stringify(response),
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, agentMessage]);

      // 简单解析 Phase 关键词
      const phaseMatch = agentMessage.text.match(/Phase\s*(\d)/i);
      if (phaseMatch) {
        const detectedPhase = parseInt(phaseMatch[1]);
        if (detectedPhase > currentPhase) {
          setCompletedPhases(prev => [...prev, currentPhase]);
          setCurrentPhase(detectedPhase);
        }
      }
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        text: `❌ 请求失败：${error.message}\n\n请检查 OpenClaw Gateway 是否正在运行，以及连接配置是否正确。`,
        timestamp: Date.now(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPhase = (phaseId) => {
    setCurrentPhase(phaseId);
    // 可以添加系统提示消息引导用户进入该 Phase
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gdpro-bg text-gdpro-text overflow-hidden">
      <Header
        connectionStatus={connectionStatus}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="flex-1 flex min-h-0">
        <PhaseNavigator
          currentPhase={currentPhase}
          completedPhases={completedPhases}
          onSelectPhase={handleSelectPhase}
        />

        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          connectionStatus={connectionStatus}
        />

        <AssetGallery
          activeTab={galleryTab}
          onTabChange={setGalleryTab}
          assets={assets}
        />
      </div>

      <ConnectionSetup
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onConnect={handleConnect}
      />
    </div>
  );
}

export default App;
