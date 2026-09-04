"use client";

import { useState, useEffect, useRef } from 'react';
import { Activity, Send, AlertTriangle, RefreshCw, X, Mic, Bot, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';
import { io } from 'socket.io-client';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/LiveMap'), { 
  ssr: false,
  loading: () => <div className="h-48 bg-gray-200 animate-pulse flex items-center justify-center">Loading Map...</div>
});

let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://medireach-idb2.onrender.com';
const API_URL = rawApiUrl.replace(/\/$/, '');

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: '**MediReach AI Dispatch** online. Do you have a medical emergency?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [severity, setSeverity] = useState(null);
  const [dispatchInfo, setDispatchInfo] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Voice output state
  const [isMuted, setIsMuted] = useState(false);

  const speakText = (text) => {
    if (isMuted || typeof window === 'undefined') return;
    
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    
    // Clean up markdown before speaking
    const plainText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(plainText);
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha') || v.lang === 'en-US');
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Pre-load voices
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInput(currentTranscript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setInput('');
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Microphone is not supported in this browser.");
      }
    }
  };

  useEffect(() => {
    if (isOpen && !sessionId) {
      setSessionId(uuidv4());
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    const socket = io(API_URL);
    socket.emit('join_dispatch_room', sessionId);
    
    socket.on('dispatch_update', (data) => {
      setDispatchInfo(data);
      const dispatchMsg = `?? **DISPATCH UPDATE:** ${data.message}\n\n**Ambulance from:** ${data.hospital_assigned}`;
      setMessages(prev => [...prev, {
        role: 'model',
        content: dispatchMsg
      }]);
      speakText(`Dispatch update. ${data.message}`);
    });

    socket.on(`chat:stream:${sessionId}`, (chunk) => {
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg.role === 'model') {
          lastMsg.content += chunk;
        } else {
          newMsgs.push({ role: 'model', content: chunk });
        }
        return newMsgs;
      });
      setIsLoading(false);
    });

    return () => socket.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, isMuted]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen, dispatchInfo, input]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Stop recording if speaking
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: userMsg })
      });
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Server responded with an error');
      }
      
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs[newMsgs.length - 1].role === 'model') {
          newMsgs[newMsgs.length - 1].content = data.response;
        } else {
          newMsgs.push({ role: 'model', content: data.response });
        }
        return newMsgs;
      });

      // Speak the final AI response
      speakText(data.response);

      if (data.severity) setSeverity(data.severity);
      if (data.dispatchInfo) setDispatchInfo(data.dispatchInfo);
    } catch (error) {
      console.error("Chatbot Fetch Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: `?? Connection Error: ${error.message}. API_URL: ${API_URL}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSessionId(uuidv4());
    setMessages([{ role: 'model', content: '**MediReach AI Dispatch Reset.** Ready for new emergency.' }]);
    setSeverity(null);
    setDispatchInfo(null);
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    setInput('');
    window.speechSynthesis.cancel();
  };

  return (
    <div className="fixed bottom-6 right-28 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div className="bg-white w-[350px] sm:w-[400px] h-[600px] max-h-[80vh] shadow-2xl rounded-2xl border border-gray-200 mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-red-700 text-white p-4 flex items-center justify-between shadow-md z-10">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1 rounded-full"><Bot className="w-5 h-5 text-red-700" /></div>
              <div>
                <h3 className="font-bold text-sm leading-tight">AI Emergency Dispatch</h3>
                <p className="text-xs text-red-200">Response time: &lt;1 min</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (!isMuted) window.speechSynthesis.cancel();
                  setIsMuted(!isMuted);
                }} 
                className="p-1.5 hover:bg-red-800 rounded-md transition" 
                title={isMuted ? "Unmute Voice" : "Mute Voice"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button onClick={handleReset} className="p-1.5 hover:bg-red-800 rounded-md transition" title="Reset">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-red-800 rounded-md transition" title="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Triage Alert */}
          {severity && (
            <div className={`px-4 py-1.5 text-xs font-bold text-white flex items-center justify-center ${
              severity === 'CRITICAL' ? 'bg-red-600 animate-pulse' : 
              severity === 'HIGH' ? 'bg-orange-500' : 
              severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              TRIAGE LEVEL: {severity}
            </div>
          )}

          {/* Mini Map (If Dispatched) */}
          {dispatchInfo && (
            <div className="h-40 w-full border-b border-gray-200 relative shrink-0">
              <LiveMap patientCoords={dispatchInfo.patientCoords} hospitalCoords={dispatchInfo.hospitalCoords} />
              <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur text-xs font-bold p-2 rounded shadow-md z-[1000] border border-red-100 flex items-center">
                <Activity className="w-4 h-4 text-red-600 mr-2 animate-pulse" />
                <span>ETA: {dispatchInfo.estimated_arrival} ({dispatchInfo.estimated_distance_km})</span>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Bot className="w-4 h-4 text-red-600" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gray-900 text-white rounded-br-sm' 
                    : 'bg-white border-l-2 border-red-600 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm prose-p:leading-relaxed prose-li:my-0.5 max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 rounded-2xl rounded-bl-sm px-4 py-2 text-sm shadow-sm border border-gray-100 flex items-center gap-1.5 ml-8">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={toggleListening}
                className={`p-2.5 rounded-full transition-colors shadow-md shrink-0 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type your emergency..."}
                className="flex-1 bg-gray-100 border-transparent rounded-full py-2.5 px-4 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all shadow-inner"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading} 
                className="p-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 transition-colors shadow-md shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 ${
          isOpen ? 'bg-gray-800 rotate-90' : 'bg-red-600 hover:bg-red-700 animate-bounce'
        }`}
      >
        {isOpen ? <X className="w-8 h-8 text-white" /> : <Bot className="w-8 h-8 text-white" />}
      </button>

    </div>
  );
}
