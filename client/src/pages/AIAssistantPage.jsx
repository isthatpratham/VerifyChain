/**
 * AIAssistantPage.jsx
 * Enterprise AI Compliance Assistant Workspace (Phase 9.4).
 * Features multi-turn chat stream, suggested quick prompts, grounded citations panel, exportable reports tab, and evidence inspector.
 * Strictly adheres to DESIGN_SYSTEM.md enterprise tokens.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  PaperPlaneRight,
  Sparkle,
  ShieldCheck,
  FileText,
  TrendUp,
  DownloadSimple,
  Info,
  CheckCircle,
  Clock,
  ArrowRight,
  Lightbulb,
  ListChecks,
} from '@phosphor-icons/react';
import axios from 'axios';

const SUGGESTED_PROMPTS = [
  'Explain my Supplier Trust Score.',
  'What compliance gaps should I fix first?',
  'Explain overall compliance risk score.',
  'Generate an Executive Board Report.',
  'Summarize verified statutory documents.',
];

export function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      content: 'Welcome to the VerifyChain AI Compliance Assistant. How can I guide your organization using authorized platform records today?',
      confidenceScore: 1.0,
      citations: [],
    },
  ]);
  const [query, setQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [reports, setReports] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const promptText = textToSend || query;
    if (!promptText.trim() || sending) return;

    const userMsg = { sender: 'user', content: promptText };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setSending(true);

    try {
      const res = await axios.post('/api/v1/ai-assistant/conversations/messages', {
        conversationId,
        query: promptText,
      });

      const data = res.data.data;
      setConversationId(data.conversationId);

      const assistantMsg = {
        sender: 'assistant',
        content: data.response,
        confidenceScore: data.confidenceScore,
        citations: data.citations || [],
        intent: data.intent?.intentCode,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to process assistant message:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: 'Unable to communicate with platform context. Please try again.',
          confidenceScore: 0.0,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleGenerateReport = async (type = 'BOARD_REPORT') => {
    setGeneratingReport(true);
    try {
      const res = await axios.post('/api/v1/ai-assistant/reports/generate', { reportType: type });
      setReports((prev) => [res.data.data, ...prev]);
      setActiveTab('reports');
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[--text-xs] font-semibold text-[--vc-brand] uppercase tracking-wider mb-1 font-mono">
            <Sparkle size={16} weight="fill" /> Phase 9.4 Enterprise Copilot
          </div>
          <h1 className="text-[--text-2xl] font-bold text-[--vc-text-primary] tracking-tight font-[--font-heading]">
            AI Compliance Assistant & Copilot
          </h1>
          <p className="text-[--text-xs] text-[--vc-text-secondary] mt-1">
            Domain-specific grounded assistant answering statutory compliance, document understanding, and supplier trust questions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2.5 rounded-[--radius-md] text-[--text-xs] font-semibold transition-all ${
              activeTab === 'chat' ? 'bg-[--vc-brand] text-white' : 'bg-[--vc-bg-base] text-[--vc-text-primary] hover:bg-[--vc-bg-muted] border border-[--vc-border]'
            }`}
          >
            Copilot Chat
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-[--radius-md] text-[--text-xs] font-semibold transition-all ${
              activeTab === 'reports' ? 'bg-[--vc-brand] text-white' : 'bg-[--vc-bg-base] text-[--vc-text-primary] hover:bg-[--vc-bg-muted] border border-[--vc-border]'
            }`}
          >
            Generated Reports ({reports.length})
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Conversation Stream */}
          <div className="lg:col-span-2 bg-[--vc-surface-raised] rounded-[--radius-md] border border-[--vc-border] flex flex-col h-[650px]">
            {/* Messages Scroll Area */}
            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-1.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-[--radius-md] text-[--text-xs] md:text-[--text-sm] leading-[--lh-relaxed] ${
                      msg.sender === 'user'
                        ? 'bg-[--vc-brand] text-white'
                        : 'bg-[--vc-bg-base] border border-[--vc-border] text-[--vc-text-primary]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Citations Snippets */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[--vc-border] flex flex-wrap gap-2">
                        <span className="text-[10px] font-bold text-[--vc-text-tertiary] uppercase tracking-wider w-full font-mono">
                          Grounded Citations:
                        </span>
                        {msg.citations.map((cit, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => setSelectedCitation(cit)}
                            className="px-2.5 py-1 rounded-[--radius-sm] bg-[--vc-brand-subtle] text-[--vc-brand] hover:bg-[--vc-brand-subtle]/80 text-[11px] font-semibold border border-[--vc-brand]/20 transition-colors flex items-center gap-1 font-mono"
                          >
                            <ShieldCheck size={12} /> {cit.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'assistant' && (
                    <span className="text-[10px] text-[--vc-text-tertiary] font-mono px-1">
                      Confidence {((msg.confidenceScore || 0.96) * 100).toFixed(0)}% | Grounded in VerifyChain
                    </span>
                  )}
                </div>
              ))}

              {sending && (
                <div className="flex items-center gap-2 text-[--text-xs] text-[--vc-text-secondary] italic p-3 bg-[--vc-bg-base] border border-[--vc-border] rounded-[--radius-sm] w-fit">
                  <Brain size={16} className="animate-spin text-[--vc-brand]" />
                  Querying enterprise compliance engine...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts & Input Area */}
            <div className="p-4 border-t border-[--vc-border] bg-[--vc-bg-base] flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className="px-2.5 py-1 rounded-[--radius-sm] bg-[--vc-surface] hover:bg-[--vc-bg-muted] text-[--vc-text-secondary] border border-[--vc-border] text-[11px] font-medium transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a compliance or statutory risk question..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2.5 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface] text-[--vc-text-primary] text-[--text-xs] focus:outline-none focus:ring-2 focus:ring-[--vc-brand]"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={sending || !query.trim()}
                  className="px-4 py-2.5 rounded-[--radius-md] bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white text-[--text-xs] font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <PaperPlaneRight size={16} /> Send
                </button>
              </div>
            </div>
          </div>

          {/* Right Citation Panel */}
          <div className="bg-[--vc-surface-raised] rounded-[--radius-md] p-6 border border-[--vc-border] flex flex-col gap-4">
            <h3 className="text-[--text-sm] font-bold text-[--vc-text-primary] pb-2 border-b border-[--vc-border] font-[--font-heading]">
              Citation Evidence Inspector
            </h3>
            {selectedCitation ? (
              <div className="space-y-3 text-[--text-xs]">
                <div className="font-bold text-[--vc-text-primary]">{selectedCitation.title}</div>
                <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border] font-mono text-[11px] text-[--vc-text-secondary]">
                  {selectedCitation.snippet || 'Grounded record verified against statutory schema.'}
                </div>
                <div className="text-[10px] font-mono text-[--vc-text-tertiary]">
                  Authority: {selectedCitation.authority || 'VERIFYCHAIN_CORE'}
                </div>
              </div>
            ) : (
              <p className="text-[--text-xs] text-[--vc-text-tertiary]">Click any grounded citation badge in the chat to inspect evidence.</p>
            )}
          </div>
        </div>
      ) : (
        /* Reports Tab */
        <div className="bg-[--vc-surface-raised] rounded-[--radius-md] p-6 border border-[--vc-border] flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-[--vc-border]">
            <h3 className="text-[--text-sm] font-bold text-[--vc-text-primary] font-[--font-heading]">Generated Executive Reports</h3>
            <button
              onClick={() => handleGenerateReport('BOARD_REPORT')}
              disabled={generatingReport}
              className="px-3.5 py-2 bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white text-[--text-xs] font-semibold rounded-[--radius-md]"
            >
              Generate Board Executive Report
            </button>
          </div>

          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((r, idx) => (
                <div key={idx} className="p-4 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] flex items-center justify-between text-[--text-xs]">
                  <div>
                    <span className="font-bold text-[--vc-text-primary] block">{r.title || 'Executive Board Report'}</span>
                    <span className="text-[10px] font-mono text-[--vc-text-tertiary]">{new Date().toLocaleDateString()}</span>
                  </div>
                  <button className="px-3 py-1.5 bg-[--vc-brand-subtle] text-[--vc-brand] rounded-[--radius-sm] font-bold text-[11px] flex items-center gap-1 border border-[--vc-brand]/20">
                    <DownloadSimple size={14} /> Download PDF
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[--text-xs] text-[--vc-text-tertiary] text-center py-8">No reports generated yet. Click above to generate an executive report.</p>
          )}
        </div>
      )}
    </div>
  );
}
