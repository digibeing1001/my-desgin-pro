import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DesignerAgent from './components/DesignerAgent';
import AssetLibrary from './components/AssetLibrary';
import ReferenceLibrary from './components/ReferenceLibrary';
import DesignerProfile from './components/DesignerProfile';
import ConnectionSetup from './components/ConnectionSetup';
import ErrorBoundary from './components/ErrorBoundary';
import { openclaw } from './lib/api';
import { saveToLocal, loadFromLocal, saveToLocalAndSync, pullFromGateway } from './lib/storage';
import { exportGdproProject } from './lib/exportGdpro';
import { createProject, DEMO_PROJECTS } from './data/projects';
import { getConfiguredModels, saveModelConfig, saveCustomModels, getCustomModels, addCustomModel, removeCustomModel } from './data/modelConfig';

const VIEW_COMPONENTS = {
  agent: DesignerAgent,
  assets: AssetLibrary,
  references: ReferenceLibrary,
  profile: DesignerProfile,
};

// Parse URL params for agent injection
function getUrlParams() {
  if (typeof window === 'undefined') return {};
  const url = new URL(window.location.href);
  return {
    env: url.searchParams.get('env') || null,
    llm: url.searchParams.get('llm') || null,
    imageModel: url.searchParams.get('imageModel') || url.searchParams.get('image_model') || null,
    modelsDetected: url.searchParams.get('modelsDetected') === 'true' || url.searchParams.get('detected') === 'true',
    gatewayUrl: url.searchParams.get('gateway') || null,
    gatewayToken: url.searchParams.get('token') || null,
    injected: url.searchParams.get('injected') === 'true',
  };
}

// Sync model config back to parent agent
function syncToParentAgent(type, data) {
  if (typeof window !== 'undefined' && window.parent !== window) {
    window.parent.postMessage({
      source: 'graphic-design-pro-console',
      type,
      data,
    }, '*');
  }
}

export default function App() {
  const urlParams = getUrlParams();
  const [activeView, setActiveView] = useState('agent');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');

  // Models — auto-injected from URL params if available
  const [llm, setLlm] = useState(() => {
    if (urlParams.llm) {
      const cfg = getConfiguredModels();
      saveModelConfig({ ...cfg, llm: urlParams.llm });
      return urlParams.llm;
    }
    const cfg = getConfiguredModels();
    return cfg.llm || 'gpt-4o';
  });
  const [imageModel, setImageModel] = useState(() => {
    if (urlParams.imageModel) {
      const cfg = getConfiguredModels();
      saveModelConfig({ ...cfg, imageModel: urlParams.imageModel });
      return urlParams.imageModel;
    }
    const cfg = getConfiguredModels();
    return cfg.imageModel || 'seedream';
  });
  const [modelsDetected, setModelsDetected] = useState(() => {
    // If injected from agent, trust it
    if (urlParams.modelsDetected) return true;
    return false;
  });

  // Projects
  const [projects, setProjects] = useState(() => loadFromLocal('projects', DEMO_PROJECTS));
  const [currentProjectId, setCurrentProjectId] = useState(() => loadFromLocal('current_project', DEMO_PROJECTS[0]?.id || null));

  // Agent environment — auto-detected from URL or window globals
  const [agentEnv, setAgentEnv] = useState(() => {
    if (urlParams.env) return urlParams.env;
    if (typeof window !== 'undefined') {
      if (window?.__OPENCLAW__) return 'openclaw';
      if (window?.__WORKBUDDY__) return 'workbuddy';
      if (window?.__QCLAW__) return 'qclaw';
    }
    return 'unknown';
  });

  // Auto-connect if gateway params injected
  useEffect(() => {
    if (urlParams.gatewayUrl) {
      openclaw.setConfig(urlParams.gatewayUrl, urlParams.gatewayToken);
      setConnectionStatus('connecting');
      openclaw.healthCheck()
        .then(() => {
          setConnectionStatus('connected');
          setModelsDetected(true);
          // Pull .gdpro/ data from workspace on connect
          pullFromGateway().then((res) => {
            if (res.success && res.pulled?.length) {
              // Refresh projects from localStorage after pull
              const refreshed = loadFromLocal('projects', DEMO_PROJECTS);
              setProjects(refreshed);
            }
          });
        })
        .catch(() => { setConnectionStatus('disconnected'); });
    }
  }, []);

  const currentProject = projects.find((p) => p.id === currentProjectId) || null;

  const handleConnect = (url, token) => {
    openclaw.setConfig(url, token);
    setConnectionStatus('connecting');
    openclaw.healthCheck()
      .then(() => {
        setConnectionStatus('connected');
        setModelsDetected(true);
        pullFromGateway().then((res) => {
          if (res.success && res.pulled?.length) {
            const refreshed = loadFromLocal('projects', DEMO_PROJECTS);
            setProjects(refreshed);
          }
        });
      })
      .catch(() => { setConnectionStatus('disconnected'); setModelsDetected(false); });
  };

  const handleProjectCreate = useCallback((name) => {
    const newProject = createProject(name);
    const updated = [newProject, ...projects];
    setProjects(updated);
    setCurrentProjectId(newProject.id);
    saveToLocalAndSync('projects', updated, '.gdpro/projects/projects-index.json');
    saveToLocal('current_project', newProject.id);
  }, [projects]);

  const handleProjectSwitch = useCallback((id) => {
    setCurrentProjectId(id);
    saveToLocal('current_project', id);
  }, []);

  const handleAssetsChange = useCallback((projectId, newAssets) => {
    setProjects((prev) => {
      const updated = prev.map((p) => p.id === projectId ? { ...p, assets: newAssets, updatedAt: Date.now() } : p);
      saveToLocalAndSync('projects', updated, '.gdpro/projects/projects-index.json');
      return updated;
    });
  }, []);

  const handleReferencesChange = useCallback((projectId, newRefs) => {
    setProjects((prev) => {
      const updated = prev.map((p) => p.id === projectId ? { ...p, references: newRefs, updatedAt: Date.now() } : p);
      saveToLocalAndSync('projects', updated, '.gdpro/projects/projects-index.json');
      return updated;
    });
  }, []);

  const handleAssetAdopted = useCallback((asset) => {
    const proj = projects.find((p) => p.id === asset.projectId);
    if (!proj) return;
    const updatedAssets = { ...proj.assets };
    Object.keys(updatedAssets).forEach((cat) => {
      updatedAssets[cat] = updatedAssets[cat].map((a) =>
        a.id === asset.id ? { ...a, status: 'adopted', adoptedAt: Date.now() } : a
      );
    });
    handleAssetsChange(asset.projectId, updatedAssets);
  }, [projects, handleAssetsChange]);

  const handleAssetRejected = useCallback((asset) => {
    const proj = projects.find((p) => p.id === asset.projectId);
    if (!proj) return;
    const updatedAssets = { ...proj.assets };
    Object.keys(updatedAssets).forEach((cat) => {
      updatedAssets[cat] = updatedAssets[cat].filter((a) => a.id !== asset.id);
    });
    handleAssetsChange(asset.projectId, updatedAssets);
  }, [projects, handleAssetsChange]);

  const handleChangeLLM = useCallback((id) => {
    setLlm(id);
    const cfg = getConfiguredModels();
    const next = { ...cfg, llm: id };
    saveModelConfig(next);
    syncToParentAgent('model_change', { type: 'llm', id });
  }, []);

  const handleChangeImageModel = useCallback((id) => {
    setImageModel(id);
    const cfg = getConfiguredModels();
    const next = { ...cfg, imageModel: id };
    saveModelConfig(next);
    syncToParentAgent('model_change', { type: 'imageModel', id });
  }, []);

  const handleAddCustomModel = useCallback((type, model) => {
    const updated = addCustomModel(type, model);
    syncToParentAgent('custom_model_added', { type, model });
    return updated;
  }, []);

  const handleRemoveCustomModel = useCallback((type, id) => {
    const updated = removeCustomModel(type, id);
    syncToParentAgent('custom_model_removed', { type, id });
    return updated;
  }, []);

  // Listen for model sync from parent
  useEffect(() => {
    function handleMessage(e) {
      const msg = e.data;
      if (!msg || msg.source !== 'graphic-design-pro-agent') return;
      if (msg.type === 'model_sync') {
        if (msg.data.llm) setLlm(msg.data.llm);
        if (msg.data.imageModel) setImageModel(msg.data.imageModel);
        if (msg.data.modelsDetected) setModelsDetected(true);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Dynamic props per view
  const getViewProps = () => {
    switch (activeView) {
      case 'agent':
        return {
          project: currentProject,
          projects,
          onProjectSwitch: handleProjectSwitch,
          onProjectCreate: handleProjectCreate,
          onAssetAdopted: handleAssetAdopted,
          onAssetRejected: handleAssetRejected,
          onAssetsChange: handleAssetsChange,
          llm, imageModel,
          references: currentProject?.references || [],
          assets: currentProject?.assets || {},
        };
      case 'assets':
        return { projects, onAssetsChange: handleAssetsChange };
      case 'references':
        return { projects, onReferencesChange: handleReferencesChange };
      case 'profile':
        return {};
      default:
        return {};
    }
  };

  const ActiveComponent = VIEW_COMPONENTS[activeView] || DesignerAgent;

  return (
    <div className="h-screen w-screen flex flex-col bg-gdpro-bg text-gdpro-text overflow-hidden">
      <Header
        onExport={() => exportGdproProject(currentProject)}
        onToggleMobileSidebar={() => setMobileSidebarOpen((v) => !v)}
        currentProject={currentProject}
        llm={llm}
        imageModel={imageModel}
        onChangeLLM={handleChangeLLM}
        onChangeImageModel={handleChangeImageModel}
        agentEnv={agentEnv}
        modelsDetected={modelsDetected}
      />

      <div className="flex-1 flex min-h-0">
        <Sidebar
          activeView={activeView}
          onChange={(view) => { setActiveView(view); setMobileSidebarOpen(false); }}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
          projects={projects}
          currentProjectId={currentProjectId}
          onProjectSwitch={handleProjectSwitch}
          onProjectCreate={handleProjectCreate}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          connectionStatus={connectionStatus}
          onOpenSettings={() => setShowSettings(true)}
        />

        <main className="flex-1 min-w-0 overflow-hidden">
          <ErrorBoundary>
            <ActiveComponent {...getViewProps()} />
          </ErrorBoundary>
        </main>
      </div>

      <ConnectionSetup
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onConnect={handleConnect}
      />
    </div>
  );
}
