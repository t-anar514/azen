"use client";

import { Sparkles } from "lucide-react";

interface ProTipProps {
  text: string;
}

export const ProTip = ({ text }: ProTipProps) => {
  return (
    <div className="bg-[#227c70]/5 border-2 border-dashed border-[#227c70]/30 p-8 rounded-3xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="w-24 h-24 text-[#227c70]" />
      </div>
      
      <div className="relative flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
        <div className="p-3 bg-[#227c70] rounded-2xl text-white shadow-lg shrink-0">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-[#227c70] font-black uppercase text-sm tracking-widest">
            The Japanese Way (Pro-Tip)
          </h3>
          <p className="text-lg font-medium text-[#1c315e] leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};
