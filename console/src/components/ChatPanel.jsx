import React, { useState, useRef, useEffect } from 'react';

function MessageBubble({ message, isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gdpro-accent/20 border border-gdpro-accent/30 flex items-center justify-center mr-2.5 shrink-0 mt-1">
          <svg className="w-4 h-4 text-gdpro-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>
      )}
      <div className={isUser ? 'chat-message-user' : 'chat-message-agent'}>
        <div className="whitespace-pre-wrap">{message.text}</div>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gdpro-bg/50 rounded text-2xs">
                <svg className="w-3 h-3 text-gdpro-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
                <span className="text-gdpro-text-secondary truncate max-w-[120px]">{att.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPanel({ messages, onSendMessage, isLoading, connectionStatus }) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!input.trim() && files.length === 0) || isLoading || connectionStatus !== 'connected') return;

    onSendMessage(input.trim(), files);
    setInput('');
    setFiles([]);
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isDisabled = connectionStatus !== 'connected';

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-gdpro-bg">
      {/* 对话区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gdpro-accent/10 border border-gdpro-accent/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-gdpro-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-display font-semibold text-gdpro-text mb-1">
                Graphic Design Pro
              </h3>
              <p className="text-sm text-gdpro-text-secondary max-w-sm">
                专业平面设计与VI视觉识别系统控制台。描述你的设计需求，或直接上传 Logo / 场景照片开始。
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {['帮我设计一个咖啡店的品牌VI', '做一个科技公司的Logo', '设计一套外卖包装', '审查这个设计合不合规'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSendMessage(suggestion)}
                  className="px-3 py-1.5 text-2xs bg-gdpro-bg-elevated border border-gdpro-border rounded-full text-gdpro-text-secondary hover:text-gdpro-text hover:border-gdpro-text-muted transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} isUser={msg.role === 'user'} />
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-gdpro-accent/20 border border-gdpro-accent/30 flex items-center justify-center mr-2.5 shrink-0">
              <svg className="w-4 h-4 text-gdpro-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="chat-message-agent">
              <div className="flex items-center gap-2 text-gdpro-text-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-gdpro-accent animate-pulse-subtle" />
                <span className="text-xs">思考中...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gdpro-border p-4">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gdpro-bg-elevated border border-gdpro-border rounded-md text-2xs">
                <svg className="w-3 h-3 text-gdpro-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
                <span className="text-gdpro-text-secondary truncate max-w-[100px]">{file.name}</span>
                <button onClick={() => removeFile(i)} className="ml-1 text-gdpro-text-muted hover:text-gdpro-danger">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2 gdpro-card p-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isDisabled}
              className="p-2 rounded-md hover:bg-gdpro-bg-surface transition-colors shrink-0 disabled:opacity-30"
              title="上传文件"
            >
              <svg className="w-5 h-5 text-gdpro-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.svg,.md"
            />

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={isDisabled ? '请先连接 OpenClaw Gateway' : '描述你的设计需求，或上传文件...'}
              disabled={isDisabled}
              rows={1}
              className="flex-1 bg-transparent text-sm text-gdpro-text placeholder:text-gdpro-text-muted resize-none outline-none min-h-[24px] max-h-[120px] py-2 disabled:opacity-40"
              style={{ height: 'auto' }}
            />

            <button
              type="submit"
              disabled={(!input.trim() && files.length === 0) || isLoading || isDisabled}
              className="p-2 rounded-md bg-gdpro-accent text-gdpro-bg hover:bg-gdpro-accent-hover transition-colors shrink-0 disabled:opacity-30 disabled:hover:bg-gdpro-accent"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
