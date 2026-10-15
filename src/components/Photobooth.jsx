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
  Palette,
  LayoutGrid,
  Check,
  ChevronRight,
  Sliders,
  Image as ImageIcon,
  Flame,
  Zap,
} from 'lucide-react';
import { savePhoto, getAllPhotos, deletePhoto, clearAllPhotos } from '../db/photoDb';
import { playCountdownBeep, playShutterSound } from '../utils/audio';

// Layout Configurations
const LAYOUTS = [
  { id: 'strip-4', label: '4-Cuts', slots: 4, desc: 'Classic Korean 4-Cut vertical strip' },
  { id: 'strip-3', label: '3-Cuts', slots: 3, desc: '3-Cut vertical strip' },
  { id: 'grid-4', label: '2x2 Grid', slots: 4, desc: 'Photoism quad grid layout' },
];

// Color Themes for Photostrip Frame
const THEMES = [
  { id: 'white', name: 'Snow White', bg: '#ffffff', text: '#18181b', subtext: '#71717a', border: '#e4e4e7', accent: '#f4f4f5' },
  { id: 'black', name: 'Matte Charcoal', bg: '#18181b', text: '#fafafa', subtext: '#a1a1aa', border: '#27272a', accent: '#27272a' },
  { id: 'butter', name: 'Cream Butter', bg: '#fef9c3', text: '#713f12', subtext: '#a16207', border: '#fef08a', accent: '#fef08a' },
  { id: 'pink', name: 'Strawberry Milk', bg: '#fce7f3', text: '#831843', subtext: '#be185d', border: '#fbcfe8', accent: '#fbcfe8' },
  { id: 'sky', name: 'Haru Sky', bg: '#e0f2fe', text: '#0369a1', subtext: '#0284c7', border: '#bae6fd', accent: '#bae6fd' },
  { id: 'sage', name: 'Matcha Sage', bg: '#dcfce7', text: '#14532d', subtext: '#15803d', border: '#bbf7d0', accent: '#bbf7d0' },
  { id: 'lavender', name: 'Lilac Dream', bg: '#f3e8ff', text: '#581c87', subtext: '#7e22ce', border: '#e9d5ff', accent: '#e9d5ff' },
  { id: 'navy', name: 'Midnight Blue', bg: '#0f172a', text: '#f8fafc', subtext: '#94a3b8', border: '#1e293b', accent: '#1e293b' },
];

// Aesthetic Photo Filters
const FILTERS = [
  { id: 'normal', name: 'Original', class: 'filter-normal', preview: 'bg-zinc-200' },
  { id: 'bw', name: 'Monochrome', class: 'filter-bw', preview: 'bg-zinc-800' },
  { id: 'vintage', name: 'Vintage 90s', class: 'filter-vintage', preview: 'bg-amber-700' },
  { id: 'soft', name: 'Haru Soft', class: 'filter-soft', preview: 'bg-rose-300' },
  { id: 'film', name: 'Retro Film', class: 'filter-film', preview: 'bg-emerald-700' },
  { id: 'cool', name: 'Cool Tone', class: 'filter-cool', preview: 'bg-cyan-700' },
];

// Decorative Korean Stickers/Icons
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
  // Config States
  const [layout, setLayout] = useState('strip-4');
  const [theme, setTheme] = useState('white');
  const [filter, setFilter] = useState('normal');
  const [timerSeconds, setTimerSeconds] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mirrorCamera, setMirrorCamera] = useState(true);
  const [facingMode, setFacingMode] = useState('user');

  // Customization
  const [titleText, setTitleText] = useState('POCKETBOOTH');
  const [subText, setSubText] = useState('LIFE 4 CUTS STUDIO');
  const [sticker, setSticker] = useState('heart');
  const [showDate, setShowDate] = useState(true);

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
  const currentThemeObj = THEMES.find((t) => t.id === theme) || THEMES[0];
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

  // Load Saved Photos on Mount
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

  // Start Camera Helper
  const startCamera = useCallback(async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      showToast('Kamera butuh akses HTTPS atau localhost 🔒');
      return;
    }

    try {
      stopCamera();

      let stream;
      // 1. Try with facingMode and ideal resolution
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
        // 2. Fallback to basic video constraint (works across all webcams)
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

  // Ensure video element syncs with active stream
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

      // Handle horizontal mirroring
      if (mirrorCamera && facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Flash & sound
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

  // Single Capture with Optional Timer
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

      // Auto move to next empty slot
      const nextSlot = (slotIndex + 1) % totalSlots;
      setSelectedSlot(nextSlot);
      showToast(`Slot ${slotIndex + 1} berhasil diambil! ✨`);
    },
    [isCameraActive, startCamera, timerSeconds, soundEnabled, captureFrame, totalSlots, showToast]
  );

  // Auto Burst / Series Mode: Takes All Remaining Slots in Sequence
  const handleAutoSeries = useCallback(async () => {
    if (!isCameraActive) {
      await startCamera();
    }

    setIsAutoShooting(true);
    showToast('Auto 4-Cuts dimulai! Bersiap pose 📸');

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
      await new Promise((res) => setTimeout(res, 800)); // Short pause between shots
    }

    setIsAutoShooting(false);
    showToast('Selesai! Semua foto siap dicetak 🎉');
  }, [isCameraActive, startCamera, timerSeconds, totalSlots, soundEnabled, captureFrame, showToast]);

  // Upload Local File to Slot
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

  // Reset All Slots
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

      // High retina scale for crisp physical-print quality
      const canvas = await html2canvas(stripRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: currentThemeObj.bg,
        logging: false,
      });

      const link = document.createElement('a');
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      link.download = `pocketbooth-${layout}-${dateStr}.png`;
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

  // Formatted Today Date
  const todayFormatted = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  })();

  const photosCount = Object.keys(photos).filter((k) => photos[k] && Number(k) < totalSlots).length;

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-zinc-900 pb-16 selection:bg-rose-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 backdrop-blur-md text-white text-xs md:text-sm font-medium px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-zinc-700 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Flash Effect */}
      {isFlashing && (
        <div className="fixed inset-0 bg-white z-[9999] pointer-events-none animate-out fade-out duration-200" />
      )}

      {/* Header */}
      <header className="border-b border-zinc-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm tracking-tighter shadow-sm">
              PB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight font-sans">POCKETBOOTH</h1>
                <span className="text-[10px] font-mono tracking-widest bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600 font-semibold border border-zinc-200">
                  포켓부스
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono tracking-tight -mt-0.5">Korean Self Photo Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 transition"
              title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
            </button>
            <button
              onClick={handleResetAll}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="max-w-6xl mx-auto px-4 pt-6 md:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT: Camera & Controls (7 Cols) ── */}
          <div className="lg:col-span-7 flex flex-col gap-5">

            {/* Viewfinder Card */}
            <div className="bg-white rounded-3xl p-4 md:p-5 shadow-sm border border-zinc-200/90 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 text-xs text-zinc-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
                  {isCameraActive ? 'LIVE CAMERA' : 'STANDBY'}
                </span>
                <span className="bg-zinc-100 px-2 py-0.5 rounded text-[11px] font-semibold text-zinc-700">
                  SLOT {selectedSlot + 1} OF {totalSlots}
                </span>
              </div>

              {/* Viewfinder Window */}
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
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-300">Kamera Belum Aktif</p>
                      <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                        Klik tombol di bawah untuk menyalakan kamera & mulai sesi foto Korean Photobooth kamu.
                      </p>
                    </div>
                    <button
                      onClick={startCamera}
                      className="mt-2 text-xs font-semibold px-4 py-2 bg-white text-zinc-900 rounded-full hover:bg-zinc-100 transition shadow"
                    >
                      Buka Kamera
                    </button>
                  </div>
                )}

                {/* Live Countdown Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-30 pointer-events-none">
                    <div className="text-8xl md:text-9xl font-black text-white font-mono drop-shadow-2xl animate-ping">
                      {countdown}
                    </div>
                  </div>
                )}

                {/* Viewfinder Guidelines Overlay (Rule of Thirds) */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-15">
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-white" />
                    <div className="border-r border-white" />
                    <div />
                  </div>
                )}

                {/* Viewfinder Header Controls Floating */}
                {isCameraActive && (
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
                    {/* Timer Selector */}
                    <div className="bg-black/60 backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-1 text-[11px] text-white border border-white/10">
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
                    <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/10">
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

              {/* Shutter & Main Action Row */}
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                {/* Auto Series (Burst Mode) */}
                <button
                  onClick={handleAutoSeries}
                  disabled={isAutoShooting}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2 group disabled:opacity-50"
                  title="Ambil 4 foto otomatis berurutan seperti photobooth sungguhan"
                >
                  <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition" />
                  <span>{isAutoShooting ? 'MEMOTRET...' : 'AUTO 4-CUTS'}</span>
                </button>

                {/* Primary Tactile Shutter Button */}
                <button
                  onClick={() => handleCapture(selectedSlot)}
                  disabled={isAutoShooting}
                  className="w-full flex-1 py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-black text-white font-bold text-sm tracking-wide shadow-lg transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
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
                  className="w-full sm:w-auto p-3.5 rounded-2xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  title="Upload Foto Sendiri"
                >
                  <Upload className="w-4 h-4" />
                  <span className="sm:hidden">Upload Foto</span>
                </button>
              </div>

              {/* Slot Indicator Pills */}
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono text-[11px]">PILIH SLOT:</span>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalSlots }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(idx)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 ${
                        selectedSlot === idx
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : photos[idx]
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                      }`}
                    >
                      <span>#{idx + 1}</span>
                      {photos[idx] && <Check className="w-3 h-3 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Studio Customization Panels (Accordions / Tabs) */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-zinc-200/90 flex flex-col gap-5">

              {/* 1. Layout Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2.5 flex items-center gap-1.5">
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
                          : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 text-zinc-800'
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
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  KOREAN FILTER AESTHETIC
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                        filter === f.id
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ${f.preview} border border-white/40 shadow-xs`} />
                      <span className="text-[10px] font-bold tracking-tight">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Frame Color Themes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  WARNA FRAME PHOTOSTRIP
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-1.5 rounded-xl border transition flex flex-col items-center gap-1 text-center ${
                        theme === t.id ? 'border-zinc-900 ring-2 ring-zinc-900/10' : 'border-zinc-200 hover:bg-zinc-50'
                      }`}
                      title={t.name}
                    >
                      <span
                        className="w-7 h-7 rounded-lg border shadow-xs flex items-center justify-center"
                        style={{ backgroundColor: t.bg, borderColor: t.border }}
                      >
                        {theme === t.id && <Check className="w-3 h-3" style={{ color: t.text }} />}
                      </span>
                      <span className="text-[9px] font-medium text-zinc-500 truncate w-full">{t.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Text & Sticker Customization */}
              <div className="pt-2 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 mb-1 block">JUDUL STRIP</label>
                  <input
                    type="text"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value.toUpperCase())}
                    maxLength={20}
                    placeholder="POCKETBOOTH"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 font-mono text-xs focus:outline-none focus:border-zinc-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 mb-1 block">SUBTITEL / CAPTION</label>
                  <input
                    type="text"
                    value={subText}
                    onChange={(e) => setSubText(e.target.value)}
                    maxLength={28}
                    placeholder="LIFE 4 CUTS STUDIO"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-800"
                  />
                </div>
              </div>

              {/* 5. Sticker Stamp Selector */}
              <div>
                <label className="text-[11px] font-bold text-zinc-500 mb-2 block flex items-center justify-between">
                  <span>IKON STIKER KOREA</span>
                  <label className="flex items-center gap-1.5 cursor-pointer font-normal text-zinc-400 text-[10px]">
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
                          : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
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

          {/* ── RIGHT: Physical Photostrip Preview & Download (5 Cols) ── */}
          <div className="lg:col-span-5 flex flex-col items-center gap-4">

            <div className="w-full flex items-center justify-between px-1">
              <span className="text-xs font-bold text-zinc-500 font-mono tracking-wider">
                PHOTOSTRIP PREVIEW ({photosCount}/{totalSlots})
              </span>
              <button
                onClick={handleDownload}
                disabled={isDownloading || photosCount === 0}
                className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-bold tracking-tight shadow-md transition flex items-center gap-1.5 disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? 'Menyimpan...' : 'Download Print'}</span>
              </button>
            </div>

            {/* The Actual Captured Card Container */}
            <div className="p-4 bg-zinc-200/50 rounded-3xl border border-zinc-300/60 shadow-inner flex justify-center w-full overflow-hidden">
              <div
                ref={stripRef}
                style={{
                  backgroundColor: currentThemeObj.bg,
                  color: currentThemeObj.text,
                  borderColor: currentThemeObj.border,
                }}
                className={`transition-colors duration-200 shadow-2xl rounded-xl p-4 flex flex-col items-center ${
                  layout === 'grid-4' ? 'w-[320px]' : 'w-[260px]'
                }`}
              >
                {/* Photostrip Frames */}
                {layout === 'grid-4' ? (
                  // 2x2 Grid Layout
                  <div className="grid grid-cols-2 gap-2.5 w-full">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <PhotoSlot
                        key={idx}
                        index={idx}
                        photo={photos[idx]}
                        filterClass={currentFilterObj.class}
                        theme={currentThemeObj}
                        isActive={selectedSlot === idx}
                        onSelect={() => setSelectedSlot(idx)}
                        onReset={(e) => handleResetSlot(idx, e)}
                        aspect="aspect-[4/3]"
                      />
                    ))}
                  </div>
                ) : (
                  // Vertical Strip Layout (3 or 4 cuts)
                  <div className="flex flex-col gap-2.5 w-full">
                    {Array.from({ length: totalSlots }).map((_, idx) => (
                      <PhotoSlot
                        key={idx}
                        index={idx}
                        photo={photos[idx]}
                        filterClass={currentFilterObj.class}
                        theme={currentThemeObj}
                        isActive={selectedSlot === idx}
                        onSelect={() => setSelectedSlot(idx)}
                        onReset={(e) => handleResetSlot(idx, e)}
                        aspect="aspect-[4/3]"
                      />
                    ))}
                  </div>
                )}

                {/* Bottom Photostrip Branding Stamp */}
                <div className="mt-4 pt-3 w-full border-t flex flex-col items-center text-center gap-1" style={{ borderColor: currentThemeObj.border }}>
                  {currentStickerObj.symbol && (
                    <div className="text-base select-none leading-none mb-0.5">
                      {currentStickerObj.symbol}
                    </div>
                  )}

                  <div className="font-mono font-black text-xs tracking-widest leading-tight">
                    {titleText || 'POCKETBOOTH'}
                  </div>

                  {subText && (
                    <div className="text-[9px] tracking-wider uppercase font-medium leading-tight opacity-75">
                      {subText}
                    </div>
                  )}

                  {showDate && (
                    <div className="font-mono text-[8px] tracking-widest mt-1 opacity-60">
                      {todayFormatted} • STUDIO
                    </div>
                  )}

                  {/* Decorative Barcode / Serial Line */}
                  <div className="mt-2 text-[7px] font-mono tracking-[0.25em] opacity-40 select-none">
                    |||| || ||| || ||||| | ||
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Helper Text */}
            <p className="text-[11px] text-zinc-400 text-center max-w-xs font-mono">
              💡 Tip: Klik salah satu frame foto untuk memilih slot yang ingin kamu foto ulang.
            </p>
          </div>
        </div>
      </main>

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Hidden Canvas for Processing Image Captures */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// Individual Photo Slot Component
function PhotoSlot({ index, photo, filterClass, theme, isActive, onSelect, onReset, aspect }) {
  return (
    <div
      onClick={onSelect}
      className={`relative w-full ${aspect} rounded-lg overflow-hidden cursor-pointer transition group border`}
      style={{
        backgroundColor: theme.accent,
        borderColor: isActive ? '#000000' : theme.border,
      }}
    >
      {photo ? (
        <>
          <img
            src={photo}
            alt={`Slot ${index + 1}`}
            className={`w-full h-full object-cover ${filterClass}`}
          />
          {/* Retake Button overlay */}
          <button
            onClick={onReset}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow hover:bg-black"
            title="Reset slot ini"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-zinc-600 transition">
          <Camera className="w-5 h-5 opacity-40" />
          <span className="font-mono text-[9px] font-bold tracking-wider opacity-60">
            {isActive ? 'READY' : `SLOT ${index + 1}`}
          </span>
        </div>
      )}

      {/* Active Indicator Ring */}
      {isActive && (
        <div className="absolute inset-0 border-2 border-zinc-900 pointer-events-none rounded-lg" />
      )}
    </div>
  );
}
