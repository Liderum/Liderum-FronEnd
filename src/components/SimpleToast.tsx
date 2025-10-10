import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, ArrowRight, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimpleToastProps {
  isVisible: boolean;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  countdown?: number;
  onCancel?: () => void;
  onGoNow?: () => void;
  showActions?: boolean;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return CheckCircle;
    case 'info': return Info;
    case 'warning': return AlertTriangle;
    case 'error': return AlertCircle;
    default: return CheckCircle;
  }
};

const getColors = (type: string) => {
  switch (type) {
    case 'success': return {
      icon: 'text-green-500',
      border: 'border-green-200',
      bg: 'bg-green-50'
    };
    case 'info': return {
      icon: 'text-blue-500',
      border: 'border-blue-200',
      bg: 'bg-blue-50'
    };
    case 'warning': return {
      icon: 'text-yellow-500',
      border: 'border-yellow-200',
      bg: 'bg-yellow-50'
    };
    case 'error': return {
      icon: 'text-red-500',
      border: 'border-red-200',
      bg: 'bg-red-50'
    };
    default: return {
      icon: 'text-green-500',
      border: 'border-green-200',
      bg: 'bg-green-50'
    };
  }
};

export function SimpleToast({ 
  isVisible, 
  message, 
  type = 'success',
  countdown = 0,
  onCancel, 
  onGoNow,
  showActions = true
}: SimpleToastProps) {
  const Icon = getIcon(type);
  const colors = getColors(type);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-6 right-6 z-50 max-w-sm"
        >
          <div className={`bg-white border ${colors.border} rounded-lg shadow-lg p-4 backdrop-blur-sm`}>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Icon className={`h-5 w-5 ${colors.icon}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {message}
                </p>
                {countdown > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Redirecionando em {countdown}s...
                  </p>
                )}
              </div>
              
              {showActions && (
                <div className="flex-shrink-0 flex space-x-1">
                  {onGoNow && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onGoNow}
                      className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Ir agora"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                  {onCancel && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onCancel}
                      className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                      title="Cancelar"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* Progress bar simples */}
            {countdown > 0 && (
              <div className="mt-3 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: countdown, ease: "linear" }}
                  className={`h-full ${colors.icon.replace('text-', 'bg-')}`}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
