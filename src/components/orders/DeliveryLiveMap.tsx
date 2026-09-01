import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  Compass, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Layers, 
  Maximize2, 
  Minimize2,
  Bike,
  Sparkles,
  PhoneCall,
  Crown
} from 'lucide-react';
import { Order } from '../../types';
import { HELPLINE_NUMBER } from '../../data/medicines';

interface DeliveryLiveMapProps {
  order: Order;
  className?: string;
}

// Route waypoint coordinates representing route from pharmacy hub to delivery address
interface Waypoint {
  lat: number;
  lng: number;
  landmark: string;
  speedKmH: number;
  distanceFromStartKm: number;
}

export const DeliveryLiveMap: React.FC<DeliveryLiveMapProps> = ({ order, className = '' }) => {
  // Hub: MedyFay Express Hub (e.g. Park Street / Central Hub)
  const hubLocation = {
    name: 'MedyFay Central Pharmacy Hub (Kolkata #04)',
    address: 'Camac Street, Park Street Area',
    lat: 22.5510,
    lng: 88.3526,
  };

  // Destination based on order city / street
  const destLocation = {
    name: order.deliveryAddress?.street || 'Delivery Address',
    city: order.deliveryAddress?.city || 'Kolkata, WB',
    lat: 22.5726,
    lng: 88.3639,
  };

  // Pre-calculated route path coordinates between Hub and Destination
  const routeWaypoints: Waypoint[] = [
    { lat: 22.5510, lng: 88.3526, landmark: 'Pharmacy Hub - Order Dispatched', speedKmH: 0, distanceFromStartKm: 0.0 },
    { lat: 22.5545, lng: 88.3540, landmark: 'Exiting Camac Street Hub onto Main Road', speedKmH: 24, distanceFromStartKm: 0.4 },
    { lat: 22.5590, lng: 88.3562, landmark: 'Crossing Park Street Metro Intersection', speedKmH: 32, distanceFromStartKm: 0.9 },
    { lat: 22.5630, lng: 88.3585, landmark: 'Taking Esplanade Express Flyover corridor', speedKmH: 38, distanceFromStartKm: 1.5 },
    { lat: 22.5670, lng: 88.3610, landmark: 'Entering Delivery Area neighborhood lane', speedKmH: 26, distanceFromStartKm: 2.1 },
    { lat: 22.5700, lng: 88.3625, landmark: 'Near landmark: 150m away from your gate', speedKmH: 18, distanceFromStartKm: 2.5 },
    { lat: 22.5726, lng: 88.3639, landmark: 'Arrived at your Doorstep with Medicine Kit', speedKmH: 0, distanceFromStartKm: 2.8 },
  ];

  // Rider state
  const riderInfo = {
    name: 'Ramesh Kumar',
    phone: '+919830122334',
    rating: 4.95,
    deliveriesCount: 1420,
    vehicle: 'Ather 450X Electric Scooter (WB-02-AK-7789)',
    batteryLevel: 86,
    isVaccinated: true,
    temperature: '98.4°F',
    queenPriorityRider: true,
  };

  // State
  const [progress, setProgress] = useState<number>(0.45); // 0 (Hub) to 1 (Delivered)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [mapStyle, setMapStyle] = useState<'street' | 'dark' | 'satellite'>('street');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [recordedTrail, setRecordedTrail] = useState<{ x: number; y: number; time: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute interpolated position along waypoints
  const totalWaypoints = routeWaypoints.length - 1;
  const rawIndex = progress * totalWaypoints;
  const baseIndex = Math.min(Math.floor(rawIndex), totalWaypoints - 1);
  const segmentFraction = rawIndex - baseIndex;

  const currentWp = routeWaypoints[baseIndex];
  const nextWp = routeWaypoints[Math.min(baseIndex + 1, totalWaypoints)];

  const currentLat = currentWp.lat + (nextWp.lat - currentWp.lat) * segmentFraction;
  const currentLng = currentWp.lng + (nextWp.lng - currentWp.lng) * segmentFraction;
  const currentSpeed = Math.round(currentWp.speedKmH + (nextWp.speedKmH - currentWp.speedKmH) * segmentFraction);
  const totalDistanceKm = 2.8;
  const currentDistanceKm = (progress * totalDistanceKm).toFixed(1);
  const remainingDistanceKm = Math.max(0, (totalDistanceKm - parseFloat(currentDistanceKm))).toFixed(1);
  
  // Estimated minutes remaining (calculated dynamically from speed & remaining distance)
  const etaMinutes = Math.max(1, Math.round((parseFloat(remainingDistanceKm) / 25) * 60) + 2);

  // Convert GPS Coordinates (Lat, Lng) to SVG Canvas (X, Y) Coordinates
  // Bounding box for mapping
  const minLat = 22.5480;
  const maxLat = 22.5760;
  const minLng = 22.5500;
  const maxLng = 22.5670;

  const getCanvasCoords = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 500 + 50;
    const y = 350 - ((lat - minLat) / (maxLat - minLat)) * 300;
    return { x: Math.max(30, Math.min(570, x)), y: Math.max(30, Math.min(370, y)) };
  };

  const hubCoords = getCanvasCoords(hubLocation.lat, hubLocation.lng);
  const destCoords = getCanvasCoords(destLocation.lat, destLocation.lng);
  const riderCoords = getCanvasCoords(currentLat, currentLng);

  // Continuous movement loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          return 1;
        }
        const nextVal = prev + 0.008 * playbackSpeed;
        return nextVal >= 1 ? 1 : nextVal;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Record breadcrumb trail for movement telemetry
  useEffect(() => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setRecordedTrail((prev) => {
      const last = prev[prev.length - 1];
      if (!last || Math.hypot(last.x - riderCoords.x, last.y - riderCoords.y) > 8) {
        return [...prev.slice(-40), { x: riderCoords.x, y: riderCoords.y, time: now }];
      }
      return prev;
    });
  }, [riderCoords.x, riderCoords.y]);

  const handleResetSimulation = () => {
    setProgress(0);
    setRecordedTrail([]);
    setIsPlaying(true);
  };

  // Generate SVG path string
  const allPathPoints = routeWaypoints.map(wp => getCanvasCoords(wp.lat, wp.lng));
  const svgPathData = allPathPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');

  return (
    <div 
      ref={containerRef}
      className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col bg-slate-900 text-white' : ''
      } ${className}`}
    >
      {/* Header with Rider & Status */}
      <div className={`p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3 ${
        isFullscreen ? 'bg-slate-950 border-slate-800' : 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
              RK
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-0.5 rounded-full ring-2 ring-slate-900">
              <Crown className="w-3 h-3 fill-slate-950" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-sm sm:text-base text-white">{riderInfo.name}</h3>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live GPS Active
              </span>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Queen 15-Min Delivery
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{riderInfo.vehicle}</span>
              <span>•</span>
              <span className="text-emerald-300 font-semibold">{riderInfo.temperature} Verified</span>
              <span>•</span>
              <span className="text-amber-300 font-semibold">★ {riderInfo.rating}</span>
            </p>
          </div>
        </div>

        {/* Live CTA & Contacts */}
        <div className="flex items-center gap-2">
          <a
            href={`tel:${riderInfo.phone}`}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Call Delivery Partner"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Call Rider</span>
          </a>

          <a
            href={`https://wa.me/917908211103?text=Hi%20MedyFay,%20I%20am%20tracking%20Order%20%23${order.id}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer"
            title="Chat on WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">WhatsApp</span>
          </a>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors border border-white/20 cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Live Map Canvas Screen */}
      <div className="relative w-full h-[360px] sm:h-[420px] bg-slate-900 overflow-hidden select-none">
        
        {/* Map Background Canvas Styling */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${
          mapStyle === 'street' 
            ? 'bg-[#1e293b]' 
            : mapStyle === 'dark' 
            ? 'bg-[#0f172a]' 
            : 'bg-[#132219]'
        }`}>
          {/* Street Grid pattern overlay */}
          <svg className="w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.75" />
              </pattern>
              <pattern id="subgrid" width="120" height="120" patternUnits="userSpaceOnUse">
                <rect width="120" height="120" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#subgrid)" />
          </svg>

          {/* City Arterial Roads Simulated */}
          <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" viewBox="0 0 600 400" preserveAspectRatio="none">
            <path d="M 0,200 Q 300,180 600,220" stroke="#475569" strokeWidth="8" fill="none" />
            <path d="M 150,0 Q 200,200 250,400" stroke="#475569" strokeWidth="6" fill="none" />
            <path d="M 450,0 Q 420,200 380,400" stroke="#475569" strokeWidth="6" fill="none" />
            <path d="M 0,100 L 600,120" stroke="#334155" strokeWidth="4" fill="none" />
            <path d="M 0,310 L 600,290" stroke="#334155" strokeWidth="4" fill="none" />
          </svg>
        </div>

        {/* Live Vector SVG Overlay for Route & Waypoints */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 400" preserveAspectRatio="none">
          <defs>
            {/* Pulsing Gradient for active route */}
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Full Planned Delivery Route Base Line */}
          <path 
            d={svgPathData} 
            stroke="#334155" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />

          {/* Active Route with Glow */}
          <path 
            d={svgPathData} 
            stroke="url(#routeGrad)" 
            strokeWidth="5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeDasharray="6 4"
            fill="none" 
            filter="url(#glow)"
            className="animate-pulse"
          />

          {/* Breadcrumb history trail */}
          {recordedTrail.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={2}
              fill="#10b981"
              opacity={0.3 + (i / recordedTrail.length) * 0.7}
            />
          ))}

          {/* Connector line between Rider and Next Landmark */}
          <line
            x1={riderCoords.x}
            y1={riderCoords.y}
            x2={destCoords.x}
            y2={destCoords.y}
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
        </svg>

        {/* 1. Hub Marker (Start) */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto z-10 group"
          style={{ left: `${(hubCoords.x / 600) * 100}%`, top: `${(hubCoords.y / 400) * 100}%` }}
        >
          <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-emerald-500/30">
            <Zap className="w-5 h-5 text-amber-300" />
          </div>
          <div className="mt-1 px-2 py-0.5 bg-slate-900/90 text-white rounded-md text-[9px] font-bold whitespace-nowrap shadow-md border border-slate-700">
            Pharmacy Hub (Origin)
          </div>
        </div>

        {/* 2. Destination Marker (Patient Home) */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto z-10"
          style={{ left: `${(destCoords.x / 600) * 100}%`, top: `${(destCoords.y / 400) * 100}%` }}
        >
          <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-rose-500/30 animate-bounce">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="mt-1 px-2.5 py-0.5 bg-slate-900/90 text-white rounded-md text-[9px] font-bold whitespace-nowrap shadow-md border border-slate-700">
            Your Delivery Location
          </div>
        </div>

        {/* 3. Live Rider Marker with Pulse Ring & Bike Badge */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto z-20 transition-all duration-300"
          style={{ left: `${(riderCoords.x / 600) * 100}%`, top: `${(riderCoords.y / 400) * 100}%` }}
        >
          {/* Radar ripple rings */}
          <div className="absolute -inset-3 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
          <div className="absolute -inset-6 rounded-full bg-emerald-400/15 animate-pulse pointer-events-none" />

          {/* Rider Icon Card */}
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-emerald-400/40">
            <Bike className="w-6 h-6 text-white" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black border border-white">
              ⚡
            </span>
          </div>

          {/* Floating Speed & Status Tag */}
          <div className="mt-1.5 px-2.5 py-1 bg-slate-950/95 text-white rounded-xl text-[10px] font-extrabold whitespace-nowrap shadow-xl border border-emerald-500/40 flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-300 font-mono">{currentSpeed} km/h</span>
            <span className="text-slate-400">|</span>
            <span className="text-white">{progress >= 1 ? 'Arrived!' : `${etaMinutes}m ETA`}</span>
          </div>
        </div>

        {/* Map UI Control Widgets (Floating Top-Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-30">
          <div className="bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-white shadow-xl max-w-[240px] sm:max-w-xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rider Telemetry</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                {Math.round(progress * 100)}% Complete
              </span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Current Phase:</span>
                <span className="font-bold text-white truncate max-w-[140px] text-right">{currentWp.landmark}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Distance Covered:</span>
                <span className="font-bold text-emerald-400 font-mono">{currentDistanceKm} km / {totalDistanceKm} km</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Remaining to Door:</span>
                <span className="font-bold text-amber-300 font-mono">{remainingDistanceKm} km ({etaMinutes} mins)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Layers & Style Controls (Floating Top-Right) */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 z-30">
          <button
            onClick={() => setMapStyle('street')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              mapStyle === 'street' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Street
          </button>
          <button
            onClick={() => setMapStyle('dark')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              mapStyle === 'dark' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              mapStyle === 'satellite' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Eco Grid
          </button>
        </div>

        {/* Live Simulation Controls (Floating Bottom-Center) */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 text-white shadow-2xl flex items-center gap-3 z-30">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
            title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={handleResetSimulation}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Restart Route from Hub"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800" />

          {/* Speed selector */}
          <div className="flex items-center gap-1">
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                  playbackSpeed === spd ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Scrub slider */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={progress}
            onChange={(e) => {
              setProgress(parseFloat(e.target.value));
              setIsPlaying(false);
            }}
            className="w-20 sm:w-28 accent-emerald-500 cursor-pointer"
            title="Scrub Live GPS Progress"
          />
        </div>
      </div>

      {/* Bottom Timeline Milestones Bar */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span className="font-extrabold text-slate-900">Live Delivery Route Milestones</span>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            {progress >= 1 ? 'Delivered safely with tamper-proof seal' : 'Queen Express Electric Fleet'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {routeWaypoints.slice(0, 4).map((wp, idx) => {
            const isPassed = (progress * 3) >= idx;
            return (
              <div 
                key={idx}
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  isPassed 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold">Checkpoint #{idx + 1}</span>
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </div>
                <p className="text-[11px] leading-tight line-clamp-2">{wp.landmark}</p>
              </div>
            );
          })}
        </div>

        {/* Footer Support Hotline */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Delivery monitored 24x7 by MedyFay Command Dispatch & Emergency Response.</span>
          </div>
          <a
            href={`tel:${HELPLINE_NUMBER}`}
            className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <Phone className="w-3.5 h-3.5" /> Helpline: {HELPLINE_NUMBER}
          </a>
        </div>
      </div>
    </div>
  );
};
