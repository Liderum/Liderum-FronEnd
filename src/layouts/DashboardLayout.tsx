import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { motion } from "framer-motion";
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="md:pl-64 flex flex-col flex-1">
          <Header />
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Outlet />
                </motion.div>
              </div>
            </div>
          </main>
        </div>

        {/* Sidebar Mobile */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="text-white"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <Sidebar />
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="fixed bottom-4 right-4 md:hidden z-40">
        <Button
          onClick={() => setSidebarOpen(true)}
          size="lg"
          className="rounded-full shadow-lg"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
} 