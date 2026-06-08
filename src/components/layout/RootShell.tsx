'use client';
import { useState } from 'react';
import Navbar from './Navbar';
import FAB from './FAB';
import QuickAddModal from '@/components/upload/QuickAddModal';

export default function RootShell({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Navbar />
      {children}
      <FAB onClick={() => setModalOpen(true)} />
      <QuickAddModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
