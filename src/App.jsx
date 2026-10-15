import React from 'react';
import PhotoSection from './components/PhotoSection';
import './App.css';

// Decorative leaf SVG
const Leaf = ({ className }) => (
  <svg className={className} viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 0 C10 30, 0 60, 10 90 C20 110, 40 120, 40 120 C40 120, 60 110, 70 90 C80 60, 70 30, 40 0Z" fill="currentColor" opacity="0.55"/>
    <line x1="40" y1="10" x2="40" y2="115" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
    <line x1="40" y1="40" x2="22" y2="60" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
    <line x1="40" y1="55" x2="58" y2="70" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
    <line x1="40" y1="70" x2="20" y2="85" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
  </svg>
);

// Decorative flower SVG
const Flower = ({ className }) => (
  <svg className={className} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    {[0,60,120,180,240,300].map((rot, i) => (
      <ellipse key={i} cx="30" cy="12" rx="8" ry="14" fill="currentColor" opacity="0.6"
        transform={`rotate(${rot} 30 30)`}/>
    ))}
    <circle cx="30" cy="30" r="9" fill="#f5d06a" opacity="0.85"/>
    <circle cx="30" cy="30" r="5" fill="#f0c040"/>
  </svg>
);

// Sparkle dots
const Sparkle = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" fill="currentColor"/>
  </svg>
);

// Section heading with decorative sparkles
function SectionHeading({ children }) {
  return (
    <div className="section-heading">
      <Sparkle className="heading-sparkle heading-sparkle--left" />
      <h2 className="section-heading__text">{children}</h2>
      <Sparkle className="heading-sparkle heading-sparkle--right" />
    </div>
  );
}

export default function App() {
  return (
    <div className="page-bg">
      {/* Background decorations */}
      <Leaf className="deco deco-leaf deco-leaf--tl" />
      <Leaf className="deco deco-leaf deco-leaf--br" />
      <Flower className="deco deco-flower deco-flower--tr" />
      <Flower className="deco deco-flower deco-flower--bl" />
      <div className="deco-blob deco-blob--1" />
      <div className="deco-blob deco-blob--2" />
      <div className="deco-blob deco-blob--3" />

      <main className="card">
        {/* ── Photo section ── */}
        <div className="section-block">
          <div className="camera-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#9bb89a">
              <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"/>
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
            </svg>
          </div>
          <SectionHeading>Cobain fotonya yuk</SectionHeading>
          <div className="section-divider">
            <span className="divider-dot" />
            <span className="divider-line" />
            <span className="divider-dot" />
          </div>
          <PhotoSection />
        </div>
      </main>
    </div>
  );
}
