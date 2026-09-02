"use client";

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Activity, AlertTriangle, Clock, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import { Card } from "@/components/ui/card";

export default function HospitalAdmin() {
  const [dispatches, setDispatches] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to the AI Dispatcher Backend WebSocket
    const socket = io('http://localhost:5005');

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for global dispatches
    socket.on('dispatch:new', (data) => {
      // Prepend the new dispatch to the list
      setDispatches(prev => [data, ...prev]);
      
      // Speak alert out loud
      if (typeof window !== 'undefined') {
        const utterance = new SpeechSynthesisUtterance(`Emergency dispatch received. Triage level: ${data.severity}. Estimated arrival: ${data.eta}`);
        window.speechSynthesis.speak(utterance);
      }
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-red-600" />
              Hospital Dispatch Center
            </h1>
            <p className="text-gray-500 mt-1">Live AI incoming patient triage</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-sm font-semibold text-gray-600">
              {isConnected ? 'System Online (Listening)' : 'System Offline'}
            </span>
          </div>
        </div>

        {/* Dashboard Cards */}
        {dispatches.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-xl shadow-sm border border-gray-200">
            <Activity className="w-20 h-20 text-red-100 mx-auto mb-6 animate-pulse" />
            <h3 className="text-2xl font-bold text-gray-400">No active dispatches</h3>
            <p className="text-gray-400 mt-2">Waiting for AI dispatcher to route patients to this hospital...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dispatches.map((dispatch, idx) => (
              <Card key={idx} className="overflow-hidden border-2 border-red-100 shadow-xl animate-in slide-in-from-bottom-8">
                <div className={`p-4 text-white font-bold flex items-center justify-between ${
                  dispatch.severity === 'CRITICAL' ? 'bg-red-600 animate-pulse' :
                  dispatch.severity === 'HIGH' ? 'bg-orange-500' :
                  'bg-yellow-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    TRIAGE: {dispatch.severity}
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded tracking-wider">ID: #{dispatch.dispatchId}</span>
                </div>
                
                <div className="p-6 bg-white space-y-5">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned Hospital</h4>
                    <p className="font-bold text-xl text-gray-900">{dispatch.hospital?.name || "Searching..."}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" /> {dispatch.hospital?.distanceKm} km away from patient
                    </p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Patient Condition Summary</h4>
                    <p className="text-gray-900 font-medium leading-relaxed">{dispatch.patient?.condition}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-red-600 font-black text-lg tracking-tight">
                      <Clock className="w-5 h-5" />
                      ETA: {dispatch.eta}
                    </div>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition shadow-md hover:shadow-lg">
                      <CheckCircle className="w-4 h-4" /> Prepare ER
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
