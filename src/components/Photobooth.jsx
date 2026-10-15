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
} from 'lucide-react';
import { savePhoto, getAllPhotos, deletePhoto, clearAllPhotos } from '../db/photoDb';
import { playCountdownBeep, playShutterSound } from '../utils/audio';

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
  { id: 'korean', label: 'Korean / Aesthetic' },
  { id: 'vintage', label: 'Vintage / Retro' },
  { id: 'modern', label: 'Modern / Futuristic' },
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
  { id: 'strip-4', label: '4-Cuts Strip', slots: 4, desc: 'Classic vertical photostrip' },
  { id: 'strip-3', label: '3-Cuts Strip', slots: 3, desc: '3-photo vertical strip' },
  { id: 'grid-4', label: '2x2 Grid', slots: 4, desc: 'Quad 2x2 grid layout' },
];

// Aesthetic Photo Filters
const FILTERS = [
  { id: 'normal', name: 'Original', class: 'filter-normal', preview: 'bg-zinc-200' },
  { id: 'bw', name: 'Monochrome', class: 'filter-bw', preview: 'bg-zinc-800' },
  { id: 'retro70s', name: 'Retro 70s', class: 'filter-retro70s', preview: 'bg-amber-600' },
  { id: 'vintage', name: 'Polaroid 90s', class: 'filter-vintage', preview: 'bg-yellow-700' },
  { id: 'film', name: '35mm Film', class: 'filter-film', preview: 'bg-stone-700' },
  { id: 'cyber', name: 'Cyber Neon', class: 'filter-cyber', preview: 'bg-cyan-500' },
  { id: 'silver', name: 'Chrome Silver', class: 'filter-silver', preview: 'bg-slate-400' },
  { id: 'soft', name: 'Soft Warm', class: 'filter-soft', preview: 'bg-rose-300' },
  { id: 'cool', name: 'Cool Tone', class: 'filter-cool', preview: 'bg-sky-600' },
];

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

export default function Photobooth() {
  // Selected Template Category & Package
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('botanical');

  // Customization States
  const [layout, setLayout] = useState('strip-4');
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isAutoShooting, setIsAutoShooting] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

  // Load Saved Photos
  useEffect(() => {
    getAllPhotos(4).then((stored) => {
      if (stored && Object.keys(stored).length > 0) {
        setPhotos(stored);
      }
    });
  }, []);

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
  const startCamera = useCallback(async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      showToast('Kamera butuh akses HTTPS atau localhost 🔒');
      return;
    }

    try {
      stopCamera();

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play error:', playErr);
        }
      }

      setIsCameraActive(true);
      showToast('Kamera aktif! 📷');
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        showToast('Izin kamera ditolak. Aktifkan di browser 🔒');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        showToast('Kamera tidak ditemukan di perangkat 📷');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        showToast('Kamera sedang dipakai aplikasi lain ⚠️');
      } else {
        showToast(`Gagal buka kamera: ${err.message || 'Error'} ❌`);
      }
      setIsCameraActive(false);
    }
  }, [facingMode, stopCamera, showToast]);

  // Sync Video Element with Stream
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isCameraActive]);

  // Restart camera when facingMode changes
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
  }, [facingMode, startCamera, isCameraActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [stopCamera]);

  // Capture Frame from Video
  const captureFrame = useCallback(
    async (slotIndex) => {
      if (!videoRef.current || !canvasRef.current) return null;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      if (mirrorCamera && facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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

  // Single Capture with Timer
  const handleCapture = useCallback(
    async (slotIndex) => {
      if (!isCameraActive) {
        await startCamera();
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

      await captureFrame(slotIndex);

      const nextSlot = (slotIndex + 1) % totalSlots;
      setSelectedSlot(nextSlot);
      showToast(`Slot ${slotIndex + 1} berhasil diambil! ✨`);
    },
    [isCameraActive, startCamera, timerSeconds, soundEnabled, captureFrame, totalSlots, showToast]
  );

  // Auto Burst / Series Mode
  const handleAutoSeries = useCallback(async () => {
    if (!isCameraActive) {
      await startCamera();
    }

    setIsAutoShooting(true);
    showToast('Auto Series dimulai! Bersiap pose 📸');

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

      await captureFrame(slot);
      await new Promise((res) => setTimeout(res, 800));
    }

    setIsAutoShooting(false);
    showToast('Selesai! Semua foto siap dicetak 🎉');
  }, [isCameraActive, startCamera, timerSeconds, totalSlots, soundEnabled, captureFrame, showToast]);

  // Upload Local File
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target.result;
      await savePhoto(selectedSlot, dataUrl);
      setPhotos((prev) => ({ ...prev, [selectedSlot]: dataUrl }));
      showToast(`Foto diunggah ke slot ${selectedSlot + 1} 📁`);
      setSelectedSlot((prev) => (prev + 1) % totalSlots);
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
    setSelectedSlot(slotIdx);
    showToast(`Slot ${slotIdx + 1} direset 🔄`);
  };

  // Reset All
  const handleResetAll = async () => {
    if (!window.confirm('Reset semua foto di photostrip?')) return;
    await clearAllPhotos();
    setPhotos({});
    setSelectedSlot(0);
    showToast('Semua slot dibersihkan');
  };

  // Download High-Resolution Photostrip
  const handleDownload = async () => {
    if (!stripRef.current) return;
    try {
      setIsDownloading(true);
      showToast('Sedang merender photostrip...');

      const canvas = await html2canvas(stripRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: frameBg,
        logging: false,
      });

      const link = document.createElement('a');
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      link.download = `pocketbooth-${selectedTemplate}-${dateStr}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToast('Photostrip berhasil diunduh! 💖');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengunduh foto 😢');
    } finally {
      setIsDownloading(false);
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
    <div className="min-h-screen bg-[#f5ede2] text-zinc-900 pb-20 relative overflow-hidden selection:bg-rose-200">

      {/* ── Background Organic Decorations ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 10%, rgba(224,200,180,0.55) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 85%, rgba(181,201,168,0.35) 0%, transparent 55%),
            radial-gradient(ellipse at 55% 50%, rgba(240,215,200,0.2) 0%, transparent 70%)
          `,
        }}
      />

      {/* Floating Blobs */}
      <div className="deco-blob deco-blob--1" />
      <div className="deco-blob deco-blob--2" />
      <div className="deco-blob deco-blob--3" />

      {/* Floating Leaves & Flowers (Exact SVGs requested) */}
      <Leaf className="deco deco-leaf deco-leaf--tl" />
      <Leaf className="deco deco-leaf deco-leaf--br" />
      <Flower className="deco deco-flower deco-flower--tr" />
      <Flower className="deco deco-flower deco-flower--bl" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/90 backdrop-blur-md text-white text-xs md:text-sm font-medium px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-zinc-700 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Flash Effect */}
      {isFlashing && (
        <div className="fixed inset-0 bg-white z-[9999] pointer-events-none animate-out fade-out duration-200" />
      )}

      {/* Header */}
      <header className="border-b border-amber-200/50 bg-white/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5d7255] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              PB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight font-sans text-zinc-800">POCKETBOOTH</h1>
                <span className="text-[10px] font-mono tracking-widest bg-amber-100/70 text-amber-900 px-1.5 py-0.5 rounded font-semibold border border-amber-200/60">
                  STUDIO
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono tracking-tight -mt-0.5">Self Photo Booth Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-amber-200/70 bg-white/80 hover:bg-white text-zinc-600 transition shadow-xs"
              title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-zinc-700" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
            </button>
            <button
              onClick={handleResetAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-200/70 bg-white/80 hover:bg-white text-zinc-700 transition flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Semua</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="max-w-6xl mx-auto px-4 pt-6 md:pt-8 relative z-10">

        {/* ── PAKET TEMPLATE CAROUSEL SECTION ── */}
        <section className="mb-6 bg-white/75 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-amber-200/60 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 px-1">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700">PILIH PAKET TEMPLATE</h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {THEME_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {TEMPLATE_PACKAGES.filter((pkg) => selectedCategory === 'all' || pkg.category === selectedCategory).map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => applyTemplate(pkg)}
                className={`p-2.5 rounded-2xl border text-left transition relative flex flex-col justify-between h-24 group ${
                  selectedTemplate === pkg.id
                    ? 'border-zinc-800 ring-2 ring-zinc-800/15 shadow-md bg-white'
                    : 'border-zinc-200/80 bg-white/60 hover:bg-white text-zinc-700 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <span
                    className="w-5 h-5 rounded-md border shadow-2xs flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: pkg.bg, borderColor: pkg.border }}
                  >
                    {selectedTemplate === pkg.id && <Check className="w-3 h-3 text-white drop-shadow-xs" />}
                  </span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 truncate max-w-[70px]">
                    {pkg.badge}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-xs text-zinc-900 leading-tight truncate">{pkg.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate leading-tight mt-0.5">{pkg.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── STUDIO CONTENT: Viewfinder (Left) & Photostrip Preview (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT: Camera & Studio Controls (7 Cols) ── */}
          <div className="lg:col-span-7 flex flex-col gap-5">

            {/* Viewfinder Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 md:p-5 shadow-sm border border-amber-200/70 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 text-xs text-zinc-500 font-mono">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className={`w-2.5 h-2.5 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
                  {isCameraActive ? 'LIVE CAMERA ACTIVE' : 'STANDBY MODE'}
                </span>
                <span className="bg-amber-100/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-900 border border-amber-200/60">
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
                  onLoadedMetadata={() => {
                    videoRef.current?.play().catch(() => {});
                  }}
                  className={`w-full h-full object-cover ${mirrorCamera && facingMode === 'user' ? '-scale-x-100' : ''} ${currentFilterObj.class} ${
                    isCameraActive ? 'block' : 'hidden'
                  }`}
                />

                {!isCameraActive && (
                  <div className="text-center p-6 flex flex-col items-center gap-3">
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
                      onClick={startCamera}
                      className="mt-2 text-xs font-bold px-5 py-2.5 bg-white text-zinc-900 rounded-full hover:bg-zinc-100 transition shadow"
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
                        onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
                        className="p-1 rounded-full text-zinc-300 hover:text-white transition"
                        title="Ganti Kamera Depan/Belakang"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shutter & Actions */}
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                {/* Auto Series */}
                <button
                  onClick={handleAutoSeries}
                  disabled={isAutoShooting}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-rose-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2 group disabled:opacity-50"
                  title="Ambil foto otomatis berurutan sesuai layout"
                >
                  <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition" />
                  <span>{isAutoShooting ? 'MEMOTRET...' : 'AUTO SERIES'}</span>
                </button>

                {/* Primary Shutter */}
                <button
                  onClick={() => handleCapture(selectedSlot)}
                  disabled={isAutoShooting}
                  className="w-full flex-1 py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-black text-white font-bold text-sm tracking-wide shadow-md transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>
                    {!isCameraActive
                      ? 'BUKA KAMERA'
                      : timerSeconds > 0
                      ? `POTRET SLOT ${selectedSlot + 1} (${timerSeconds}s)`
                      : `POTRET SLOT ${selectedSlot + 1}`}
                  </span>
                </button>

                {/* Upload Local Image */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto p-3.5 rounded-2xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                  title="Upload Foto Sendiri"
                >
                  <Upload className="w-4 h-4" />
                  <span className="sm:hidden">Upload File</span>
                </button>
              </div>

              {/* Slot Indicator Pills */}
              <div className="mt-4 pt-3 border-t border-amber-200/50 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono text-[11px] font-bold">PILIH SLOT FRAME:</span>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalSlots }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(idx)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 ${
                        selectedSlot === idx
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : photos[idx]
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      <span>#{idx + 1}</span>
                      {photos[idx] && <Check className="w-3 h-3 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Customization Details */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-amber-200/70 flex flex-col gap-5">

              {/* 1. Layout Mode */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2.5 flex items-center gap-1.5">
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
                      className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between h-20 ${
                        layout === item.id
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{item.label}</span>
                        {layout === item.id && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className={`text-[10px] leading-tight ${layout === item.id ? 'text-zinc-300' : 'text-zinc-400'}`}>
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Photo Filters */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  FILTER FOTO
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                        filter === f.id
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ${f.preview} border border-white/40 shadow-2xs`} />
                      <span className="text-[10px] font-bold tracking-tight">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Text Customization */}
              <div className="pt-2 border-t border-amber-200/50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 mb-1 block">JUDUL STRIP</label>
                  <input
                    type="text"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value.toUpperCase())}
                    maxLength={22}
                    placeholder="POCKETBOOTH"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 font-mono text-xs focus:outline-none focus:border-zinc-800 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 mb-1 block">SUBTITEL / CAPTION</label>
                  <input
                    type="text"
                    value={subText}
                    onChange={(e) => setSubText(e.target.value)}
                    maxLength={28}
                    placeholder="SELF PHOTO STUDIO"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-800 bg-white"
                  />
                </div>
              </div>

              {/* 4. Stickers & Date */}
              <div>
                <label className="text-[11px] font-bold text-zinc-600 mb-2 block flex items-center justify-between">
                  <span>PILIH STIKER</span>
                  <label className="flex items-center gap-1.5 cursor-pointer font-normal text-zinc-500 text-[10px]">
                    <input
                      type="checkbox"
                      checked={showDate}
                      onChange={(e) => setShowDate(e.target.checked)}
                      className="rounded text-zinc-900 focus:ring-0"
                    />
                    Tampilkan Tanggal
                  </label>
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {STICKERS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSticker(s.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1 flex-shrink-0 ${
                        sticker === s.id
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
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

          {/* ── RIGHT: Photostrip Print Preview (5 Cols) ── */}
          <div className="lg:col-span-5 flex flex-col items-center gap-4">

            <div className="w-full flex items-center justify-between px-1">
              <span className="text-xs font-bold text-zinc-600 font-mono tracking-wider">
                PHOTOSTRIP PREVIEW ({photosCount}/{totalSlots})
              </span>
              <button
                onClick={handleDownload}
                disabled={isDownloading || photosCount === 0}
                className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-bold tracking-tight shadow-md transition flex items-center gap-1.5 disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? 'Menyimpan...' : 'Download Print'}</span>
              </button>
            </div>

            {/* The Actual Captured Photostrip Card */}
            <div className="p-5 bg-stone-300/40 backdrop-blur-md rounded-3xl border border-stone-300/80 shadow-inner flex justify-center w-full overflow-hidden">
              <div
                ref={stripRef}
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
                        aspect="aspect-[4/3]"
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
                          aspect="aspect-[4/3]"
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
              💡 Tip: Pilih paket template di atas atau klik slot frame untuk retake foto tertentu.
            </p>
          </div>
        </div>
      </main>

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
function PhotoSlot({ index, photo, filterClass, accentColor, borderColor, textColor, isActive, washiType, onSelect, onReset, aspect }) {
  return (
    <div
      onClick={onSelect}
      className={`relative w-full ${aspect} rounded-xl overflow-visible cursor-pointer transition group border`}
      style={{
        backgroundColor: accentColor,
        borderColor: isActive ? '#000000' : borderColor,
      }}
    >
      {/* Decorative Washi Tape on top edge */}
      <WashiTape type={washiType} />

      {/* Inner Image Container */}
      <div className="w-full h-full rounded-xl overflow-hidden relative">
        {photo ? (
          <>
            <img
              src={photo}
              alt={`Slot ${index + 1}`}
              className={`w-full h-full object-cover ${filterClass}`}
            />
            {/* Retake Button */}
            <button
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
            <span className="font-mono text-[9px] font-bold tracking-wider opacity-60">
              {isActive ? 'READY' : `SLOT ${index + 1}`}
            </span>
          </div>
        )}
      </div>

      {/* Active Indicator Ring */}
      {isActive && (
        <div className="absolute inset-0 border-2 border-zinc-900 pointer-events-none rounded-xl z-20" />
      )}
    </div>
  );
}
