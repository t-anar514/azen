"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface QuickFixProps {
  summary: string;
}

export const QuickFix = ({ summary }: QuickFixProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#88a47c] p-6 rounded-2xl shadow-lg border-2 border-[#88a47c]/20 flex gap-4 items-start"
    >
      <div className="bg-white/20 p-2 rounded-lg">
        <Zap className="w-6 h-6 text-white" />
      </div>
      <div className="space-y-1">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Quick Fix</h3>
        <p className="text-white/90 text-lg leading-snug font-medium">
          {summary}
        </p>
      </div>
    </motion.div>
  );
};
