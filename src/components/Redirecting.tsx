import React from 'react';
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2, BarChart3 } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-border p-2">
              <BarChart3 className="h-4 w-4 text-primary" />
            </span>
            <span className="text-base font-semibold tracking-tight">Liderum</span>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-4 pt-16 sm:px-6"
      >
        <Card className="w-full max-w-md border-border shadow-none">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.12 }}
              className="mb-6"
            >
              <div className="relative mx-auto w-fit">
                <CheckCircle2 className="h-14 w-14 text-primary" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <Loader2 className="h-14 w-14 text-primary/30" />
                </motion.div>
              </div>
            </motion.div>

            <h2 className="mb-2 text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="mb-6 text-muted-foreground">{message}</p>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Redirecionando para</span>
                <span className="font-medium text-primary capitalize">{destination}</span>
                <ArrowRight className="h-4 w-4" />
              </div>

              {timeLeft > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-semibold text-primary">{timeLeft}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">segundos</span>
                </div>
              )}

              <div className="h-1 overflow-hidden rounded-full bg-primary/20">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: countdown, ease: "linear" }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
