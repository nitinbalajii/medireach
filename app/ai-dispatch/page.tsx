"use client";

import { useState, useEffect, useRef } from 'react';
import { Activity, MapPin, Send, AlertTriangle, RefreshCw, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';
import { io } from 'socket.io-client';
import dynamic from 'next/dynamic';

// Dynamically import map with ssr: false to prevent Next.js server-side errors with Leaflet
const LiveMap = dynamic(() => import('@/components/LiveMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
      <div className="text-gray-500 font-medium">Loading Map...</div>
    </div>
  )
});

const API_URL = 'http://localhost:5005';

export default function AIDispatch() {
  const [messages, setMessages] = useState([
    { role: 'model', content: '**MediReach AI Dispatch Online.** What is the nature of your emergency?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  // Triage state
  const [severity, setSeverity] = useState(null);
  const [dispatchInfo, setDispatchInfo] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Generate unique session ID for this emergency
    setSessionId(uuidv4());
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    // Connect to WebSocket for real-time dispatch updates
    const socket = io(API_URL);
    
    socket.emit('join_dispatch_room', sessionId);

    socket.on('dispatch_update', (data) => {
      console.log('Dispatch update received:', data);
      setDispatchInfo(data);
      
      // Auto-append the dispatch message to chat if not already sent
      setMessages(prev => [...prev, {
        role: 'model',
        content: `🚨 **DISPATCH UPDATE:** ${data.message}\n\n**Ambulance en route from:** ${data.hospital_assigned}`
      }]);
    });

    return () => socket.disconnect();
  }, [sessionId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMsg
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'model', content: data.response }]);
      
      if (data.severity) {
        setSeverity(data.severity);
      }
      if (data.dispatchInfo) {
        setDispatchInfo(data.dispatchInfo);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: '?? Connection lost to MediReach AI. Please call emergency services directly.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSessionId(uuidv4());
    setMessages([{ role: 'model', content: '**MediReach AI Dispatch Reset.** Ready for new emergency.' }]);
    setSeverity(null);
    setDispatchInfo(null);
  };

  const getSeverityColor = () => {
    switch(severity) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'CRITICAL': return 'bg-red-600 animate-pulse';
      default: return 'bg-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-screen relative bg-gray-100">
      
      {/* Header & Triage Banner */}
      <div className="flex flex-col z-20 shadow-md">
        <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center">
            <span className="text-2xl mr-2">+</span> MediReach AI Dispatch
          </h1>
          <button onClick={handleReset} className="flex items-center text-sm bg-red-800 px-3 py-1.5 rounded-lg hover:bg-red-900 transition">
            <RefreshCw className="w-4 h-4 mr-2" /> Start New Call
          </button>
        </div>
        
        {severity && (
          <div className={`${getSeverityColor()} text-white py-2 px-4 flex items-center justify-center font-bold tracking-widest transition-colors duration-500`}>
            <AlertTriangle className="w-5 h-5 mr-2" />
            TRIAGE LEVEL: {severity}
          </div>
        )}
      </div>

      {/* Main Layout - 50/50 Split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left: Chat Section */}
        <div className="w-full md:w-1/2 flex flex-col bg-gray-50 border-r border-gray-200 z-10 shadow-lg relative">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <Activity className="w-5 h-5 text-red-600" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-md ${msg.role === 'user' ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-white border-l-4 border-red-600 text-gray-800 rounded-bl-sm'}`}>
                  {msg.role === 'user' ? (
                    <p className="text-[15px] leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm md:prose-base prose-p:leading-relaxed prose-li:my-1 max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-bl-sm px-5 py-3 shadow-sm border border-gray-200 flex items-center gap-2">
                  <div className="text-sm font-medium">Transmitting...</div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <form onSubmit={handleSend} className="flex items-end gap-3">
              <button type="button" className="p-3 text-white bg-gray-800 hover:bg-gray-900 rounded-full transition-colors shadow-md" title="Voice Input (Coming Soon)">
                <Mic className="w-6 h-6" />
              </button>
              <div className="flex-1 relative">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Describe your emergency..."
                  className="w-full bg-white border border-gray-300 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none shadow-sm text-base"
                  rows={1}
                  style={{ minHeight: '52px', maxHeight: '120px' }}
                />
              </div>
              <button type="submit" disabled={!input.trim() || isLoading} className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex-shrink-0">
                <Send className="w-6 h-6 ml-1" />
              </button>
            </form>
          </div>
        </div>

        {/* Right: Massive Map & Dispatch Overlay */}
        <div className="w-full md:w-1/2 bg-gray-200 relative flex flex-col h-full z-0">
          
          {/* Map Layer */}
          <div className="absolute inset-0">
            {dispatchInfo ? (
              <LiveMap patientCoords={dispatchInfo.patientCoords} hospitalCoords={dispatchInfo.hospitalCoords} />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
                <div className="text-center z-10 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-700">Awaiting Location Data</h2>
                  <p className="text-gray-500 mt-2">Map will initialize once an emergency is triaged.</p>
                </div>
              </div>
            )}
          </div>

          {/* Dispatch Status Floating Overlay */}
          {dispatchInfo && (
            <div className="absolute top-6 right-6 z-20 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-red-200 overflow-hidden transform transition-all">
              <div className="bg-red-600 text-white px-4 py-3 flex items-center">
                <Activity className="w-5 h-5 mr-2 animate-pulse" />
                <span className="font-bold tracking-wide">UNIT DISPATCHED</span>
              </div>
              <div className="p-5">
                <div className="text-xl font-black text-red-600 leading-tight mb-4">{dispatchInfo.message}</div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Assigned Unit</div>
                    <div className="font-semibold text-gray-800">{dispatchInfo.hospital_assigned}</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="text-xs text-gray-500 uppercase font-bold mb-1">ETA</div>
                      <div className="font-black text-2xl text-gray-800">{dispatchInfo.estimated_arrival}</div>
                    </div>
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="text-xs text-gray-500 uppercase font-bold mb-1">Distance</div>
                      <div className="font-black text-xl text-gray-800 mt-1">{dispatchInfo.estimated_distance_km}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>
        
      </div>
    </div>
  );
}
