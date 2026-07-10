import React from "react";
import { ShieldAlert } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-200/90 glass-panel">
      <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <span className="font-bold text-amber-400 block mb-0.5 uppercase tracking-wide text-xs">AUTHORIZED SECURITY TESTING USE ONLY</span>
        <p className="text-xs leading-relaxed text-slate-300">
          This platform is intended only for authorized security testing, defensive cybersecurity, research, and educational purposes. 
          Users must obtain explicit permission before assessing any third-party systems. 
          Unauthorized use or scanning may violate applicable local, federal, and international laws.
        </p>
      </div>
    </div>
  );
}
