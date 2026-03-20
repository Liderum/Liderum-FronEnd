import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { X, Menu } from "lucide-react";

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F4EF', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar Desktop */}
      <div style={{ display: 'none', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 30 }}
        className="md-sidebar">
        <Sidebar />
      </div>

      {/* Sidebar always visible on desktop via CSS */}
      <div className="hidden md:block" style={{ width: 210, flexShrink: 0, position: 'relative' }}>
        <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 210, zIndex: 30 }}>
          <Sidebar />
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, padding: '18px 20px', maxWidth: '100%' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50 }}
            className="md:hidden"
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,24,20,0.4)', backdropFilter: 'blur(2px)' }}
              onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'relative', width: 210, height: '100%' }}
            >
              <Sidebar />
              <button
                onClick={() => setMobileOpen(false)}
                style={{ position: 'absolute', top: 10, right: -36, background: 'rgba(26,24,20,0.7)', border: 'none', borderRadius: '0 6px 6px 0', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={15} color="#fff" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden"
        style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 40, width: 42, height: 42, borderRadius: '50%', background: 'var(--ink, #1A1814)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(26,24,20,0.25)' }}
      >
        <Menu size={17} color="#fff" />
      </button>
    </div>
  );
}
