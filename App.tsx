import React, { useState, useRef, useEffect } from 'react';
import { analyzePeaLocation } from './services/geminiService';
import { ChatMessage } from './types';
import AnalysisResult from './components/AnalysisResult';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial setup: Check API Key and Request Geolocation
  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyError(true);
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Geolocation permission denied or error:", error);
        }
      );
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim() || loading) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await analyzePeaLocation(newMessage.text, userLocation);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.text, // The clean text
        timestamp: Date.now(),
        result: response.result || undefined, // The structured JSON result
        mapLinks: response.mapLinks
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ AI กรุณาลองใหม่อีกครั้ง",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (apiKeyError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border-l-4 border-red-500">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-700">ไม่พบ API Key ในระบบ</p>
          <p className="text-gray-500 text-sm mt-2">กรุณาตั้งค่า <code>process.env.API_KEY</code> ใน Environment Variable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-purple-800 text-white shadow-lg shrink-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-purple-900 font-bold shadow-inner border-2 border-white">
              กฟภ
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">ระบบสำรวจพื้นที่ PEA</h1>
              <p className="text-xs text-purple-200">PEA Area Surveyor Intelligence</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium bg-purple-900/50 px-3 py-1 rounded-lg">
              สถานะ: {userLocation ? 'ระบุพิกัดแล้ว' : 'ไม่ทราบพิกัดผู้ใช้'}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20 px-4">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">สวัสดีครับเจ้าหน้าที่สำรวจ</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                พิมพ์รายละเอียดสถานที่, จุดสังเกต, หรือตำบล/อำเภอ ที่ท่านต้องการตรวจสอบ 
                ระบบจะช่วยวิเคราะห์สังกัดการไฟฟ้าและพื้นที่รับผิดชอบให้ทันที
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
                <button onClick={() => setQuery("หม้อแปลงระเบิดหน้าตลาดน้ำอัมพวา")} className="p-3 bg-white border hover:border-purple-500 rounded-lg shadow-sm hover:shadow text-sm text-gray-600 transition-all">
                  "หม้อแปลงระเบิดหน้าตลาดน้ำอัมพวา..."
                </button>
                <button onClick={() => setQuery("ขอขยายเขตไฟฟ้าแถว ไร่สุวรรณ ปากช่อง")} className="p-3 bg-white border hover:border-purple-500 rounded-lg shadow-sm hover:shadow text-sm text-gray-600 transition-all">
                  "ขอขยายเขตไฟฟ้าแถว ไร่สุวรรณ ปากช่อง..."
                </button>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] lg:max-w-[80%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
                
                {/* Render Analysis Result Card if available */}
                {msg.role === 'assistant' && msg.result && (
                  <AnalysisResult result={msg.result} mapLinks={msg.mapLinks} />
                )}
                
                <p className={`text-xs ${msg.role === 'user' ? 'text-right text-gray-400' : 'text-left text-gray-400'}`}>
                   {new Date(msg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <span className="text-sm text-gray-500 ml-2">กำลังวิเคราะห์พิกัดและค้นหาข้อมูล...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 p-4 shrink-0">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
             <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-12 py-3 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-inner text-gray-800 placeholder-gray-500"
            placeholder="พิมพ์คำถามเกี่ยวกับพื้นที่ หรือสถานที่..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!query.trim() || loading}
            className={`absolute right-2 top-1.5 p-1.5 rounded-full transition-all ${
              !query.trim() || loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
            }`}
          >
            <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <div className="max-w-4xl mx-auto mt-2 text-center">
            <p className="text-xs text-gray-400">
                ระบบใช้ Gemini 2.5 Flash และ Google Maps Grounding เพื่อความแม่นยำสูงสุด
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;