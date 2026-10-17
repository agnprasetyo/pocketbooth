import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import Photobooth from './components/Photobooth';

export default function App() {
  return (
    <>
      <Photobooth />
      <Analytics />
    </>
  );
}
