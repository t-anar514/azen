"use client";

import { Sparkles } from "lucide-react";

interface ProTipProps {
  text: string;
}

export const ProTip = ({ text }: ProTipProps) => {
  return (
    <div className="bg-primary/5 border-2 border-dashed border-primary/30 p-8 rounded-3xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="w-24 h-24 text-primary" />
      </div>
      
      <div className="relative flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
        <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shrink-0">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-primary font-black uppercase text-sm tracking-widest">
            The Japanese Way (Pro-Tip)
          </h3>
          <p className="text-lg font-medium text-foreground leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};
