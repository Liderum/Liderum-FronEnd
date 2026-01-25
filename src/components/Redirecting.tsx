import React from 'react';
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RedirectingProps {
  message?: string;
  destination?: string;
  countdown?: number;
  title?: string;
}

export function Redirecting({ 
  message = "Redirecionando...", 
  destination = "dashboard",
  countdown = 3,
  title = "Login realizado com sucesso!"
}: RedirectingProps) {
  const [timeLeft, setTimeLeft] = React.useState(countdown);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-4"
    >
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <Loader2 className="h-16 w-16 text-green-300 mx-auto" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {title}
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span>Redirecionando para o</span>
              <span className="font-medium text-primary capitalize">{destination}</span>
              <ArrowRight className="h-4 w-4" />
            </div>

            {timeLeft > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center space-x-2"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{timeLeft}</span>
                </div>
                <span className="text-sm text-gray-500">segundos</span>
              </motion.div>
            )}

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: countdown }}
              className="h-1 bg-primary/20 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ delay: 0.5, duration: countdown }}
                className="h-full bg-primary rounded-full"
              />
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
