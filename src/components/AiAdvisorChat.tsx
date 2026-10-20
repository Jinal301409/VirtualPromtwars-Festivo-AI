import React, { useState } from 'react';
import { EventPlan, AssistantMessage } from '../types/event';
import { Sparkles, Send, Bot, User, RefreshCw, MessageSquare, Lightbulb } from 'lucide-react';

interface AiAdvisorChatProps {
  event: EventPlan;
}

export const AiAdvisorChat: React.FC<AiAdvisorChatProps> = ({ event }) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your Festivo AI Event Director. I've analyzed all parameters for **${event.input.name}** (Budget: ₹${event.input.budgetINR.toLocaleString('en-IN')}, ${event.input.guestCount} guests in ${event.input.location}). How can I assist you with vendor negotiations, logistics, menu adjustments, or custom ideas today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'How should I negotiate outside vendor penalties with the venue?',
    'Suggest 3 memorable wedding/event favor ideas within ₹400 each',
    'What should our hourly schedule look like on the day of the event?',
    'What are the best vegetarian live counters to pair with this theme?',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const q = (queryText || inputQuestion).trim();
    if (!q || loading) return;

    const userMsg: AssistantMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const response = await fetch('/api/ask-event-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          eventContext: event,
        }),
      });

      if (!response.ok) {
        throw new Error(`Advisor query returned error ${response.status}`);
      }

      const data = await response.json();
      const botMsg: AssistantMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'I could not generate an answer at this time.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Advisor chat error:', err);
      const errorMsg: AssistantMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `I encountered an issue connecting to the AI planning service (${err.message || 'Error'}). Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#2A1625]/10 shadow-sm overflow-hidden flex flex-col h-[650px]">
      
      {/* Header */}
      <div className="p-5 border-b border-[#2A1625]/10 flex items-center justify-between bg-[#FAF7F2]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E05A47] text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2A1625]">
              Festivo AI Event Director
            </h3>
            <p className="text-xs text-[#2A1625]/60">
              Personalized recommendations for {event.input.name} · Gemini 3.8 Flash
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-[#2A1625]/50 hidden sm:inline">
          Server-Side GenAI Grounded
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-5 py-3 bg-[#FAF7F2]/40 border-b border-[#2A1625]/5 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#2A1625]/60 shrink-0 uppercase tracking-wider flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-[#E05A47]" />
            <span>Try Asking:</span>
          </span>
          <div className="flex items-center gap-2">
            {sampleQuestions.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleSendMessage(sq)}
                className="px-2.5 py-1 text-xs bg-white border border-[#2A1625]/15 hover:border-[#E05A47]/40 rounded-full text-[#2A1625]/80 hover:text-[#2A1625] whitespace-nowrap transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-[#2A1625] text-white' : 'bg-[#E05A47]/10 text-[#E05A47]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#2A1625] text-white rounded-tr-none'
                    : 'bg-[#FAF7F2] text-[#2A1625] border border-[#2A1625]/10 rounded-tl-none whitespace-pre-line'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1.5 font-mono ${
                    isUser ? 'text-white/60 text-right' : 'text-[#2A1625]/40'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#E05A47]/10 text-[#E05A47] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#FAF7F2] border border-[#2A1625]/10 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-[#2A1625]/70">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E05A47]" />
              <span>Festivo AI is formulating expert event guidance...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-[#2A1625]/10 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about budget cuts, vendor negotiations, or timing..."
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#2A1625]/15 rounded-xl text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || loading}
            className="p-2.5 bg-[#E05A47] hover:bg-[#d44e3b] disabled:opacity-50 text-white rounded-xl transition-colors shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
