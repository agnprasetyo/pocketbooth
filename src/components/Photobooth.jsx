import React, { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import {
  Camera,
  RefreshCw,
  Download,
  Upload,
  Volume2,
  VolumeX,
  Timer,
  Sparkles,
  RotateCcw,
  LayoutGrid,
  Check,
  Sliders,
  Zap,
  Box,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Heart,
  X,
  Share2,
  Film,
  Copy,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import QRCode from 'qrcode';
import { savePhoto, getAllPhotos, deletePhoto, clearAllPhotos } from '../db/photoDb';
import { playCountdownBeep, playShutterSound } from '../utils/audio';
import { createGif } from '../utils/gif';

// ── Background Ambient SVGs (Requested exact paths & classes) ──
const Leaf = ({ className }) => (
  <svg className={className} viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 0 C10 30, 0 60, 10 90 C20 110, 40 120, 40 120 C40 120, 60 110, 70 90 C80 60, 70 30, 40 0Z" fill="currentColor" opacity="0.55" />
    <line x1="40" y1="10" x2="40" y2="115" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    <line x1="40" y1="40" x2="22" y2="60" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    <line x1="40" y1="55" x2="58" y2="70" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    <line x1="40" y1="70" x2="20" y2="85" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
  </svg>
);

const Flower = ({ className }) => (
  <svg className={className} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    {[0, 60, 120, 180, 240, 300].map((rot, i) => (
      <ellipse key={i} cx="30" cy="12" rx="8" ry="14" fill="currentColor" opacity="0.6"
        transform={`rotate(${rot} 30 30)`} />
    ))}
    <circle cx="30" cy="30" r="9" fill="#f5d06a" opacity="0.85" />
    <circle cx="30" cy="30" r="5" fill="#f0c040" />
  </svg>
);

// ── Photostrip Decorative Ornaments ──
const LeafStem1 = () => (
  <svg className="w-8 h-16 drop-shadow-xs" viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M10,75 Q20,40 15,10" fill="none" stroke="#5d7255" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M15,10 Q5,8 8,2 C12,-2 18,5 15,10 Z" fill="#788e6e" />
    <path d="M17,25 Q7,20 10,14 C14,8 20,17 17,25 Z" fill="#788e6e" />
    <path d="M15,40 Q5,35 8,29 C12,23 18,32 15,40 Z" fill="#788e6e" />
    <path d="M14,55 Q4,50 7,44 C11,38 17,47 14,55 Z" fill="#788e6e" />
    <path d="M18,18 Q28,15 25,9 C21,3 15,12 18,18 Z" fill="#788e6e" />
    <path d="M16,33 Q26,30 23,24 C19,18 13,27 16,33 Z" fill="#788e6e" />
    <path d="M15,48 Q25,45 22,39 C18,33 12,42 15,48 Z" fill="#788e6e" />
    <path d="M13,63 Q23,60 20,54 C16,48 10,57 13,63 Z" fill="#788e6e" />
  </svg>
);

const LeafStem2 = () => (
  <svg className="w-9 h-7 drop-shadow-xs" viewBox="0 0 50 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M5,35 Q25,25 45,5" fill="none" stroke="#5d7255" strokeWidth="2" strokeLinecap="round" />
    <path d="M45,5 Q40,15 35,12 C30,9 38,0 45,5 Z" fill="#8aa380" />
    <path d="M30,17 Q23,24 20,20 C17,16 26,10 30,17 Z" fill="#8aa380" />
    <path d="M18,25 Q11,32 8,28 C5,24 14,18 18,25 Z" fill="#8aa380" />
    <path d="M36,12 Q42,22 45,18 C48,14 39,8 36,12 Z" fill="#8aa380" />
    <path d="M24,21 Q30,31 33,27 C36,23 27,17 24,21 Z" fill="#8aa380" />
  </svg>
);

const HeartHandDrawn = ({ color = "#5d7255", width = 18, height = 18 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20 C9 18 3 13 3 8.5 C3 5.5 5.5 3 8.5 3 C10.5 3 11.5 4 12 5 C12.5 4 13.5 3 15.5 3 C18.5 3 21 5.5 21 8.5 C21 13 15 18 12 20 Z"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Washi Tape Component with Vintage & Futuristic variants ──
const WashiTape = ({ type = 'grid' }) => {
  if (type === 'none') return null;

  let patternStyle = {};
  let extraClass = 'bg-white/70 border-white/50';

  if (type === 'grid') {
    extraClass = 'bg-white/80 border-white/60';
    patternStyle = {
      backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)',
      backgroundSize: '5px 5px',
    };
  } else if (type === 'striped') {
    extraClass = 'bg-white/75';
    patternStyle = {
      backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.7), rgba(255,255,255,0.7) 3px, transparent 3px, transparent 7px)',
    };
  } else if (type === 'polka') {
    extraClass = 'bg-rose-200/80';
    patternStyle = {
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.85) 1.5px, transparent 1.5px)',
      backgroundSize: '6px 6px',
    };
  } else if (type === 'kraft') {
    extraClass = 'bg-[#dfbe9f]/90 border-[#c49f7e]/50';
  } else if (type === 'retro') {
    extraClass = 'bg-amber-100 border-amber-300/80';
    patternStyle = {
      backgroundImage: 'repeating-linear-gradient(90deg, #d97706 0px, #d97706 4px, #f59e0b 4px, #f59e0b 8px, #78350f 8px, #78350f 12px)',
    };
  } else if (type === 'cyber') {
    extraClass = 'bg-zinc-950/90 border-cyan-400/80 shadow-[0_0_8px_rgba(6,182,212,0.4)]';
    patternStyle = {
      backgroundImage: 'linear-gradient(to right, rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.3) 1px, transparent 1px)',
      backgroundSize: '4px 4px',
    };
  } else if (type === 'chrome') {
    extraClass = 'bg-gradient-to-r from-slate-300 via-white to-slate-400 border-slate-300 shadow-xs';
  }

  return (
    <div
      className={`absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 z-20 backdrop-blur-xs shadow-xs border ${extraClass} transform -rotate-1`}
      style={{
        ...patternStyle,
        clipPath: 'polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)',
      }}
    />
  );
};

// ── Theme-Matching Photostrip Ornaments (Rendered on Strip & Saved to Print) ──
function ThemeStripOrnaments({ type, text, border }) {
  if (type === 'botanical') {
    return (
      <>
        {/* Top-Right Mini Botanical Flower SVG */}
        <div className="absolute -top-3.5 -right-3.5 w-10 h-10 pointer-events-none z-30 drop-shadow-xs">
          <Flower className="w-full h-full text-[#e8b4a0]" />
        </div>
        {/* Bottom-Left Mini Botanical Leaf SVG */}
        <div className="absolute -bottom-3.5 -left-3.5 w-8 h-12 pointer-events-none z-30 transform -rotate-45 drop-shadow-xs">
          <Leaf className="w-full h-full text-[#5d7255]" />
        </div>
      </>
    );
  }

  if (type === 'retro70s') {
    return (
      <>
        {/* Top-Right 70s Cassette Tape SVG */}
        <div className="absolute -top-3.5 -right-2 pointer-events-none z-30 transform rotate-6">
          <svg className="w-11 h-7 text-amber-800 drop-shadow-xs" viewBox="0 0 48 32" fill="none">
            <rect x="2" y="2" width="44" height="28" rx="3" stroke="currentColor" strokeWidth="2" fill="#fef3c7" />
            <rect x="8" y="7" width="32" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="#f59e0b" fillOpacity="0.25" />
            <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" fill="#fff" />
            <circle cx="32" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" fill="#fff" />
            <line x1="16" y1="20" x2="32" y2="20" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
        {/* Bottom-Left 70s Sun Arc SVG */}
        <div className="absolute -bottom-3 -left-3 pointer-events-none z-30">
          <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
            <path d="M4 28 A12 12 0 0 1 28 28" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
            <path d="M8 28 A8 8 0 0 1 24 28" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M12 28 A4 4 0 0 1 20 28" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </>
    );
  }

  if (type === 'polaroid') {
    return (
      <>
        {/* Top-Left Vintage Paper Clip SVG */}
        <div className="absolute -top-3.5 left-4 pointer-events-none z-30 transform -rotate-12">
          <svg className="w-5 h-8 text-zinc-500 drop-shadow-xs" viewBox="0 0 20 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 10 V24 A4 4 0 0 0 14 24 V6 A4 4 0 0 0 6 6 V20 A2 2 0 0 0 10 20 V10" />
          </svg>
        </div>
        {/* Bottom-Right Vintage Postage Stamp Lines */}
        <div className="absolute bottom-2 right-2 pointer-events-none z-30 opacity-40">
          <svg className="w-10 h-6 text-zinc-600" viewBox="0 0 50 30" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M0 8 Q12 2 25 8 T50 8" />
            <path d="M0 15 Q12 9 25 15 T50 15" />
            <path d="M0 22 Q12 16 25 22 T50 22" />
          </svg>
        </div>
      </>
    );
  }

  if (type === 'filmroll') {
    return (
      <>
        {/* Top-Right 35mm Canister SVG */}
        <div className="absolute -top-3 -right-2 pointer-events-none z-30 transform rotate-12">
          <svg className="w-9 h-7 text-amber-200 drop-shadow-sm" viewBox="0 0 36 28" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="4" width="26" height="20" rx="3" fill="#1c1917" stroke="#d97706" />
            <rect x="28" y="8" width="6" height="12" rx="1" fill="#f59e0b" stroke="#d97706" />
            <circle cx="15" cy="14" r="5" stroke="#f59e0b" />
          </svg>
        </div>
        {/* Side Sprocket Holes */}
        <div className="absolute left-1 top-8 bottom-16 flex flex-col justify-around pointer-events-none opacity-30 z-20">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="w-1.5 h-2.5 border border-amber-200/60 rounded-xs" />
          ))}
        </div>
        <div className="absolute right-1 top-8 bottom-16 flex flex-col justify-around pointer-events-none opacity-30 z-20">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="w-1.5 h-2.5 border border-amber-200/60 rounded-xs" />
          ))}
        </div>
      </>
    );
  }

  if (type === 'cyber') {
    return (
      <>
        {/* 4 Cyber HUD Corner Brackets */}
        <svg className="w-5 h-5 text-cyan-400 absolute top-2 left-2 pointer-events-none z-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 9V3h6" />
        </svg>
        <svg className="w-5 h-5 text-cyan-400 absolute top-2 right-2 pointer-events-none z-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 9V3h-6" />
        </svg>
        <svg className="w-5 h-5 text-purple-400 absolute bottom-2 left-2 pointer-events-none z-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 15v6h6" />
        </svg>
        <svg className="w-5 h-5 text-purple-400 absolute bottom-2 right-2 pointer-events-none z-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v6h-6" />
        </svg>
        {/* Cyber Crosshair HUD */}
        <div className="absolute -top-3.5 right-6 pointer-events-none z-30">
          <svg className="w-6 h-6 text-cyan-400/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="7" />
            <line x1="12" y1="2" x2="12" y2="7" />
            <line x1="12" y1="17" x2="12" y2="22" />
            <line x1="2" y1="12" x2="7" y2="12" />
            <line x1="17" y1="12" x2="22" y2="12" />
          </svg>
        </div>
      </>
    );
  }

  if (type === 'tech') {
    return (
      <>
        {/* Top-Right Microchip SVG */}
        <div className="absolute -top-3 -right-2 pointer-events-none z-30">
          <svg className="w-7 h-7 text-slate-700 drop-shadow-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="4" y="4" width="16" height="16" rx="2" fill="#cbd5e1" />
            <rect x="8" y="8" width="8" height="8" fill="#475569" />
            <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
            <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
            <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" />
            <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" />
          </svg>
        </div>
        {/* Precision Crosshair Target */}
        <div className="absolute top-2 left-2 pointer-events-none z-30 opacity-60">
          <svg className="w-4 h-4 text-slate-700" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="5" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </>
    );
  }

  if (type === 'y2k') {
    return (
      <>
        {/* Top-Right Cute Cherries SVG */}
        <div className="absolute -top-4 -right-3 pointer-events-none z-30 transform rotate-12 drop-shadow-xs">
          <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
            <path d="M12 8 C16 4 22 6 24 10" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M12 8 C10 12 8 16 9 20" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="10" cy="22" r="5.5" fill="#e11d48" />
            <circle cx="21" cy="20" r="5" fill="#be123c" />
            <circle cx="8.5" cy="20" r="1.5" fill="#fff" opacity="0.8" />
            <circle cx="19.5" cy="18.5" r="1.5" fill="#fff" opacity="0.8" />
          </svg>
        </div>
        {/* Cute Sparkle Star */}
        <div className="absolute -bottom-2 -left-2 pointer-events-none z-30">
          <svg className="w-6 h-6 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
          </svg>
        </div>
      </>
    );
  }

  return null;
}

// ── PAKET TEMPLATE CATEGORIES ──
const THEME_CATEGORIES = [
  { id: 'all', label: 'Semua Tema' },
  { id: 'korean', label: 'Aesthetic Pastel' },
  { id: 'vintage', label: 'Retro Analog' },
  { id: 'modern', label: 'Neo Futuristic' },
];

// ── PAKET TEMPLATE (Presets - Korean/Aesthetic, Vintage/Retro, & Modern/Futuristic) ──
const TEMPLATE_PACKAGES = [
  // ── KOREAN / AESTHETIC ──
  {
    id: 'botanical',
    category: 'korean',
    name: 'Matcha Botanical',
    subtitle: 'Aesthetic Earthy & Washi',
    badge: '🌿 Natural',
    bg: '#9fb8ad',
    text: '#2d4234',
    subtext: '#44614e',
    border: '#87a294',
    accent: '#b2c8bd',
    washi: 'grid',
    ornament: 'botanical',
    defaultFilter: 'soft',
    defaultTitle: 'BOTANICAL MEMORY',
    defaultSubtext: 'SELF PHOTO STUDIO',
    defaultSticker: 'heart',
  },
  {
    id: 'sky-minimal',
    category: 'korean',
    name: 'Sky Blue Pastel',
    subtitle: 'Clean Pastel Sky & Clouds',
    badge: '☁️ Sky Blue',
    bg: '#e0f2fe',
    text: '#0369a1',
    subtext: '#0284c7',
    border: '#bae6fd',
    accent: '#f0f9ff',
    washi: 'striped',
    ornament: 'minimal',
    defaultFilter: 'cool',
    defaultTitle: 'SKY BLUE STUDIO',
    defaultSubtext: 'PHOTOBOOTH MEMORY',
    defaultSticker: 'star',
  },
  {
    id: 'cherry',
    category: 'korean',
    name: 'Cherry Pop Y2K',
    subtitle: 'Sweet Berry Pink & Hearts',
    badge: '🍒 Sweet',
    bg: '#fce7f3',
    text: '#831843',
    subtext: '#be185d',
    border: '#fbcfe8',
    accent: '#fff1f2',
    washi: 'polka',
    ornament: 'y2k',
    defaultFilter: 'vintage',
    defaultTitle: 'CHERRY POP ♡',
    defaultSubtext: 'SWEETEST MOMENTS',
    defaultSticker: 'cherry',
  },
  {
    id: 'lilac-dream',
    category: 'korean',
    name: 'Lilac Dream',
    subtitle: 'Soft Purple Pastel & Bow',
    badge: '🎀 Dreamy',
    bg: '#f3e8ff',
    text: '#581c87',
    subtext: '#7e22ce',
    border: '#e9d5ff',
    accent: '#faf5ff',
    washi: 'grid',
    ornament: 'botanical',
    defaultFilter: 'soft',
    defaultTitle: 'LILAC DREAM',
    defaultSubtext: 'SELF PHOTO STUDIO',
    defaultSticker: 'ribbon',
  },
  {
    id: 'minimal-white',
    category: 'korean',
    name: 'Snow White',
    subtitle: 'Clean Minimal Gallery White',
    badge: '✨ Minimal',
    bg: '#ffffff',
    text: '#18181b',
    subtext: '#71717a',
    border: '#e4e4e7',
    accent: '#f4f4f5',
    washi: 'none',
    ornament: 'none',
    defaultFilter: 'normal',
    defaultTitle: 'POCKETBOOTH',
    defaultSubtext: 'INSTANT PHOTO STUDIO',
    defaultSticker: 'none',
  },

  // ── VINTAGE / RETRO ──
  {
    id: 'retro-70s',
    category: 'vintage',
    name: 'Retro 70s Analog',
    subtitle: 'Warm Amber & Cassette Tape',
    badge: '📻 70s Retro',
    bg: '#fef3c7',
    text: '#78350f',
    subtext: '#92400e',
    border: '#f59e0b',
    accent: '#fffbeb',
    washi: 'retro',
    ornament: 'retro70s',
    defaultFilter: 'retro70s',
    defaultTitle: 'RETRO 1978',
    defaultSubtext: 'ANALOG CASSETTE TAPE',
    defaultSticker: 'sparkle',
  },
  {
    id: 'polaroid',
    category: 'vintage',
    name: 'Vintage Polaroid',
    subtitle: 'Classic Cream Paper Film',
    badge: '🎞️ Polaroid',
    bg: '#faf7f2',
    text: '#3f3f46',
    subtext: '#71717a',
    border: '#e4e4e7',
    accent: '#f4f4f5',
    washi: 'kraft',
    ornament: 'polaroid',
    defaultFilter: 'vintage',
    defaultTitle: 'POLAROID 90s',
    defaultSubtext: 'ORIGINAL INSTANT PRINT',
    defaultSticker: 'camera',
  },
  {
    id: 'film-roll',
    category: 'vintage',
    name: '35mm Film Roll',
    subtitle: 'Dark Sepia Film Negative',
    badge: '📷 Film Roll',
    bg: '#2b211b',
    text: '#fef3c7',
    subtext: '#d97706',
    border: '#45352c',
    accent: '#382b23',
    washi: 'kraft',
    ornament: 'filmroll',
    defaultFilter: 'film',
    defaultTitle: 'KODAK 400',
    defaultSubtext: '35MM ANALOG NEGATIVE',
    defaultSticker: 'film',
  },
  {
    id: 'sepia-classic',
    category: 'vintage',
    name: 'Sepia Nostalgia',
    subtitle: 'Warm Aged Vintage Tone',
    badge: '⏳ 1920s',
    bg: '#f5ede0',
    text: '#543d2b',
    subtext: '#7c5e45',
    border: '#d7c4b0',
    accent: '#faf5ed',
    washi: 'kraft',
    ornament: 'polaroid',
    defaultFilter: 'vintage',
    defaultTitle: 'NOSTALGIA',
    defaultSubtext: 'ANTIQUE PHOTOBOOTH',
    defaultSticker: 'sparkle',
  },

  // ── MODERN / FUTURISTIC ──
  {
    id: 'cyberpunk',
    category: 'modern',
    name: 'Cyber Neon 2077',
    subtitle: 'Obsidian & Electric Cyan',
    badge: '⚡ Cyberpunk',
    bg: '#09090b',
    text: '#22d3ee',
    subtext: '#a855f7',
    border: '#06b6d4',
    accent: '#18181b',
    washi: 'cyber',
    ornament: 'cyber',
    defaultFilter: 'cyber',
    defaultTitle: 'CYBER//2077',
    defaultSubtext: 'SYS.GRID • NEON MATRIX',
    defaultSticker: 'star',
  },
  {
    id: 'silver-chrome',
    category: 'modern',
    name: 'Silver Titanium',
    subtitle: 'Futuristic Metallic Chrome',
    badge: '💿 Chrome',
    bg: '#e2e8f0',
    text: '#0f172a',
    subtext: '#475569',
    border: '#cbd5e1',
    accent: '#f1f5f9',
    washi: 'chrome',
    ornament: 'tech',
    defaultFilter: 'silver',
    defaultTitle: 'TITANIUM LAB',
    defaultSubtext: 'MODERN TECH SPEC.01',
    defaultSticker: 'sparkle',
  },
  {
    id: 'classic-noir',
    category: 'modern',
    name: 'Classic Noir',
    subtitle: 'High-Contrast Studio B&W',
    badge: '🖤 Noir',
    bg: '#18181b',
    text: '#fafafa',
    subtext: '#a1a1aa',
    border: '#27272a',
    accent: '#27272a',
    washi: 'striped',
    ornament: 'minimal',
    defaultFilter: 'bw',
    defaultTitle: 'CLASSIC NOIR',
    defaultSubtext: 'MONOCHROME STUDIO',
    defaultSticker: 'film',
  },
  {
    id: 'matrix-digital',
    category: 'modern',
    name: 'Matrix Digital',
    subtitle: 'Deep Emerald & Cyber Code',
    badge: '🟢 Matrix',
    bg: '#022c22',
    text: '#34d399',
    subtext: '#059669',
    border: '#10b981',
    accent: '#064e3b',
    washi: 'cyber',
    ornament: 'cyber',
    defaultFilter: 'cool',
    defaultTitle: 'MATRIX//NODE',
    defaultSubtext: 'DIGITAL STREAM CORE',
    defaultSticker: 'star',
  },
];

// Layout Options
const LAYOUTS = [
  { id: 'strip-3', label: '3-Cuts Strip', slots: 3, desc: '3-photo vertical strip' },
  { id: 'strip-4', label: '4-Cuts Strip', slots: 4, desc: 'Classic vertical photostrip' },
  { id: 'grid-4', label: '2x2 Grid', slots: 4, desc: 'Quad 2x2 grid layout' },
];

// Aesthetic Photo Filters
const FILTERS = [
  { id: 'normal', name: 'Original', class: 'filter-normal', preview: 'bg-zinc-200', css: 'none' },
  { id: 'bw', name: 'Monochrome', class: 'filter-bw', preview: 'bg-zinc-800', css: 'grayscale(100%) contrast(125%) brightness(105%)' },
  { id: 'retro70s', name: 'Retro 70s', class: 'filter-retro70s', preview: 'bg-amber-600', css: 'sepia(35%) contrast(120%) brightness(102%) saturate(145%) hue-rotate(-10deg)' },
  { id: 'vintage', name: 'Polaroid 90s', class: 'filter-vintage', preview: 'bg-yellow-700', css: 'sepia(45%) contrast(110%) brightness(95%) saturate(120%)' },
  { id: 'film', name: '35mm Film', class: 'filter-film', preview: 'bg-stone-700', css: 'contrast(115%) saturate(85%) brightness(100%) sepia(20%)' },
  { id: 'cyber', name: 'Cyber Neon', class: 'filter-cyber', preview: 'bg-cyan-500', css: 'contrast(125%) brightness(105%) saturate(120%) hue-rotate(165deg)' },
  { id: 'silver', name: 'Chrome Silver', class: 'filter-silver', preview: 'bg-slate-400', css: 'grayscale(85%) contrast(130%) brightness(108%)' },
  { id: 'soft', name: 'Soft Warm', class: 'filter-soft', preview: 'bg-rose-300', css: 'contrast(95%) brightness(108%) saturate(90%)' },
  { id: 'cool', name: 'Cool Tone', class: 'filter-cool', preview: 'bg-sky-600', css: 'hue-rotate(185deg) saturate(75%) contrast(110%) brightness(102%)' },
];

// Helper to bake CSS filter onto image for print / download (html2canvas ignores CSS filter property)
function applyFilterToImage(imgElement, filterCss) {
  return new Promise((resolve) => {
    if (!filterCss || filterCss === 'none') {
      resolve(null);
      return;
    }
    const render = (img) => {
      try {
        const w = img.naturalWidth || 1200;
        const h = img.naturalHeight || 900;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.filter = filterCss;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (err) {
        console.error('Gagal memproses filter cetak:', err);
        resolve(null);
      }
    };

    if (imgElement.complete && imgElement.naturalWidth > 0) {
      render(imgElement);
    } else {
      const tempImg = new Image();
      tempImg.onload = () => render(tempImg);
      tempImg.onerror = () => resolve(null);
      tempImg.src = imgElement.src;
    }
  });
}

// Decorative Stickers
const STICKERS = [
  { id: 'none', label: 'None', symbol: '' },
  { id: 'heart', label: 'Heart', symbol: '♡' },
  { id: 'star', label: 'Star', symbol: '✦' },
  { id: 'sparkle', label: 'Sparkle', symbol: '★' },
  { id: 'cherry', label: 'Cherry', symbol: '🍒' },
  { id: 'ribbon', label: 'Ribbon', symbol: '🎀' },
  { id: 'film', label: 'Film', symbol: '🎞️' },
  { id: 'camera', label: 'Camera', symbol: '📸' },
];

// ── Static Indonesian QRIS String ──
const STATIC_QRIS_STRING = "00020101021126690021ID.CO.BANKMANDIRI.WWW01189360000802265034890211722650348930303UMI51440014ID.CO.QRIS.WWW0215ID10266090562250303UMI5204581553033605802ID5913Gerai Digital6012Kediri (Kab)61056421662070703A016304F6CD";

export default function Photobooth() {
  // Theme Mode: Light & Dark
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pb-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('pb-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('pb-theme', 'light');
    }
  }, [isDark]);

  // Collapsible Theme & Layout Settings Panel
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Selected Template Category & Package
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('botanical');

  // Customization States
  const [layout, setLayout] = useState('strip-3');
  const [filter, setFilter] = useState('soft');
  const [titleText, setTitleText] = useState('BOTANICAL MEMORY');
  const [subText, setSubText] = useState('SELF PHOTO STUDIO');
  const [sticker, setSticker] = useState('heart');
  const [showDate, setShowDate] = useState(true);

  // Frame Custom Overrides (from template)
  const [frameBg, setFrameBg] = useState('#9fb8ad');
  const [frameText, setFrameText] = useState('#2d4234');
  const [frameBorder, setFrameBorder] = useState('#87a294');
  const [frameAccent, setFrameAccent] = useState('#b2c8bd');
  const [washiType, setWashiType] = useState('grid');
  const [ornamentType, setOrnamentType] = useState('botanical');

  // Camera & Studio States
  const [timerSeconds, setTimerSeconds] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mirrorCamera, setMirrorCamera] = useState(true);
  const [facingMode, setFacingMode] = useState('user');

  // App & Capture States
  const [photos, setPhotos] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [slotGifFrames, setSlotGifFrames] = useState({});
  const [captureType, setCaptureType] = useState('photo'); // 'photo' (default) | 'gif'
  const [isRecordingGif, setIsRecordingGif] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isAutoShooting, setIsAutoShooting] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [isDownloadingGif, setIsDownloadingGif] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Cached Generated GIF Blob
  const [generatedGifBlob, setGeneratedGifBlob] = useState(null);

  // Social Media Share Modal States
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareBlob, setShareBlob] = useState(null);
  const [sharePreviewUrl, setSharePreviewUrl] = useState('');
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Support / QRIS Donation Modal State
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [qrisDataUrl, setQrisDataUrl] = useState('');

  // Generate QRIS Data URL once
  useEffect(() => {
    QRCode.toDataURL(STATIC_QRIS_STRING, {
      width: 280,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrisDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, []);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const stripRef = useRef(null);
  const fileInputRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const currentLayoutObj = LAYOUTS.find((l) => l.id === layout) || LAYOUTS[0];
  const currentFilterObj = FILTERS.find((f) => f.id === filter) || FILTERS[0];
  const currentStickerObj = STICKERS.find((s) => s.id === sticker) || STICKERS[0];
  const totalSlots = currentLayoutObj.slots;

  // Show Toast
  const showToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage('');
    }, 2500);
  }, []);

  // Apply a Template Package
  const applyTemplate = (pkg) => {
    setSelectedTemplate(pkg.id);
    setFrameBg(pkg.bg);
    setFrameText(pkg.text);
    setFrameBorder(pkg.border);
    setFrameAccent(pkg.accent);
    setWashiType(pkg.washi);
    setOrnamentType(pkg.ornament);
    setFilter(pkg.defaultFilter);
    setTitleText(pkg.defaultTitle);
    setSubText(pkg.defaultSubtext);
    setSticker(pkg.defaultSticker);
    showToast(`Template "${pkg.name}" diterapkan! ✨`);
  };

  // Reset all photos on page load / reload
  useEffect(() => {
    clearAllPhotos();
    setPhotos({});
  }, []);

  // Invalidate cached GIF when strip content changes
  useEffect(() => {
    setGeneratedGifBlob(null);
  }, [photos, slotGifFrames, selectedTemplate, filter, frameBg, frameBorder, washiType, ornamentType, titleText, showDate, layout]);

  // Stop Camera Helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Start Camera Helper with Progressive Fallback
  const startCamera = useCallback(async (targetMode = facingMode) => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      if (typeof window !== 'undefined' && window.isSecureContext === false) {
        showToast('Kamera membutuhkan koneksi HTTPS aman 🔒');
      } else {
        showToast('Browser ini tidak mendukung akses kamera 🔒');
      }
      return false;
    }

    try {
      // Clean up previous tracks first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      let stream = null;
      const constraintsList = [
        { video: { facingMode: { ideal: targetMode } }, audio: false },
        { video: { facingMode: targetMode }, audio: false },
        { video: true, audio: false }
      ];

      let lastError = null;
      for (const constraints of constraintsList) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (stream) break;
        } catch (e) {
          lastError = e;
          // Do not retry if user explicitly blocked/denied permission
          if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
            throw e;
          }
        }
      }

      if (!stream) {
        throw lastError || new Error('Tidak dapat memperoleh stream video');
      }

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('muted', 'true');
        video.srcObject = stream;
        try {
          await video.play();
        } catch (playErr) {
          console.warn('Direct video play error:', playErr);
        }
      }

      setIsCameraActive(true);
      showToast('Kamera aktif! 📷');
      return true;
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        showToast('Izin kamera ditolak. Berikan izin di browser/HP 🔒');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        showToast('Kamera tidak ditemukan di perangkat 📷');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        showToast('Kamera sedang dipakai aplikasi lain. Tutup app lain ⚠️');
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        showToast('Resolusi/kamera tidak didukung perangkat ⚠️');
      } else {
        showToast(`Gagal buka kamera: ${err.name || 'Error'} ❌`);
      }
      setIsCameraActive(false);
      return false;
    }
  }, [facingMode, showToast]);

  // Flip Camera Front / Back
  const toggleFacingMode = useCallback(async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (isCameraActive) {
      await startCamera(nextMode);
    }
  }, [facingMode, isCameraActive, startCamera]);

  // Sync Video Element with Stream if re-attached
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isCameraActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [stopCamera]);

  // Capture Frame from Video with Exact 4:3 Center Crop
  const captureFrame = useCallback(
    async (slotIndex) => {
      if (!videoRef.current || !canvasRef.current) return null;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;
      const targetAspect = 4 / 3;
      const vAspect = vw / vh;

      let sx = 0;
      let sy = 0;
      let sw = vw;
      let sh = vh;

      if (vAspect > targetAspect) {
        // Video is wider than 4:3 (e.g. 16:9 landscape) -> crop sides
        sw = Math.round(vh * targetAspect);
        sx = Math.round((vw - sw) / 2);
      } else if (vAspect < targetAspect) {
        // Video is taller than 4:3 (e.g. 9:16 portrait on smartphone) -> crop top/bottom
        sh = Math.round(vw / targetAspect);
        sy = Math.round((vh - sh) / 2);
      }

      // Crisp 4:3 resolution matching the viewfinder and slot
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext('2d');

      ctx.save();
      if (mirrorCamera && facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      setIsFlashing(true);
      if (soundEnabled) playShutterSound();
      setTimeout(() => setIsFlashing(false), 200);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      await savePhoto(slotIndex, dataUrl);

      setPhotos((prev) => ({ ...prev, [slotIndex]: dataUrl }));
      return dataUrl;
    },
    [mirrorCamera, facingMode, soundEnabled]
  );

  // Capture Live Animated GIF Burst from Video with 4:3 Crop
  const captureGifBurst = useCallback(
    async (slotIndex) => {
      if (!videoRef.current) return null;

      const video = videoRef.current;
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;
      const targetAspect = 4 / 3;
      const vAspect = vw / vh;

      let sx = 0;
      let sy = 0;
      let sw = vw;
      let sh = vh;

      if (vAspect > targetAspect) {
        sw = Math.round(vh * targetAspect);
        sx = Math.round((vw - sw) / 2);
      } else if (vAspect < targetAspect) {
        sh = Math.round(vw / targetAspect);
        sy = Math.round((vh - sh) / 2);
      }

      // Compact 480x360 resolution for super-fast client-side GIF encoding
      const frameWidth = 480;
      const frameHeight = 360;
      const c = document.createElement('canvas');
      c.width = frameWidth;
      c.height = frameHeight;
      const ctx = c.getContext('2d');

      setIsRecordingGif(true);
      if (soundEnabled) playShutterSound();

      const numFrames = 6;
      const intervalMs = 130; // ~780ms recording time
      const frames = [];
      const frameDataUrls = [];

      for (let i = 0; i < numFrames; i++) {
        ctx.save();
        if (mirrorCamera && facingMode === 'user') {
          ctx.translate(frameWidth, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, frameWidth, frameHeight);
        ctx.restore();

        const imgData = ctx.getImageData(0, 0, frameWidth, frameHeight);
        frames.push(imgData);
        frameDataUrls.push(c.toDataURL('image/jpeg', 0.85));

        if (i < numFrames - 1) {
          await new Promise((res) => setTimeout(res, intervalMs));
        }
      }

      setIsRecordingGif(false);
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 150);

      const gifBlob = createGif(frames, { width: frameWidth, height: frameHeight, delay: intervalMs });

      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(gifBlob);
      });

      await savePhoto(slotIndex, dataUrl);
      setPhotos((prev) => ({ ...prev, [slotIndex]: dataUrl }));
      setSlotGifFrames((prev) => ({ ...prev, [slotIndex]: frameDataUrls }));
      return dataUrl;
    },
    [mirrorCamera, facingMode, soundEnabled]
  );

  // Single Capture with Timer
  const handleCapture = useCallback(
    async (slotIndex) => {
      if (!isCameraActive) {
        const ok = await startCamera();
        if (!ok) return;
        return;
      }

      if (timerSeconds > 0) {
        for (let t = timerSeconds; t > 0; t--) {
          setCountdown(t);
          if (soundEnabled) playCountdownBeep(false);
          await new Promise((res) => setTimeout(res, 1000));
        }
        if (soundEnabled) playCountdownBeep(true);
        setCountdown(null);
      }

      if (captureType === 'gif') {
        await captureGifBurst(slotIndex);
        showToast(`GIF slot ${slotIndex + 1} berhasil direkam! 🎞️✨`);
      } else {
        await captureFrame(slotIndex);
        showToast(`Slot ${slotIndex + 1} berhasil diambil! ✨`);
      }

      const nextSlot = (slotIndex + 1) % totalSlots;
      setSelectedSlot(nextSlot);
    },
    [isCameraActive, startCamera, timerSeconds, soundEnabled, captureType, captureGifBurst, captureFrame, totalSlots, showToast]
  );

  // Auto Burst / Series Mode
  const handleAutoSeries = useCallback(async () => {
    if (!isCameraActive) {
      const ok = await startCamera();
      if (!ok) return;
    }

    setIsAutoShooting(true);
    showToast(captureType === 'gif' ? 'Auto Series GIF dimulai! Bersiap pose 🎞️' : 'Auto Series dimulai! Bersiap pose 📸');

    const effectiveTimer = timerSeconds === 0 ? 3 : timerSeconds;

    for (let slot = 0; slot < totalSlots; slot++) {
      setSelectedSlot(slot);

      for (let t = effectiveTimer; t > 0; t--) {
        setCountdown(t);
        if (soundEnabled) playCountdownBeep(false);
        await new Promise((res) => setTimeout(res, 1000));
      }

      if (soundEnabled) playCountdownBeep(true);
      setCountdown(null);

      if (captureType === 'gif') {
        await captureGifBurst(slot);
      } else {
        await captureFrame(slot);
      }
      await new Promise((res) => setTimeout(res, 800));
    }

    setIsAutoShooting(false);
    setSelectedSlot(0);
    showToast('Selesai! Semua slot siap dicetak 🎉');
  }, [isCameraActive, startCamera, timerSeconds, totalSlots, soundEnabled, captureType, captureGifBurst, captureFrame, showToast]);

  // Upload Local File with 4:3 Auto-Crop (Supports PNG, JPG, & animated GIF)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      // If animated GIF uploaded directly, preserve all animation frames
      if (file.type === 'image/gif') {
        const dataUrl = evt.target.result;
        await savePhoto(selectedSlot, dataUrl);
        setPhotos((prev) => ({ ...prev, [selectedSlot]: dataUrl }));
        showToast(`GIF diunggah ke slot ${selectedSlot + 1} 🎞️`);
        setSelectedSlot((prev) => (prev + 1) % totalSlots);
        return;
      }

      const img = new Image();
      img.onload = async () => {
        const c = document.createElement('canvas');
        c.width = 1200;
        c.height = 900;
        const ctx = c.getContext('2d');

        const iw = img.width;
        const ih = img.height;
        const targetAspect = 4 / 3;
        const iAspect = iw / ih;

        let sx = 0;
        let sy = 0;
        let sw = iw;
        let sh = ih;

        if (iAspect > targetAspect) {
          sw = Math.round(ih * targetAspect);
          sx = Math.round((iw - sw) / 2);
        } else if (iAspect < targetAspect) {
          sh = Math.round(iw / targetAspect);
          sy = Math.round((ih - sh) / 2);
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
        const dataUrl = c.toDataURL('image/jpeg', 0.95);
        await savePhoto(selectedSlot, dataUrl);
        setPhotos((prev) => ({ ...prev, [selectedSlot]: dataUrl }));
        showToast(`Foto diunggah ke slot ${selectedSlot + 1} 📁`);
        setSelectedSlot((prev) => (prev + 1) % totalSlots);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Reset One Slot
  const handleResetSlot = async (slotIdx, e) => {
    e.stopPropagation();
    await deletePhoto(slotIdx);
    setPhotos((prev) => {
      const updated = { ...prev };
      delete updated[slotIdx];
      return updated;
    });
    setSlotGifFrames((prev) => {
      const updated = { ...prev };
      delete updated[slotIdx];
      return updated;
    });
    setSelectedSlot(slotIdx);
    showToast(`Slot ${slotIdx + 1} direset 🔄`);
  };

  // Reset All
  const handleResetAll = async () => {
    if (!window.confirm('Reset semua foto di photostrip?')) return;
    await clearAllPhotos();
    setPhotos({});
    setSlotGifFrames({});
    setSelectedSlot(0);
    showToast('Semua slot dibersihkan');
  };

  // Switch Capture Mode (Photo Still vs GIF Live) and reset photostrip preview
  const handleSwitchCaptureType = async (newType) => {
    if (newType === captureType) return;
    setCaptureType(newType);
    await clearAllPhotos();
    setPhotos({});
    setSlotGifFrames({});
    setSelectedSlot(0);
    showToast(newType === 'gif' ? 'Mode GIF aktif 🎞️' : 'Mode Foto aktif 📸');
  };

  // Generate High-Resolution Photostrip Blob
  const generateStripBlob = async () => {
    if (!stripRef.current) return null;

    const targetWidth = layout === 'grid-4' ? 330 : 275;
    const filterCss = currentFilterObj.css || 'none';

    const canvas = await html2canvas(stripRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: frameBg,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1200,
      onclone: async (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('[data-strip-target="true"]');
        if (clonedElement) {
          clonedElement.style.width = `${targetWidth}px`;
          clonedElement.style.minWidth = `${targetWidth}px`;
          clonedElement.style.maxWidth = `${targetWidth}px`;
          clonedElement.style.transform = 'none';
        }

        // 1. Deselect any active slot on print: remove rings & reset buttons, reset borders
        clonedDoc.querySelectorAll('[data-active-ring="true"]').forEach((el) => el.remove());
        clonedDoc.querySelectorAll('[data-reset-btn="true"]').forEach((el) => el.remove());
        clonedDoc.querySelectorAll('[data-slot-frame="true"]').forEach((frame) => {
          frame.style.borderColor = frameBorder;
        });
        clonedDoc.querySelectorAll('[data-slot-placeholder="true"]').forEach((el) => {
          const slotIdx = el.getAttribute('data-slot-index');
          if (slotIdx !== null) el.textContent = `SLOT ${Number(slotIdx) + 1}`;
        });

        // 2. Apply photo filter to all captured images in the photostrip
        if (filterCss !== 'none') {
          const clonedPhotos = Array.from(clonedDoc.querySelectorAll('img[data-slot-photo="true"]'));
          const realPhotos = Array.from(stripRef.current.querySelectorAll('img[data-slot-photo="true"]'));

          await Promise.all(
            clonedPhotos.map(async (clonedImg, i) => {
              const sourceImg = realPhotos[i] || clonedImg;
              const filteredDataUrl = await applyFilterToImage(sourceImg, filterCss);
              if (filteredDataUrl) {
                clonedImg.src = filteredDataUrl;
                clonedImg.className = clonedImg.className.replace(/filter-[a-z0-9]+/g, '');
                try {
                  await clonedImg.decode();
                } catch (_) {}
              }
            })
          );
        }
      },
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  // Download High-Resolution Photostrip PNG directly
  const handleDownloadPng = async () => {
    try {
      setIsDownloadingPng(true);
      showToast('Sedang merender photostrip PNG... 📸');

      const blob = await generateStripBlob();
      if (!blob) throw new Error('Gagal merender strip');

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `pocketbooth-${selectedTemplate}-${dateStr}.png`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      showToast('Photostrip PNG berhasil diunduh! 💖');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengunduh foto 😢');
    } finally {
      setIsDownloadingPng(false);
    }
  };

  // Download Animated Photostrip GIF directly without popup
  const handleDownloadGif = async () => {
    try {
      setIsDownloadingGif(true);
      showToast('Sedang merender animasi GIF... 🎞️');

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `pocketbooth-${selectedTemplate}-${dateStr}.gif`;

      let blob = generatedGifBlob;
      if (!blob) {
        blob = await generatePhotoboothGridGif();
        if (blob) {
          setGeneratedGifBlob(blob);
        }
      }
      if (!blob) throw new Error('Gagal merender GIF');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      showToast('Animasi GIF berhasil diunduh! 🎞️✨');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengunduh GIF 😢');
    } finally {
      setIsDownloadingGif(false);
    }
  };

  // Generate Animated GIF of the Full Photostrip Grid / Strip
  const generatePhotoboothGridGif = async () => {
    if (!stripRef.current) return null;

    const targetWidth = layout === 'grid-4' ? 330 : 275;
    const filterCss = currentFilterObj.css || 'none';
    const hasGifSlots = Object.keys(slotGifFrames).length > 0;
    const totalFrames = hasGifSlots ? 6 : Math.max(2, totalSlots);
    const frameDelay = hasGifSlots ? 140 : 500;
    const frames = [];
    let gifWidth = 0;
    let gifHeight = 0;

    for (let k = 0; k < totalFrames; k++) {
      const canvas = await html2canvas(stripRef.current, {
        scale: 1.0,
        useCORS: true,
        allowTaint: true,
        backgroundColor: frameBg,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
        onclone: async (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-strip-target="true"]');
          if (clonedElement) {
            clonedElement.style.width = `${targetWidth}px`;
            clonedElement.style.minWidth = `${targetWidth}px`;
            clonedElement.style.maxWidth = `${targetWidth}px`;
            clonedElement.style.transform = 'none';
          }

          // Remove active rings & retake buttons in cloned strip
          clonedDoc.querySelectorAll('[data-active-ring="true"]').forEach((el) => el.remove());
          clonedDoc.querySelectorAll('[data-reset-btn="true"]').forEach((el) => el.remove());
          clonedDoc.querySelectorAll('[data-slot-placeholder="true"]').forEach((el) => {
            const slotIdx = el.getAttribute('data-slot-index');
            if (slotIdx !== null) el.textContent = `SLOT ${Number(slotIdx) + 1}`;
          });

          // Reset borders
          clonedDoc.querySelectorAll('[data-slot-frame="true"]').forEach((frame) => {
            frame.style.borderColor = frameBorder;
          });

          // Animate each slot's image frame
          const clonedPhotos = Array.from(clonedDoc.querySelectorAll('img[data-slot-photo="true"]'));
          await Promise.all(
            clonedPhotos.map(async (clonedImg) => {
              const slotIdx = Number(clonedImg.getAttribute('data-slot-index'));
              const framesForSlot = slotGifFrames[slotIdx];

              if (framesForSlot && framesForSlot.length > 0) {
                clonedImg.src = framesForSlot[k % framesForSlot.length];
              }

              if (filterCss !== 'none') {
                const filteredDataUrl = await applyFilterToImage(clonedImg, filterCss);
                if (filteredDataUrl) {
                  clonedImg.src = filteredDataUrl;
                  clonedImg.className = clonedImg.className.replace(/filter-[a-z0-9]+/g, '');
                }
              }

              try {
                await clonedImg.decode();
              } catch (_) {}
            })
          );
        },
      });

      gifWidth = canvas.width;
      gifHeight = canvas.height;
      const ctx = canvas.getContext('2d');
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      frames.push({
        data: imgData.data,
        delay: frameDelay,
      });
    }

    if (frames.length === 0) return null;
    return createGif(frames, { width: gifWidth, height: gifHeight, delay: frameDelay });
  };

  // Open Social Media Share Dialog
  const handleShare = async (overrideBlob = null) => {
    try {
      setIsSharing(true);
      const isGifMode = overrideBlob ? overrideBlob.type === 'image/gif' : captureType === 'gif';
      showToast(isGifMode ? 'Menyiapkan animasi GIF untuk dibagikan... 🎞️' : 'Menyiapkan photostrip untuk dibagikan...');

      let blob = overrideBlob;
      if (!blob) {
        if (captureType === 'gif') {
          if (generatedGifBlob) {
            blob = generatedGifBlob;
          } else {
            blob = await generatePhotoboothGridGif();
            if (blob) {
              setGeneratedGifBlob(blob);
            }
          }
        } else {
          blob = await generateStripBlob();
        }
      }
      if (!blob) throw new Error('Gagal merender strip');

      setShareBlob(blob);
      if (sharePreviewUrl) URL.revokeObjectURL(sharePreviewUrl);
      const url = URL.createObjectURL(blob);
      setSharePreviewUrl(url);

      const isGif = blob.type === 'image/gif';
      const ext = isGif ? 'gif' : 'png';
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `pocketbooth-${selectedTemplate}-${dateStr}.${ext}`;
      const file = new File([blob], filename, { type: blob.type });

      // Direct native share on mobile if supported (opens Instagram Stories, WhatsApp, TikTok directly)
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: titleText || (isGif ? 'Pocketbooth Photostrip GIF' : 'Pocketbooth Photostrip'),
            text: isGif ? 'Photostrip animasi GIF dari Pocketbooth! 📸✨' : 'Photostrip kenangan dari Pocketbooth! 📸✨',
          });
          return;
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') {
            setShowShareModal(true);
            return;
          }
        }
      }

      setShowShareModal(true);
    } catch (err) {
      console.error(err);
      showToast('Gagal menyiapkan foto untuk dibagikan 😢');
    } finally {
      setIsSharing(false);
    }
  };

  // Direct Social Media Action Handler
  const handleShareToPlatform = async (platform) => {
    if (!shareBlob) return;
    const isGif = shareBlob.type === 'image/gif';
    const ext = isGif ? 'gif' : 'png';
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `pocketbooth-${selectedTemplate}-${dateStr}.${ext}`;
    const file = new File([shareBlob], filename, { type: shareBlob.type });

    const triggerDownload = () => {
      const url = URL.createObjectURL(shareBlob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    };

    const tryNativeShare = async () => {
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: titleText || (isGif ? 'Pocketbooth Photostrip GIF' : 'Pocketbooth Photostrip'),
            text: isGif ? 'Photostrip animasi GIF dari Pocketbooth! 📸✨' : 'Photostrip kenangan dari Pocketbooth! 📸✨',
          });
          return true;
        } catch (err) {
          if (err.name === 'AbortError') return true;
          return false;
        }
      }
      return false;
    };

    if (platform === 'native') {
      const shared = await tryNativeShare();
      if (!shared) {
        triggerDownload();
        showToast(isGif ? 'GIF diunduh ke galeri! Siap dibagikan 📁' : 'Foto diunduh ke galeri! Siap dibagikan 📁');
      }
      return;
    }

    if (platform === 'instagram') {
      const shared = await tryNativeShare();
      if (shared) return;

      triggerDownload();
      if (!isGif) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ [shareBlob.type]: shareBlob }),
          ]);
          showToast('Foto diunduh & disalin ke clipboard! Membuka Instagram... 📸');
        } catch (_) {
          showToast('Foto tersimpan di galeri! Membuka Instagram... 📸');
        }
      } else {
        showToast('GIF diunduh ke galeri! Membuka Instagram... 📸');
      }

      setTimeout(() => {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = 'instagram://camera';
          setTimeout(() => {
            window.location.href = 'https://instagram.com';
          }, 1500);
        } else {
          window.open('https://instagram.com', '_blank');
        }
      }, 500);
      return;
    }

    if (platform === 'tiktok') {
      const shared = await tryNativeShare();
      if (shared) return;

      triggerDownload();
      showToast(isGif ? 'GIF tersimpan di galeri! Membuka TikTok... 🎵' : 'Foto tersimpan di galeri! Membuka TikTok... 🎵');
      setTimeout(() => {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = 'tiktok://';
          setTimeout(() => {
            window.location.href = 'https://tiktok.com';
          }, 1500);
        } else {
          window.open('https://tiktok.com', '_blank');
        }
      }, 500);
      return;
    }

    if (platform === 'whatsapp') {
      const shared = await tryNativeShare();
      if (shared) return;

      triggerDownload();
      if (!isGif) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ [shareBlob.type]: shareBlob }),
          ]);
          showToast('Gambar disalin! Tinggal paste di WhatsApp 💬');
        } catch (_) {
          showToast('Foto diunduh! Siap dikirim di WhatsApp 💬');
        }
      } else {
        showToast('GIF diunduh! Siap dikirim di WhatsApp 💬');
      }

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = 'whatsapp://send?text=' + encodeURIComponent((isGif ? 'Photostrip animasi GIF dari Pocketbooth! 📸✨ ' : 'Photostrip kenangan dari Pocketbooth! 📸✨ ') + window.location.href);
      } else {
        window.open('https://web.whatsapp.com', '_blank');
      }
      return;
    }

    if (platform === 'twitter') {
      triggerDownload();
      const tweetText = encodeURIComponent(
        (isGif ? 'Photostrip animasi GIF dari Pocketbooth! 📸✨ ' : 'Photostrip kenangan dari Pocketbooth! 📸✨ ') +
        window.location.href
      );
      window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
      showToast(isGif ? 'GIF diunduh & Twitter dibuka! Siap dilampirkan 𝕏' : 'Foto diunduh & Twitter dibuka! Siap dilampirkan 𝕏');
      return;
    }
  };

  // Copy Image Directly to System Clipboard or download GIF (since browsers reject image/gif in clipboard)
  const handleCopyImage = async () => {
    try {
      if (!shareBlob) return;
      const isGif = shareBlob.type === 'image/gif';
      if (isGif) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const filename = `pocketbooth-${selectedTemplate}-${dateStr}.gif`;
        const url = URL.createObjectURL(shareBlob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 3000);

        setCopiedImage(true);
        showToast('Animasi GIF berhasil diunduh ke galeri! Siap dibagikan 🎞️');
        setTimeout(() => setCopiedImage(false), 2500);
        return;
      }

      await navigator.clipboard.write([
        new ClipboardItem({ [shareBlob.type]: shareBlob }),
      ]);
      setCopiedImage(true);
      showToast('Gambar tersalin ke clipboard! 📋 Siap dipaste');
      setTimeout(() => setCopiedImage(false), 2500);
    } catch (err) {
      console.error(err);
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        showToast('Link website tersalin ke clipboard! 📋');
        setTimeout(() => setCopiedLink(false), 2500);
      } catch (_) {
        showToast('Gagal menyalin gambar otomatis');
      }
    }
  };

  const todayFormatted = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  })();

  const photosCount = Object.keys(photos).filter((k) => photos[k] && Number(k) < totalSlots).length;

  return (
    <div className="min-h-screen bg-[#f5ede2] dark:bg-[#0c0a09] text-zinc-900 dark:text-zinc-100 pb-20 relative overflow-hidden transition-colors duration-200 selection:bg-rose-200 dark:selection:bg-rose-950">

      {/* ── Background Subtle Ambient Gradient ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{
          backgroundImage: isDark
            ? `
              radial-gradient(ellipse at 20% 10%, rgba(120,80,60,0.18) 0%, transparent 55%),
              radial-gradient(ellipse at 80% 85%, rgba(60,100,80,0.14) 0%, transparent 55%),
              radial-gradient(ellipse at 55% 50%, rgba(100,70,80,0.10) 0%, transparent 70%)
            `
            : `
              radial-gradient(ellipse at 20% 10%, rgba(224,200,180,0.45) 0%, transparent 55%),
              radial-gradient(ellipse at 80% 85%, rgba(181,201,168,0.25) 0%, transparent 55%),
              radial-gradient(ellipse at 55% 50%, rgba(240,215,200,0.15) 0%, transparent 70%)
            `,
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/90 dark:bg-zinc-100/95 backdrop-blur-md text-white dark:text-zinc-900 text-xs md:text-sm font-medium px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-zinc-700 dark:border-zinc-300 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-amber-300 dark:text-amber-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Flash Effect */}
      {isFlashing && (
        <div className="fixed inset-0 bg-white z-[9999] pointer-events-none animate-out fade-out duration-200" />
      )}

      {/* Header */}
      <header className="border-b border-amber-200/50 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/70 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <img
              src="/logo.png"
              alt="Pocket Photo Booth Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl shadow-xs flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-bold text-sm sm:text-base tracking-tight font-sans text-zinc-800 dark:text-zinc-100 truncate">POCKETBOOTH</h1>
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest bg-amber-100/70 dark:bg-zinc-800 text-amber-900 dark:text-amber-300 px-1.5 py-0.5 rounded font-semibold border border-amber-200/60 dark:border-zinc-700 flex-shrink-0">
                  STUDIO
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-mono tracking-tight -mt-0.5 truncate hidden sm:block">Self Photo Booth Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => setShowSupportModal(true)}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs font-bold rounded-full border border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 flex-shrink-0"
              title="Dukung Developer via QRIS"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
              <span className="hidden sm:inline">Support</span>
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-amber-200/70 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition shadow-xs cursor-pointer flex-shrink-0"
              title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-amber-200/70 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition shadow-xs cursor-pointer flex-shrink-0"
              title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-zinc-700 dark:text-zinc-200" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
            </button>
            <button
              onClick={handleResetAll}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs font-semibold rounded-full border border-amber-200/70 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition flex items-center gap-1 shadow-xs cursor-pointer flex-shrink-0"
              title="Reset Semua"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="max-w-6xl mx-auto px-4 pt-6 md:pt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── LEFT: Standby Mode (7 Cols) ── */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Viewfinder Card */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-4 md:p-5 shadow-sm border border-amber-200/70 dark:border-zinc-800 relative overflow-hidden transition-colors">
              <div className="flex items-center justify-between mb-3 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className={`w-2.5 h-2.5 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                  {isCameraActive ? 'LIVE CAMERA ACTIVE' : 'STANDBY MODE'}
                </span>
                <span className="bg-amber-100/80 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-zinc-700">
                  SLOT {selectedSlot + 1} DARI {totalSlots}
                </span>
              </div>

              {/* Viewfinder Window (Video always in DOM) */}
              <div className="relative aspect-[4/3] rounded-2xl bg-zinc-950 overflow-hidden flex items-center justify-center shadow-inner group">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={(e) => {
                    e.target.play().catch(() => {});
                  }}
                  className={`w-full h-full object-cover transition-opacity duration-200 ${
                    mirrorCamera && facingMode === 'user' ? '-scale-x-100' : ''
                  } ${currentFilterObj.class} ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
                />

                {!isCameraActive && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-zinc-950 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-md">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">Kamera Belum Aktif</p>
                      <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                        Nyalakan kamera untuk mulai memotret photostrip kamu.
                      </p>
                    </div>
                    <button
                      onClick={() => startCamera()}
                      className="mt-2 text-xs font-bold px-5 py-2.5 bg-white text-zinc-900 rounded-full hover:bg-zinc-100 transition shadow active:scale-95"
                    >
                      Buka Kamera
                    </button>
                  </div>
                )}

                {/* Live Countdown Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center z-30 pointer-events-none">
                    <div className="text-8xl md:text-9xl font-black text-white font-mono drop-shadow-2xl animate-ping">
                      {countdown}
                    </div>
                  </div>
                )}

                {/* Live GIF Recording Badge */}
                {isRecordingGif && (
                  <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3.5 py-1.5 bg-red-600/90 text-white rounded-full font-mono text-xs font-bold shadow-lg animate-pulse pointer-events-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    <span>MEREKAM GIF LIVE...</span>
                  </div>
                )}

                {/* Viewfinder Rule-of-Thirds Grid */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-15">
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div />
                  </div>
                )}

                {/* Floating Viewfinder Controls */}
                {isCameraActive && (
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
                    {/* Timer Selector */}
                    <div className="bg-black/65 backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-1 text-[11px] text-white border border-white/10 shadow-md">
                      <Timer className="w-3.5 h-3.5 text-zinc-300 ml-1" />
                      {[0, 3, 5].map((sec) => (
                        <button
                          key={sec}
                          onClick={() => setTimerSeconds(sec)}
                          className={`px-2 py-0.5 rounded-full transition text-[10px] font-bold ${
                            timerSeconds === sec ? 'bg-white text-black' : 'text-zinc-300 hover:text-white'
                          }`}
                        >
                          {sec === 0 ? 'OFF' : `${sec}s`}
                        </button>
                      ))}
                    </div>

                    {/* Camera Utilities */}
                    <div className="flex items-center gap-1.5 bg-black/65 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-md">
                      <button
                        onClick={() => setMirrorCamera(!mirrorCamera)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-full transition ${
                          mirrorCamera ? 'bg-white text-black' : 'text-zinc-300 hover:text-white'
                        }`}
                        title="Mirror Camera"
                      >
                        MIRROR
                      </button>
                      <button
                        onClick={toggleFacingMode}
                        className="p-1 rounded-full text-zinc-300 hover:text-white transition"
                        title="Ganti Kamera Depan/Belakang"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mode Selector: FOTO STILL (Default) vs GIF LIVE */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center p-1 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/80 gap-1 text-[11px] font-bold font-mono">
                  <button
                    onClick={() => handleSwitchCaptureType('photo')}
                    className={`px-3 py-1 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                      captureType === 'photo'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>FOTO STILL</span>
                  </button>
                  <button
                    onClick={() => handleSwitchCaptureType('gif')}
                    className={`px-3 py-1 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                      captureType === 'gif'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>GIF LIVE</span>
                  </button>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono hidden sm:inline">
                  {captureType === 'gif' ? '⚡ Mode GIF aktif' : '📸 Mode Foto aktif'}
                </span>
              </div>

              {/* Shutter & Actions */}
              <div className="mt-3 flex flex-col sm:flex-row items-center gap-3">
                {/* Auto Series */}
                <button
                  onClick={handleAutoSeries}
                  disabled={isAutoShooting || isRecordingGif}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-rose-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2 group disabled:opacity-50"
                  title="Ambil foto otomatis berurutan sesuai layout"
                >
                  <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition" />
                  <span>
                    {isAutoShooting
                      ? 'MEMOTRET...'
                      : captureType === 'gif'
                      ? 'AUTO SERIES GIF'
                      : 'AUTO SERIES'}
                  </span>
                </button>

                {/* Primary Shutter */}
                <button
                  onClick={() => handleCapture(selectedSlot)}
                  disabled={isAutoShooting || isRecordingGif}
                  className="w-full flex-1 py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-sm tracking-wide shadow-md transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {captureType === 'gif' ? <Film className="w-4 h-4 text-rose-400" /> : <Camera className="w-4 h-4" />}
                  <span>
                    {!isCameraActive
                      ? 'BUKA KAMERA'
                      : isRecordingGif
                      ? 'MEREKAM GIF...'
                      : timerSeconds > 0
                      ? `${captureType === 'gif' ? 'REKAM GIF' : 'POTRET'} SLOT ${selectedSlot + 1} (${timerSeconds}s)`
                      : `${captureType === 'gif' ? 'REKAM GIF' : 'POTRET'} SLOT ${selectedSlot + 1}`}
                  </span>
                </button>

                {/* Upload Local Image */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto p-3.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  title="Upload Foto Sendiri"
                >
                  <Upload className="w-4 h-4" />
                  <span className="sm:hidden">Upload File</span>
                </button>
              </div>

              {/* Slot Indicator Pills */}
              <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px] font-bold">PILIH SLOT FRAME:</span>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalSlots }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(idx)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        selectedSlot === idx
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                          : photos[idx]
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span>#{idx + 1}</span>
                      {photos[idx] && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

              {/* Collapsible Bar for Theme & Strip Layout */}
              <div
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-3 px-4 border border-amber-200/60 dark:border-zinc-800 shadow-xs flex items-center justify-between transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-zinc-500 dark:text-zinc-400 font-bold">TEMA:</span>
                  <strong className="text-zinc-800 dark:text-zinc-200">{TEMPLATE_PACKAGES.find((p) => p.id === selectedTemplate)?.name || "Default"}</strong>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSettingsOpen(!isSettingsOpen);
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isSettingsOpen ? 'Tutup Pengaturan' : 'Ubah Tema & Strip Layout'}</span>
                  {isSettingsOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  )}
                </button>
              </div>

              {/* Collapsible Customization Panels */}
              {isSettingsOpen && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Section A: Pilih Paket Tema */}
                  <section className="bg-white/75 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-amber-200/60 dark:border-zinc-800 shadow-sm transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">PILIH PAKET TEMA</h2>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-zinc-800 text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-zinc-700">
                          {TEMPLATE_PACKAGES.filter((pkg) => selectedCategory === 'all' || pkg.category === selectedCategory).length} TEMA
                        </span>
                      </div>

                      {/* Category Filter Dropdown */}
                      <div className="relative inline-flex items-center">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="appearance-none pl-3 pr-8 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:border-zinc-800 dark:focus:border-zinc-500 transition shadow-xs cursor-pointer"
                        >
                          {THEME_CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Template Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {TEMPLATE_PACKAGES.filter((pkg) => selectedCategory === 'all' || pkg.category === selectedCategory).map((pkg) => {
                        const isSelected = selectedTemplate === pkg.id;
                        return (
                          <button
                            key={pkg.id}
                            onClick={() => applyTemplate(pkg)}
                            className={`p-2.5 rounded-2xl border text-left transition relative flex flex-col justify-between h-24 group cursor-pointer active:scale-[0.98] ${
                              isSelected
                                ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/15 dark:ring-zinc-100/20 shadow-md bg-white dark:bg-zinc-800'
                                : 'border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-start justify-between w-full">
                              <span
                                className="w-5 h-5 rounded-md border shadow-2xs flex-shrink-0"
                                style={{ backgroundColor: pkg.bg, borderColor: pkg.border }}
                                title={`Warna latar: ${pkg.bg}`}
                              />
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 truncate max-w-[70px]">
                                  {pkg.badge}
                                </span>
                                {isSelected && (
                                  <span className="w-4 h-4 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <p className={`font-bold text-xs leading-tight truncate ${isSelected ? 'text-zinc-900 dark:text-zinc-100 font-extrabold' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                {pkg.name}
                              </p>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate leading-tight mt-0.5">{pkg.subtitle}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Section B: Customization (Layout, Filters, Text, Stickers) */}
                  <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-amber-200/70 dark:border-zinc-800 flex flex-col gap-5 transition-colors">
                    {/* 1. Layout Mode */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2.5 flex items-center gap-1.5">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        PILIH STRIP LAYOUT
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {LAYOUTS.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setLayout(item.id);
                              if (selectedSlot >= item.slots) setSelectedSlot(0);
                            }}
                            className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between h-20 cursor-pointer ${
                              layout === item.id
                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs">{item.label}</span>
                              {layout === item.id && <Check className="w-3.5 h-3.5 text-white dark:text-zinc-900" />}
                            </div>
                            <span className={`text-[10px] leading-tight ${layout === item.id ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400 dark:text-zinc-500'}`}>
                              {item.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Photo Filters */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2.5 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        FILTER FOTO
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {FILTERS.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                              filter === f.id
                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full ${f.preview} border border-white/40 shadow-2xs`} />
                            <span className="text-[10px] font-bold tracking-tight">{f.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Text Customization */}
                    <div className="pt-2 border-t border-amber-200/50 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 block">JUDUL STRIP</label>
                        <input
                          type="text"
                          value={titleText}
                          onChange={(e) => setTitleText(e.target.value.toUpperCase())}
                          maxLength={22}
                          placeholder="POCKETBOOTH"
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-400 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 block">SUBTITEL / CAPTION</label>
                        <input
                          type="text"
                          value={subText}
                          onChange={(e) => setSubText(e.target.value)}
                          maxLength={28}
                          placeholder="SELF PHOTO STUDIO"
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-400 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                    </div>

                    {/* 4. Stickers & Date */}
                    <div>
                      <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-2 block flex items-center justify-between">
                        <span>PILIH STIKER</span>
                        <label className="flex items-center gap-1.5 cursor-pointer font-normal text-zinc-500 dark:text-zinc-400 text-[10px]">
                          <input
                            type="checkbox"
                            checked={showDate}
                            onChange={(e) => setShowDate(e.target.checked)}
                            className="rounded text-zinc-900 dark:text-zinc-100 focus:ring-0"
                          />
                          Tampilkan Tanggal
                        </label>
                      </label>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {STICKERS.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSticker(s.id)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1 flex-shrink-0 cursor-pointer ${
                              sticker === s.id
                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                            }`}
                          >
                            <span>{s.symbol || '∅'}</span>
                            <span className="text-[10px]">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: Photostrip Print Preview (5 Cols) ── */}
            <div className="lg:col-span-5 flex flex-col items-center gap-4 lg:sticky lg:top-20">
              <div className="w-full flex flex-wrap items-center justify-between gap-2 px-1">
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 font-mono tracking-wider">
                  PHOTOSTRIP PREVIEW ({photosCount}/{totalSlots})
                </span>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {captureType === 'gif' ? (
                    <>
                      {/* Download GIF Button (Hanya tampil di mode GIF) */}
                      <button
                        onClick={handleDownloadGif}
                        disabled={isDownloadingGif || isSharing || photosCount === 0}
                        className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold tracking-tight shadow-md transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer active:scale-95"
                        title="Download animasi GIF photostrip"
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>{isDownloadingGif ? 'Merender GIF...' : 'Download GIF'}</span>
                      </button>

                      {/* Share GIF Button (Hanya tampil di mode GIF) */}
                      <button
                        onClick={() => handleShare()}
                        disabled={isDownloadingGif || isSharing || photosCount === 0}
                        className="px-3.5 py-2 rounded-full border border-rose-300 dark:border-rose-800 bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-zinc-700 text-rose-700 dark:text-rose-300 text-xs font-bold tracking-tight shadow-xs transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer active:scale-95"
                        title="Bagikan animasi GIF ke media sosial"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{isSharing ? 'Menyiapkan GIF...' : 'Bagikan GIF'}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Download PNG Button (Hanya tampil di mode Foto) */}
                      <button
                        onClick={handleDownloadPng}
                        disabled={isDownloadingPng || isSharing || photosCount === 0}
                        className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold tracking-tight shadow-md transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer active:scale-95"
                        title="Download foto strip PNG"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isDownloadingPng ? 'Menyimpan...' : 'Download PNG'}</span>
                      </button>

                      {/* Share PNG Button (Hanya tampil di mode Foto) */}
                      <button
                        onClick={() => handleShare()}
                        disabled={isDownloadingPng || isSharing || photosCount === 0}
                        className="px-3.5 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold tracking-tight shadow-xs transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer active:scale-95"
                        title="Bagikan ke Instagram, WhatsApp, TikTok, dll."
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{isSharing ? 'Berbagi...' : 'Bagikan'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* The Actual Captured Photostrip Card */}
            <div className="p-5 bg-stone-300/40 dark:bg-zinc-950/60 backdrop-blur-md rounded-3xl border border-stone-300/80 dark:border-zinc-800 shadow-inner flex justify-center w-full overflow-hidden transition-colors">
              <div
                ref={stripRef}
                data-strip-target="true"
                style={{
                  backgroundColor: frameBg,
                  color: frameText,
                  borderColor: frameBorder,
                }}
                className={`relative transition-colors duration-200 shadow-2xl rounded-2xl p-4 sm:p-5 flex flex-col items-center border ${
                  layout === 'grid-4' ? 'w-[330px]' : 'w-[275px]'
                } ${
                  ornamentType === 'cyber' ? 'shadow-[0_0_20px_rgba(6,182,212,0.25)]' : ''
                }`}
              >
                {/* Theme-Matching Decorative SVGs */}
                <ThemeStripOrnaments type={ornamentType} text={frameText} border={frameBorder} />

                {/* Photostrip Frames */}
                {layout === 'grid-4' ? (
                  <div className="grid grid-cols-2 gap-3 w-full relative">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <PhotoSlot
                        key={idx}
                        index={idx}
                        photo={photos[idx]}
                        filterClass={currentFilterObj.class}
                        accentColor={frameAccent}
                        borderColor={frameBorder}
                        textColor={frameText}
                        isActive={selectedSlot === idx}
                        washiType={idx === 0 || idx === 1 ? washiType : 'none'}
                        onSelect={() => setSelectedSlot(idx)}
                        onReset={(e) => handleResetSlot(idx, e)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5 w-full relative">
                    {Array.from({ length: totalSlots }).map((_, idx) => (
                      <div key={idx} className="relative">
                        <PhotoSlot
                          index={idx}
                          photo={photos[idx]}
                          filterClass={currentFilterObj.class}
                          accentColor={frameAccent}
                          borderColor={frameBorder}
                          textColor={frameText}
                          isActive={selectedSlot === idx}
                          washiType={washiType}
                          onSelect={() => setSelectedSlot(idx)}
                          onReset={(e) => handleResetSlot(idx, e)}
                        />

                        {/* Botanical Doodles */}
                        {ornamentType === 'botanical' && idx === 0 && (
                          <div className="absolute -left-3.5 -bottom-5 pointer-events-none z-20">
                            <LeafStem1 />
                          </div>
                        )}
                        {ornamentType === 'botanical' && idx === 1 && (
                          <div className="absolute -right-3 -top-2 pointer-events-none z-20">
                            <LeafStem2 />
                          </div>
                        )}
                        {ornamentType === 'botanical' && idx === totalSlots - 1 && (
                          <div className="absolute -right-2 -bottom-2 pointer-events-none z-20">
                            <HeartHandDrawn color="#5d7255" width={16} height={16} />
                          </div>
                        )}

                        {/* Retro 70s Color Bars */}
                        {ornamentType === 'retro70s' && idx === 0 && (
                          <div className="absolute -left-2 top-2 flex flex-col gap-0.5 z-20 pointer-events-none">
                            <span className="w-1.5 h-3 bg-amber-600 rounded-xs" />
                            <span className="w-1.5 h-3 bg-amber-500 rounded-xs" />
                            <span className="w-1.5 h-3 bg-yellow-400 rounded-xs" />
                          </div>
                        )}

                        {/* 35mm Film Sprocket Accent */}
                        {ornamentType === 'filmroll' && (
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20 pointer-events-none opacity-40">
                            <span className="w-1.5 h-1.5 bg-amber-100 rounded-xs" />
                            <span className="w-1.5 h-1.5 bg-amber-100 rounded-xs" />
                          </div>
                        )}

                        {/* Cyber Coordinates Accent */}
                        {ornamentType === 'cyber' && idx === 0 && (
                          <div className="absolute -left-1 -bottom-2 font-mono text-[8px] text-cyan-400/80 z-20 pointer-events-none tracking-tighter">
                            [ + ] REC.01
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Photostrip Stamp */}
                <div
                  className="mt-5 pt-3.5 w-full border-t flex flex-col items-center text-center gap-1 relative"
                  style={{ borderColor: frameBorder }}
                >
                  {currentStickerObj.symbol && (
                    <div className="text-base select-none leading-none mb-0.5">
                      {currentStickerObj.symbol}
                    </div>
                  )}

                  <div className="font-mono font-black text-xs tracking-widest leading-tight">
                    {titleText || 'POCKETBOOTH'}
                  </div>

                  {subText && (
                    <div className="text-[9px] tracking-wider uppercase font-medium leading-tight opacity-80 font-mono">
                      {subText}
                    </div>
                  )}

                  {showDate && (
                    <div className="font-mono text-[8px] tracking-widest mt-1 opacity-70">
                      {todayFormatted} • STUDIO
                    </div>
                  )}

                  {/* Decorative Barcode / Tech Stamp */}
                  {ornamentType === 'cyber' ? (
                    <div className="mt-2 text-[7px] font-mono tracking-[0.2em] text-cyan-400/90 select-none">
                      SYS//04.X-CORE // 2077
                    </div>
                  ) : (
                    <div className="mt-2 text-[7px] font-mono tracking-[0.25em] opacity-45 select-none">
                      |||| || ||| || ||||| | ||
                    </div>
                  )}
                </div>
              </div>
            </div>

              <p className="text-[11px] text-zinc-500 text-center max-w-xs font-mono">
                💡 Tip: Klik slot frame foto pada strip untuk retake foto tertentu di kamera.
              </p>
            </div>
          </div>

        {/* Footer Support Banner */}
        <footer className="mt-16 text-center text-xs text-zinc-500 dark:text-zinc-400 font-mono flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>Pocketbooth © {new Date().getFullYear()}</span>
          <span className="hidden sm:inline">•</span>
          <button
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="hover:text-rose-600 dark:hover:text-rose-400 transition underline underline-offset-4 flex items-center gap-1 cursor-pointer font-sans font-semibold"
          >
            <span>Dukung Aplikasi via QRIS</span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 inline" />
          </button>
        </footer>
      </main>

      {/* ── SUPPORT / QRIS MODAL ── */}
      {showSupportModal && (
        <div
          onClick={() => setShowSupportModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-amber-200/60 dark:border-zinc-800 relative flex flex-col items-center gap-4 animate-in zoom-in-95 duration-150"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center w-full pr-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold mb-1">
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span>Support Developer</span>
              </div>
              <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100">
                Dukung Pocketbooth
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Scan QRIS pakai e-wallet atau mobile banking
              </p>
            </div>

            {/* Clean QRIS Card */}
            <div className="w-full bg-white text-zinc-900 rounded-2xl p-4 border border-zinc-200 shadow-sm flex flex-col items-center">
              {/* QR Code */}
              <div className="p-2 bg-white rounded-xl border border-zinc-100 shadow-2xs">
                {qrisDataUrl ? (
                  <img
                    src={qrisDataUrl}
                    alt="QRIS Support"
                    className="w-56 h-56 object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-zinc-400 font-mono text-xs">
                    Memuat QRIS...
                  </div>
                )}
              </div>

              {/* Accepted Payments Badges */}
              <div className="mt-3 text-[10px] text-zinc-400 font-mono text-center flex flex-wrap items-center justify-center gap-1.5 leading-tight">
                <span className="bg-zinc-100 px-1.5 py-0.5 rounded font-semibold text-zinc-600">BCA</span>
                <span className="bg-zinc-100 px-1.5 py-0.5 rounded font-semibold text-zinc-600">Mandiri</span>
                <span className="bg-zinc-100 px-1.5 py-0.5 rounded font-semibold text-zinc-600">BRI</span>
                <span className="bg-zinc-100 px-1.5 py-0.5 rounded font-semibold text-zinc-600">GoPay</span>
                <span className="bg-zinc-100 px-1.5 py-0.5 rounded font-semibold text-zinc-600">OVO</span>
                <span className="bg-zinc-100 px-1.5 py-0.5 rounded font-semibold text-zinc-600">Dana</span>
                <span className="bg-zinc-100 px-1.5 py-0.5 rounded font-semibold text-zinc-600">ShopeePay</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SOCIAL SHARE MODAL ── */}
      {showShareModal && (
        <div
          onClick={() => setShowShareModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-amber-200/60 dark:border-zinc-800 relative flex flex-col items-center gap-3.5 animate-in zoom-in-95 duration-150"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center w-full pr-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold mb-1">
                {shareBlob?.type === 'image/gif' ? (
                  <>
                    <Film className="w-3 h-3 text-rose-500" />
                    <span>Bagikan Animasi GIF</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3 h-3 text-rose-500" />
                    <span>Bagikan Photostrip</span>
                  </>
                )}
              </div>
              <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100">
                {shareBlob?.type === 'image/gif' ? 'Kirim Animasi GIF' : 'Kirim ke Media Sosial'}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {shareBlob?.type === 'image/gif'
                  ? 'Simpan animasi GIF atau bagikan langsung via aplikasi'
                  : 'Salin gambar langsung atau bagikan via aplikasi'}
              </p>
            </div>

            {/* Photostrip Preview Thumbnail */}
            {sharePreviewUrl && (
              <div className="w-full bg-stone-100 dark:bg-zinc-950 rounded-2xl p-2.5 border border-zinc-200 dark:border-zinc-800 flex justify-center max-h-48 overflow-hidden shadow-inner relative">
                <img
                  src={sharePreviewUrl}
                  alt={shareBlob?.type === 'image/gif' ? 'Preview Animasi GIF' : 'Preview Photostrip'}
                  className="max-h-44 object-contain rounded-lg shadow-sm"
                />
                {shareBlob?.type === 'image/gif' && (
                  <span className="absolute bottom-3.5 right-3.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold tracking-wider flex items-center gap-1 shadow-xs pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    GIF
                  </span>
                )}
              </div>
            )}

            {/* Primary Action Button: Copy Image (PNG) or Download GIF */}
            <button
              onClick={handleCopyImage}
              className="w-full py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {copiedImage ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>{shareBlob?.type === 'image/gif' ? 'GIF Terunduh! (Siap Dikirim)' : 'Gambar Tersalin! (Tinggal Paste)'}</span>
                </>
              ) : (
                <>
                  {shareBlob?.type === 'image/gif' ? (
                    <>
                      <Download className="w-4 h-4 text-rose-400" />
                      <span>Simpan Animasi GIF ke Galeri</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Gambar ke Clipboard</span>
                    </>
                  )}
                </>
              )}
            </button>

            {/* Direct Social Media Share Buttons */}
            <div className="w-full grid grid-cols-2 gap-2">
              {/* Instagram */}
              <button
                onClick={() => handleShareToPlatform('instagram')}
                className="py-2.5 px-3 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 hover:opacity-90 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer text-rose-700 dark:text-rose-300 shadow-2xs"
                title={shareBlob?.type === 'image/gif' ? 'Buka Instagram (Otomatis simpan GIF ke galeri)' : 'Buka Instagram (Otomatis simpan foto ke galeri)'}
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                <span>Instagram</span>
              </button>

              {/* TikTok */}
              <button
                onClick={() => handleShareToPlatform('tiktok')}
                className="py-2.5 px-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer text-zinc-900 dark:text-zinc-100 shadow-2xs"
                title={shareBlob?.type === 'image/gif' ? 'Buka TikTok (Otomatis simpan GIF ke galeri)' : 'Buka TikTok (Otomatis simpan foto ke galeri)'}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.96-4.52V8.01a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.96-.44z"/>
                </svg>
                <span>TikTok</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleShareToPlatform('whatsapp')}
                className="py-2.5 px-3 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-bold text-xs flex items-center justify-center gap-2 transition shadow-2xs cursor-pointer"
                title={shareBlob?.type === 'image/gif' ? 'Kirim ke WhatsApp (Otomatis simpan GIF)' : 'Kirim ke WhatsApp (Langsung lampirkan foto di HP)'}
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp</span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={() => handleShareToPlatform('twitter')}
                className="py-2.5 px-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-bold text-xs flex items-center justify-center gap-2 transition shadow-2xs cursor-pointer"
                title="Kirim ke Twitter / X"
              >
                <span className="font-black text-sm">𝕏</span>
                <span>Twitter / X</span>
              </button>
            </div>

            {/* Mobile Native Share Drawer (Android & iOS direct app sharing) */}
            <button
              onClick={() => handleShareToPlatform('native')}
              className="w-full py-2.5 px-3 rounded-2xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
              title={shareBlob?.type === 'image/gif' ? 'Kirim file GIF via menu bawaan HP' : 'Kirim file langsung ke Instagram Stories, TikTok, WA, dll.'}
            >
              <Share2 className="w-4 h-4" />
              <span>{shareBlob?.type === 'image/gif' ? 'Kirim GIF via Menu Bawaan HP' : 'Kirim File via Menu Bawaan HP'}</span>
            </button>

            {/* Download Button in Modal */}
            <button
              onClick={() => {
                setShowShareModal(false);
                if (shareBlob?.type === 'image/gif') {
                  handleDownloadGif();
                } else {
                  handleDownloadPng();
                }
              }}
              className="w-full py-1.5 px-3 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{shareBlob?.type === 'image/gif' ? 'Download File Animasi GIF' : 'Unduh File PNG Biasa'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Hidden Canvas for Captures */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// Individual Photo Slot Frame with Washi Tape
function PhotoSlot({ index, photo, filterClass, accentColor, borderColor, textColor, isActive, washiType, onSelect, onReset }) {
  const isGif = Boolean(photo && typeof photo === 'string' && photo.startsWith('data:image/gif'));

  return (
    <div
      onClick={onSelect}
      data-slot-frame="true"
      className="relative w-full rounded-xl overflow-visible cursor-pointer transition group border"
      style={{
        paddingTop: '75%', // Guarantees exact 4:3 box in every browser and html2canvas (3/4 = 75%)
        backgroundColor: accentColor,
        borderColor: isActive ? '#000000' : borderColor,
      }}
    >
      {/* Decorative Washi Tape on top edge */}
      <WashiTape type={washiType} />

      {/* Inner Image Container fills exact 4:3 box */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        {photo ? (
          <>
            <img
              key={photo.slice(0, 80)}
              data-slot-photo="true"
              data-slot-index={index}
              src={photo}
              alt={`Slot ${index + 1}`}
              className={`w-full h-full object-cover block ${filterClass}`}
              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
            />
            {/* GIF indicator badge */}
            {isGif && (
              <span
                data-html2canvas-ignore="true"
                className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-white text-[9px] font-mono font-bold tracking-wider pointer-events-none z-20 flex items-center gap-1 shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                GIF
              </span>
            )}
            {/* Retake Button */}
            <button
              data-html2canvas-ignore="true"
              data-reset-btn="true"
              onClick={onReset}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow hover:bg-black z-30"
              title="Reset slot ini"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 transition" style={{ color: textColor }}>
            <Camera className="w-5 h-5 opacity-40" />
            <span
              data-slot-placeholder="true"
              data-slot-index={index}
              className="font-mono text-[9px] font-bold tracking-wider opacity-60"
            >
              {isActive ? 'READY' : `SLOT ${index + 1}`}
            </span>
          </div>
        )}
      </div>

      {/* Active Indicator Ring */}
      {isActive && (
        <div
          data-html2canvas-ignore="true"
          data-active-ring="true"
          className="absolute inset-0 border-2 border-zinc-900 pointer-events-none rounded-xl z-20"
        />
      )}
    </div>
  );
}
