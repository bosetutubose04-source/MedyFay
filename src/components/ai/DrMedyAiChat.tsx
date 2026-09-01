import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { sendPharmacistChatMessage, ChatMessage } from '../../lib/aiService';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  ShoppingCart, 
  Plus, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  RotateCcw,
  MessageSquare,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'model',
    text: `Hello! I am **Dr. Medy**, your AI Clinical Pharmacist at MedyFay. 

How can I help you today?
- **Dosage & Timing**: When to take medicines (before/after meals).
- **Medicine Substitutes**: Active generic salts and affordable alternatives.
- **Symptom Recommendations**: OTC remedies for fever, cold, stomach acid, allergies, or pain.
- **Drug Combinations & Safety**: Checking if two medicines can be taken together.`,
    suggestedFollowUps: [
      'What medicine is best for sudden fever and headache?',
      'How & when should I take Pan-D for acidity?',
      'Can I take Paracetamol and Cetirizine together?',
      'Suggest good vitamins for hair fall and energy.'
    ],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

export const DrMedyAiChat: React.FC = () => {
  const { 
    drMedyChatOpen, 
    setDrMedyChatOpen, 
    pendingAiPrompt, 
    clearPendingAiPrompt,
    medicines,
    addToCart,
    addToast 
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (drMedyChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, drMedyChatOpen, loading]);

  // Handle pending AI prompts from outside (e.g. "Ask Dr. Medy about this medicine")
  useEffect(() => {
    if (drMedyChatOpen && pendingAiPrompt) {
      const promptToSend = pendingAiPrompt;
      clearPendingAiPrompt();
      handleSendMessage(promptToSend);
    }
  }, [drMedyChatOpen, pendingAiPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build conversation history for context
      const history = messages
        .filter(m => m.id !== 'welcome-1')
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const res = await sendPharmacistChatMessage(query, history);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: res.reply,
        recommendedMedicines: res.recommendedMedicines,
        suggestedFollowUps: res.suggestedFollowUps,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: 'I apologize, I am temporarily having trouble connecting to the medical pharmacology server. Please try asking again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = (medId: string) => {
    const med = medicines.find(m => m.id === medId);
    if (med) {
      addToCart(med, 1);
      setAddedIds(prev => [...prev, medId]);
    }
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    setAddedIds([]);
    addToast('Chat conversation refreshed', 'info');
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (Bottom Right) */}
      {!drMedyChatOpen && (
        <button
          onClick={() => setDrMedyChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-xl shadow-emerald-900/30 flex items-center gap-2.5 transition-all hover:scale-105 group border border-emerald-400/30 cursor-pointer"
          title="Ask Dr. Medy AI Pharmacist"
          id="dr-medy-floating-trigger"
        >
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-100" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-emerald-900 animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-extrabold leading-none flex items-center gap-1">
              <span>Dr. Medy AI</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </div>
            <span className="text-[10px] text-emerald-200 font-medium">Pharmacist Assistant</span>
          </div>
        </button>
      )}

      {/* CHAT DRAWER / POPUP */}
      {drMedyChatOpen && (
        <div 
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-h-[85vh] sm:max-h-[640px] h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          id="dr-medy-chat-window"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">Dr. Medy AI</h3>
                  <span className="bg-emerald-400/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80">Clinical AI Pharmacist Guidance</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Clear & restart chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDrMedyChatOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Safety Micro-Banner */}
          <div className="bg-emerald-50 px-3 py-1.5 border-b border-emerald-100 flex items-center gap-2 text-[10px] text-emerald-900 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Answers grounded in Indian Pharmacopoeia & clinical medicine monographs.</span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div 
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2.5`}>
                    {/* Message text bubble */}
                    <div 
                      className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}
                    >
                      <div className="whitespace-pre-line">
                        {msg.text}
                      </div>
                      <div className={`text-[9px] mt-1 text-right ${isUser ? 'text-emerald-200' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </div>
                    </div>

                    {/* Recommended Meds Embedded Cards */}
                    {msg.recommendedMedicines && msg.recommendedMedicines.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Suggested Catalog Medicines</span>
                        </div>
                        {msg.recommendedMedicines.map((item: any) => {
                          const isAdded = addedIds.includes(item.id);
                          const catalogMed = medicines.find(m => m.id === item.id) || item;

                          return (
                            <div
                              key={item.id}
                              className="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 text-xs truncate block">
                                  {catalogMed.name}
                                </span>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {catalogMed.dosage} • ₹{catalogMed.price}
                                </div>
                              </div>

                              <button
                                onClick={() => handleAddMedicine(catalogMed.id)}
                                disabled={isAdded}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer ${
                                  isAdded
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>+ Cart</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Follow-up question quick buttons */}
                    {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggestedFollowUps.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            disabled={loading}
                            className="text-left text-[11px] bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading typing bubble */}
            {loading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white rounded-2xl rounded-tl-none border border-slate-200 text-slate-500 text-xs flex items-center gap-2 shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Dr. Medy is reviewing pharmacology notes...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about dosage, fever, side effects..."
                className="flex-1 px-3.5 py-2.5 bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs sm:text-sm focus:outline-none transition-colors"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-sm cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
