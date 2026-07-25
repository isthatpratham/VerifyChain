/**
 * AIAssistantPage.jsx
 * Enterprise AI Compliance Assistant Workspace (Phase 9.4).
 * Features multi-turn chat stream, suggested quick prompts, grounded citations panel, exportable reports tab, and evidence inspector.
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
      content: 'Welcome to the **VerifyChain AI Compliance Assistant**. How can I guide your organization using authorized platform records today?',
      confidenceScore: 1.0,
      citations: [],
    },
  ]);
  const [query, setQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'reports'
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkle size={16} weight="fill" /> Phase 9.4 Enterprise Copilot
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            AI Compliance Assistant & Copilot
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Domain-specific grounded assistant answering statutory compliance, document understanding, and supplier trust questions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'chat' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Copilot Chat
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'reports' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Generated Reports ({reports.length})
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Conversation Stream (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col h-[650px]">
            {/* Messages Scroll Area */}
            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                        : 'bg-gray-50 border border-gray-200/80 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Citations Snippets */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200/60 flex flex-wrap gap-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider w-full">
                          Grounded Citations:
                        </span>
                        {msg.citations.map((cit, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => setSelectedCitation(cit)}
                            className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold border border-blue-200 transition-colors flex items-center gap-1"
                          >
                            <ShieldCheck size={12} /> {cit.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'assistant' && (
                    <span className="text-[10px] text-gray-400 font-medium px-1">
                      Confidence {((msg.confidenceScore || 0.96) * 100).toFixed(0)}% | Grounded in VerifyChain
                    </span>
                  )}
                </div>
              ))}

              {sending && (
                <div className="flex items-center gap-2 text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl w-fit">
                  <Brain size={16} className="animate-spin text-blue-600" />
                  Orchestrating platform context & grounding...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Quick Action Prompts */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] text-gray-400 font-bold uppercase shrink-0">Quick Prompts:</span>
              {SUGGESTED_PROMPTS.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 text-[11px] font-medium hover:border-blue-500 hover:text-blue-600 shrink-0 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-3 rounded-b-2xl">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask VerifyChain Assistant about trust score, compliance gaps, risk..."
                className="flex-1 px-4 py-2.5 text-xs text-gray-900 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={sending || !query.trim()}
                className="p-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 transition-all shadow-xs"
              >
                <PaperPlaneRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Column: Actions & Citations Inspector */}
          <div className="flex flex-col gap-6">
            {/* Quick Action Report Generator */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col gap-4">
              <h3 className="text-base font-bold text-gray-900">Exportable Report Generator</h3>
              <p className="text-xs text-gray-600">Formulate formal board briefs and audit readiness reports grounded in active telemetry.</p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => handleGenerateReport('BOARD_REPORT')}
                  disabled={generatingReport}
                  className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 text-xs font-bold text-gray-800 transition-all flex items-center justify-between"
                >
                  <span>Generate Board Report</span>
                  <FileText size={16} className="text-blue-600" />
                </button>

                <button
                  onClick={() => handleGenerateReport('AUDIT_READINESS')}
                  disabled={generatingReport}
                  className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 border border-gray-200 text-xs font-bold text-gray-800 transition-all flex items-center justify-between"
                >
                  <span>Generate Audit Readiness Brief</span>
                  <ShieldCheck size={16} className="text-emerald-600" />
                </button>
              </div>
            </div>

            {/* Citations Inspector Drawer */}
            {selectedCitation && (
              <div className="bg-blue-50/80 rounded-2xl p-6 border border-blue-200/80 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">Citation Evidence Inspection</span>
                  <button onClick={() => setSelectedCitation(null)} className="text-xs text-blue-600 font-semibold">Close</button>
                </div>
                <h4 className="text-sm font-extrabold text-blue-950">{selectedCitation.title}</h4>
                <p className="text-xs text-blue-800">{selectedCitation.snippet}</p>
                <span className="text-[10px] text-blue-600 font-mono">Reference: {selectedCitation.referenceId}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Generated Reports Tab */
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Exportable Compliance Reports</h3>
            <span className="text-xs text-gray-500 font-medium">{reports.length} Generated</span>
          </div>

          <div className="flex flex-col gap-4">
            {reports.map((rep, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-gray-900">{rep.title}</h4>
                  <span className="text-xs text-gray-500 font-mono">{rep.report_code || rep.reportCode}</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-200 font-mono text-xs text-gray-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {rep.content_markdown || rep.contentMarkdown}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
