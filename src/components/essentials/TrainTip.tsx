"use client";

import { Info } from "lucide-react";

export const TrainTip = () => {
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-accent text-white">
          <Info className="w-5 h-5" />
        </div>
        <h4 className="text-lg font-bold text-accent">Pro-Tip: Understanding Japanese Train Types</h4>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 rounded-lg bg-white/50 border border-white/20">
          <h5 className="font-bold text-primary mb-1">Local (Kakueki-teisha)</h5>
          <p className="text-sm text-foreground/80">Stops at every single station. Best for short trips or reaching residential areas.</p>
        </div>
        
        <div className="p-4 rounded-lg bg-white/50 border border-white/20">
          <h5 className="font-bold text-primary mb-1">Express (Kyuko)</h5>
          <p className="text-sm text-foreground/80">Skips smaller stations. Faster for commuting between major hubs. Usually no extra fee.</p>
        </div>
        
        <div className="p-4 rounded-lg bg-white/50 border border-white/20">
          <h5 className="font-bold text-primary mb-1">Ltd. Express (Tokkyu)</h5>
          <p className="text-sm text-foreground/80">Fastest and most comfortable. Requires an extra seat fee. Often reserved seating only.</p>
        </div>
      </div>
      
      <p className="mt-4 text-xs text-muted-foreground italic">
        * Always check the destination sign on the platform, as some trains split or change types at certain stations.
      </p>
    </div>
  );
};
