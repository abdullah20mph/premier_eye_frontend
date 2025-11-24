
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Lead, Message } from '../types';
import { Search, Send, Paperclip, MoreVertical, Check, CheckCheck, Smile, Phone, Video, User, MessageSquare, Info, MapPin, ChevronLeft } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

type Props = {
  leads: Lead[];
  onUpdateLead: (id: string, patch: Partial<Lead>) => void;
  onLeadInfo: (id: string) => void;
};

export default function WhatsAppPage({ leads, onUpdateLead, onLeadInfo }: Props) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter leads that actually have messages or are new, sort by latest message time
  const activeConversations = useMemo(() => {
    return leads
      .filter(l => l.messages.length > 0)
      .filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search))
      .sort((a, b) => {
        const lastMsgA = a.messages[a.messages.length - 1];
        const lastMsgB = b.messages[b.messages.length - 1];
        if (!lastMsgA) return 1;
        if (!lastMsgB) return -1;
        return new Date(lastMsgB.ts).getTime() - new Date(lastMsgA.ts).getTime();
      });
  }, [leads, search]);

  const selectedLead = useMemo(() => 
    leads.find(l => l.id === selectedLeadId), 
  [leads, selectedLeadId]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (selectedLeadId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedLead?.messages, selectedLeadId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedLead) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      from: 'bot', // 'bot' represents the Agent/VA in this context
      text: inputText,
      ts: new Date().toISOString()
    };

    const updatedMessages = [...selectedLead.messages, newMessage];
    
    // Simulate API call to WhatsApp Business API here
    onUpdateLead(selectedLead.id, { messages: updatedMessages });
    setInputText('');
  };

  const formatMessageTime = (isoString: string) => {
    const date = new Date(isoString);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MM/dd/yy');
  };

  return (
    <div className="h-[calc(100dvh-5rem)] md:h-[calc(100vh-4rem)] flex bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* LEFT SIDEBAR: Conversation List - Full width on mobile if no lead selected */}
      <div className={`${selectedLead ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-gray-200 bg-gray-50/50`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-black">Messages</h2>
            <div className="p-2 bg-gray-100 rounded-full">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-brand-blue border rounded-lg text-sm outline-none transition"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeConversations.map(lead => {
            const lastMsg = lead.messages[lead.messages.length - 1];
            const isSelected = selectedLeadId === lead.id;

            return (
              <div 
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition hover:bg-gray-100 ${isSelected ? 'bg-white border-l-4 border-l-brand-black shadow-sm' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-brand-black flex items-center justify-center text-brand-blue font-bold shrink-0">
                      {lead.name.charAt(0)}
                    </div>
                    {/* Online Status Indicator Mock */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-sm font-bold truncate ${isSelected ? 'text-brand-black' : 'text-gray-700'}`}>
                        {lead.name}
                      </h3>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {lastMsg ? formatMessageTime(lastMsg.ts) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate h-5">
                      {lastMsg ? (
                        <span className="flex items-center gap-1">
                          {lastMsg.from === 'bot' && <CheckCheck className="w-3 h-3 text-brand-blue" />}
                          {lastMsg.text}
                        </span>
                      ) : <span className="italic opacity-50">No messages yet</span>}
                    </p>
                    {/* Location in List */}
                    {lead.location && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-medium">
                            <MapPin className="w-3 h-3" /> {lead.location}
                        </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: Chat Interface - Full width on mobile if lead selected */}
      <div className={`${!selectedLead ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-[#F0F2F5] relative w-full`}>
        {selectedLead ? (
          <>
            {/* Chat Header */}
            <div className="bg-white px-4 md:px-6 py-3 border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3 md:gap-4">
                {/* Mobile Back Button */}
                <button 
                  onClick={() => setSelectedLeadId(null)}
                  className="md:hidden p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-black flex items-center justify-center text-brand-blue font-bold text-sm md:text-base">
                    {selectedLead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-brand-black text-sm md:text-base">{selectedLead.name}</h3>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="hidden md:inline">{selectedLead.phone}</span>
                    <span className="hidden md:inline w-1 h-1 bg-gray-300 rounded-full"></span>
                    {selectedLead.location && <span className="font-medium text-gray-600">{selectedLead.location}</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onLeadInfo(selectedLead.id)}
                  className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-brand-black text-brand-blue rounded-lg text-xs md:text-sm font-bold hover:bg-gray-800 transition shadow-sm whitespace-nowrap"
                >
                  <Info className="w-4 h-4" />
                  <span className="hidden sm:inline">Lead Info</span>
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-contain bg-opacity-5">
              <div className="text-center my-4">
                <span className="bg-yellow-50 text-yellow-800 text-[10px] md:text-xs px-3 py-1 rounded-full shadow-sm border border-yellow-100">
                  Messages are end-to-end encrypted.
                </span>
              </div>

              {selectedLead.messages.map((msg, idx) => {
                const isMe = msg.from === 'bot';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`
                        max-w-[80%] md:max-w-[70%] px-3 py-2 md:px-4 rounded-lg shadow-sm relative text-sm leading-relaxed
                        ${isMe 
                          ? 'bg-brand-black text-white rounded-tr-none' 
                          : 'bg-white text-gray-900 rounded-tl-none'}
                      `}
                    >
                      {msg.text}
                      <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                        {format(new Date(msg.ts), 'h:mm a')}
                        {isMe && <CheckCheck className="w-3 h-3 text-brand-blue" />}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="bg-white p-3 md:p-4 border-t border-gray-200 flex items-end gap-2 md:gap-3 shrink-0">
              <button type="button" className="p-2 text-gray-500 hover:text-brand-black transition hidden sm:block">
                <Smile className="w-6 h-6" />
              </button>
              <button type="button" className="p-2 text-gray-500 hover:text-brand-black transition">
                <Paperclip className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 md:px-4 focus-within:ring-2 focus-within:ring-brand-blue focus-within:bg-white transition">
                <input 
                  className="w-full bg-transparent border-none outline-none text-sm text-brand-black placeholder-gray-500"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className="p-2.5 md:p-3 bg-brand-black text-brand-blue rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              </button>
            </form>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 border-l border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <MessageSquare className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-600">WhatsApp for Business</h3>
            <p className="text-sm max-w-xs text-center mt-2">Select a conversation from the left to view chat history and respond to leads.</p>
          </div>
        )}
      </div>
    </div>
  );
}
