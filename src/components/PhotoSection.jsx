import React, { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { savePhoto, getPhoto, deletePhoto, clearAllPhotos } from '../db/photoDb';
import './PhotoSection.css';

const SLOTS = [0, 1, 2];

const LeafStem1 = () => (
  <svg className="svg-leaf-stem" viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
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
  <svg className="svg-leaf-stem-2" viewBox="0 0 50 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M5,35 Q25,25 45,5" fill="none" stroke="#5d7255" strokeWidth="2" strokeLinecap="round" />
    <path d="M45,5 Q40,15 35,12 C30,9 38,0 45,5 Z" fill="#8aa380" />
    <path d="M30,17 Q23,24 20,20 C17,16 26,10 30,17 Z" fill="#8aa380" />
    <path d="M18,25 Q11,32 8,28 C5,24 14,18 18,25 Z" fill="#8aa380" />
    <path d="M36,12 Q42,22 45,18 C48,14 39,8 36,12 Z" fill="#8aa380" />
    <path d="M24,21 Q30,31 33,27 C36,23 27,17 24,21 Z" fill="#8aa380" />
  </svg>
);

const SparkleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="#ffffff" opacity="0.8" />
  </svg>
);

const HeartHandDrawn = ({ color = "#5d7255", width = 20, height = 20 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20 C9 18 3 13 3 8.5 C3 5.5 5.5 3 8.5 3 C10.5 3 11.5 4 12 5 C12.5 4 13.5 3 15.5 3 C18.5 3 21 5.5 21 8.5 C21 13 15 18 12 20 Z" 
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function PhotoSection() {
  const [photos, setPhotos] = useState({ 0: null, 1: null, 2: null });
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState('');
  
  // Camera live stream slot
  const [activeCameraSlot, setActiveCameraSlot] = useState(null); // null or 0, 1, 2

  const templateRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const inputRefs = [useRef(null), useRef(null), useRef(null)];

  // Load saved photos from IndexedDB on mount
  useEffect(() => {
    async function loadPhotos() {
      const loaded = { 0: null, 1: null, 2: null };
      for (const slot of SLOTS) {
        const data = await getPhoto(slot);
        if (data) loaded[slot] = data;
      }
      setPhotos(loaded);
    }
    loadPhotos();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleFileChange = useCallback(async (slot, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      await savePhoto(slot, dataUrl);
      setPhotos(prev => ({ ...prev, [slot]: dataUrl }));
      showToast('Foto terpasang! 🌸');
      setActiveCameraSlot(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const handleResetSlot = async (slot, e) => {
    e.stopPropagation(); // Avoid triggering frame click
    stopCamera();
    await deletePhoto(slot);
    setPhotos(prev => ({ ...prev, [slot]: null }));
    if (activeCameraSlot === slot) {
      setActiveCameraSlot(null);
    }
    showToast(`Foto ${slot + 1} diulang! ✨`);
  };

  const handleUlang = async () => {
    stopCamera();
    await clearAllPhotos();
    setPhotos({ 0: null, 1: null, 2: null });
    setActiveCameraSlot(null);
    showToast('Semua foto direset! ✨');
  };

  const handleDownload = async () => {
    if (!templateRef.current) return;
    setDownloading(true);
    showToast('Sedang membuat gambar...');

    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const canvas = await html2canvas(templateRef.current, {
        backgroundColor: '#9fb8ad',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = 'my-foto.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Download sukses! 📥');
    } catch (err) {
      console.error(err);
      showToast('Gagal download 😢');
    }
    setDownloading(false);
  };

  // Close camera & stop tracks
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Start live webcam inside slot frame
  const startCameraForSlot = async (slot) => {
    stopCamera();
    setActiveCameraSlot(slot);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err) {
      console.error(err);
      showToast('Gagal buka kamera 😢');
      setActiveCameraSlot(null);
    }
  };

  // Capture video stream frame directly in-place
  const capturePhotoForSlot = async (slot, e) => {
    e.stopPropagation();
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    await savePhoto(slot, dataUrl);
    setPhotos(prev => ({ ...prev, [slot]: dataUrl }));
    
    stopCamera();
    setActiveCameraSlot(null);
    showToast('Foto tersimpan! 📸');
  };

  // Cancel inline camera shooting
  const cancelCamera = (e) => {
    e.stopPropagation();
    stopCamera();
    setActiveCameraSlot(null);
  };

  return (
    <section className="photo-section">
      {toast && <div className="photo-toast">{toast}</div>}

      <div className="photo-section__layout">
        {/* 1. Target Template to capture */}
        <div className="photo-template" ref={templateRef}>
          <div className="bg-blob bg-blob--top" />
          <div className="bg-blob bg-blob--bottom" />
          <div className="bg-dots bg-dots--left" />
          <div className="bg-dots bg-dots--right" />
          
          <SparkleIcon className="bg-sparkle bg-sparkle--1" />
          <SparkleIcon className="bg-sparkle bg-sparkle--2" />
          <SparkleIcon className="bg-sparkle bg-sparkle--3" />
          
          <div className="bg-heart bg-heart--1">
            <HeartHandDrawn color="#ffffff" width={24} height={24} />
          </div>

          {/* FRAME 1 */}
          <div className="frame-container frame-container--1">
            <div className="washi-tape washi-tape--grid" />
            <div 
              className={`frame-card ${activeCameraSlot === 0 ? 'camera-active' : ''}`} 
              onClick={() => activeCameraSlot !== 0 && startCameraForSlot(0)}
            >
              <div className="frame-card__inner">
                {activeCameraSlot === 0 ? (
                  <video ref={videoRef} autoPlay playsInline muted className="frame-camera-video" />
                ) : photos[0] ? (
                  <div
                    className="frame-card__photo-bg"
                    style={{ backgroundImage: `url(${photos[0]})` }}
                  />
                ) : (
                  <div className="frame-card__placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#a4b59e">
                      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"/>
                      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                    </svg>
                    <span>CLICK TO CAMERA</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="ornament-leaf ornament-leaf--1">
              <LeafStem1 />
            </div>
            <div className="ornament-brush ornament-brush--1" />
            
            <div className="note-sticker note-sticker--1">
              <div className="washi-tape-small washi-tape-small--beige" />
              <div className="note-sticker__content">
                <HeartHandDrawn color="#d29685" width={14} height={14} />
              </div>
            </div>

            {/* Controls aligned next to Frame 1 */}
            <div className="frame-controls-wrapper" data-html2canvas-ignore="true">
              {activeCameraSlot === 0 ? (
                <div className="slot-active-controls">
                  <button className="ctrl-action-btn ctrl-action-btn--snap" onClick={(e) => capturePhotoForSlot(0, e)} title="Ambil Foto 📸">📸</button>
                  <button className="ctrl-action-btn ctrl-action-btn--upload" onClick={() => inputRefs[0].current?.click()} title="Upload 📁">📁</button>
                  <button className="ctrl-action-btn ctrl-action-btn--cancel" onClick={cancelCamera} title="Batal ❌">❌</button>
                </div>
              ) : photos[0] ? (
                <button className="frame-retry-btn" onClick={(e) => handleResetSlot(0, e)} title="Ulang Foto Ini 🔄">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M2.5 2v6h6M21.5 22v-6h-6M22 11.5A10 10 0 0 0 3.2 7.2L2.5 8M2 12.5a10 10 0 0 0 18.8 4.3l.7-.8"/>
                  </svg>
                </button>
              ) : null}
            </div>
          </div>

          {/* FRAME 2 */}
          <div className="frame-container frame-container--2">
            <div className="washi-tape washi-tape--striped" />
            <div 
              className={`frame-card ${activeCameraSlot === 1 ? 'camera-active' : ''}`} 
              onClick={() => activeCameraSlot !== 1 && startCameraForSlot(1)}
            >
              <div className="frame-card__inner">
                {activeCameraSlot === 1 ? (
                  <video ref={videoRef} autoPlay playsInline muted className="frame-camera-video" />
                ) : photos[1] ? (
                  <div
                    className="frame-card__photo-bg"
                    style={{ backgroundImage: `url(${photos[1]})` }}
                  />
                ) : (
                  <div className="frame-card__placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#a4b59e">
                      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"/>
                      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                    </svg>
                    <span>CLICK TO CAMERA</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="ornament-leaf ornament-leaf--2">
              <LeafStem2 />
            </div>
            <div className="note-sticker note-sticker--2">
              <div className="washi-tape-small washi-tape-small--green" />
              <div className="note-sticker__content">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#788e6e" strokeWidth="2.5">
                  <path d="M12 2v20M17 5H7M15 10H9M13 15H11" />
                </svg>
              </div>
            </div>
            <div className="ornament-brush ornament-brush--2" />

            {/* Controls aligned next to Frame 2 */}
            <div className="frame-controls-wrapper" data-html2canvas-ignore="true">
              {activeCameraSlot === 1 ? (
                <div className="slot-active-controls">
                  <button className="ctrl-action-btn ctrl-action-btn--snap" onClick={(e) => capturePhotoForSlot(1, e)} title="Ambil Foto 📸">📸</button>
                  <button className="ctrl-action-btn ctrl-action-btn--upload" onClick={() => inputRefs[1].current?.click()} title="Upload 📁">📁</button>
                  <button className="ctrl-action-btn ctrl-action-btn--cancel" onClick={cancelCamera} title="Batal ❌">❌</button>
                </div>
              ) : photos[1] ? (
                <button className="frame-retry-btn" onClick={(e) => handleResetSlot(1, e)} title="Ulang Foto Ini 🔄">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M2.5 2v6h6M21.5 22v-6h-6M22 11.5A10 10 0 0 0 3.2 7.2L2.5 8M2 12.5a10 10 0 0 0 18.8 4.3l.7-.8"/>
                  </svg>
                </button>
              ) : null}
            </div>
          </div>

          {/* FRAME 3 */}
          <div className="frame-container frame-container--3">
            <div className="washi-tape washi-tape--polka" />
            <div 
              className={`frame-card ${activeCameraSlot === 2 ? 'camera-active' : ''}`} 
              onClick={() => activeCameraSlot !== 2 && startCameraForSlot(2)}
            >
              <div className="frame-inner-heart">
                <HeartHandDrawn color="#788e6e" width={14} height={14} />
              </div>
              <div className="frame-card__inner">
                {activeCameraSlot === 2 ? (
                  <video ref={videoRef} autoPlay playsInline muted className="frame-camera-video" />
                ) : photos[2] ? (
                  <div
                    className="frame-card__photo-bg"
                    style={{ backgroundImage: `url(${photos[2]})` }}
                  />
                ) : (
                  <div className="frame-card__placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#a4b59e">
                      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"/>
                      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                    </svg>
                    <span>CLICK TO CAMERA</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="ornament-leaf ornament-leaf--3">
              <LeafStem1 />
            </div>
            <div className="ornament-brush ornament-brush--3" />
            
            <div className="note-sticker note-sticker--3">
              <div className="washi-tape-small washi-tape-small--beige" />
              <div className="note-sticker__content">
                <HeartHandDrawn color="#d29685" width={14} height={14} />
              </div>
            </div>

            {/* Controls aligned next to Frame 3 */}
            <div className="frame-controls-wrapper" data-html2canvas-ignore="true">
              {activeCameraSlot === 2 ? (
                <div className="slot-active-controls">
                  <button className="ctrl-action-btn ctrl-action-btn--snap" onClick={(e) => capturePhotoForSlot(2, e)} title="Ambil Foto 📸">📸</button>
                  <button className="ctrl-action-btn ctrl-action-btn--upload" onClick={() => inputRefs[2].current?.click()} title="Upload 📁">📁</button>
                  <button className="ctrl-action-btn ctrl-action-btn--cancel" onClick={cancelCamera} title="Batal ❌">❌</button>
                </div>
              ) : photos[2] ? (
                <button className="frame-retry-btn" onClick={(e) => handleResetSlot(2, e)} title="Ulang Foto Ini 🔄">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M2.5 2v6h6M21.5 22v-6h-6M22 11.5A10 10 0 0 0 3.2 7.2L2.5 8M2 12.5a10 10 0 0 0 18.8 4.3l.7-.8"/>
                  </svg>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="photo-actions">
          <button className="btn-ulang" onClick={handleUlang}>
            Ulang Semua
          </button>
          <button className="btn-download" onClick={handleDownload} disabled={downloading}>
            {downloading ? '...' : 'Download'}
          </button>
        </div>
      </div>

      {/* Hidden canvas for capturing video frames */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Hidden file inputs */}
      <input ref={inputRefs[0]} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(0, e)} />
      <input ref={inputRefs[1]} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(1, e)} />
      <input ref={inputRefs[2]} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(2, e)} />
    </section>
  );
}
