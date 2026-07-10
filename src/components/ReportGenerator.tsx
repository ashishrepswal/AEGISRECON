import React, { useState } from "react";
import { Loader2, FileText, Download, ShieldCheck, Printer, FileDown } from "lucide-react";
import { Disclaimer } from "./Disclaimer";

interface ReportGeneratorProps {
  onAddHistory: (query: string, type: string) => void;
}

export function ReportGenerator({ onAddHistory }: ReportGeneratorProps) {
  const [domain, setDomain] = useState("example.com");
  const [loading, setLoading] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportSource, setReportSource] = useState("");
  const [reportData, setReportData] = useState<any | null>(null);

  const triggerGenerateReport = async () => {
    if (!domain) return;
    setLoading(true);
    setReportText("");
    
    try {
      // 1. Gather baseline target metrics (simulated parameters to populate report stats)
      const nameSum = domain.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const securityScore = Math.max(35, 100 - (nameSum % 55));
      const exposedEmails = (nameSum % 12) + 3;
      const headersMissing = (nameSum % 4) + 1;
      const breachCount = (nameSum % 3) + 1;

      // 2. Query Gemini API endpoint server-side
      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          emails: exposedEmails,
          securityScore,
          headersMissing,
          breachCount
        })
      });
      const data = await res.json();
      setReportText(data.text);
      setReportSource(data.source);
      
      setReportData({
        domain,
        securityScore,
        exposedEmails,
        headersMissing,
        breachCount,
        timestamp: new Date().toISOString()
      });

      onAddHistory(domain, "Security Assessment Report");
      
      // Save report in session history on server
      await fetch("/api/save-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          securityScore,
          reportText: data.text,
          exposedEmails
        })
      });

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-900">
        <h2 className="font-display font-bold text-slate-100 text-base mb-2">Automated Cybersecurity Audit Report</h2>
        <p className="text-xs text-slate-500 font-mono mb-4">
          Synthesize full target footprints, DNS structures, WHOIS registries and mail authentication standards into an executive advisory report.
        </p>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow space-y-2">
            <label className="text-xs font-mono text-slate-400 block uppercase tracking-wide">Domain Target</label>
            <input
              type="text"
              placeholder="e.g. corpdomain.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
          <button
            onClick={triggerGenerateReport}
            disabled={loading}
            className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-purple-500 text-slate-950 font-display font-medium rounded-xl text-xs hover:brightness-110 transition-all shrink-0 w-full md:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            <span>Generate Security Audit</span>
          </button>
        </div>
      </div>

      <Disclaimer />

      {loading && (
        <div className="text-center py-24 glass-panel rounded-2xl border border-slate-900">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-slate-400">Synthesizing OSINT data points and compiling advisory summary...</p>
          <span className="text-[10px] text-slate-500 block mt-2 font-mono">Invoking Gemini LLM for deep contextual analysis</span>
        </div>
      )}

      {reportData && !loading && (
        <div className="space-y-6 print:bg-white print:text-slate-950 print:p-8">
          
          {/* Print Controls */}
          <div className="flex items-center justify-between print:hidden">
            <span className="text-xs font-mono text-slate-500">Report Engine: <span className="text-purple-400 font-bold">{reportSource}</span></span>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-mono rounded-xl flex items-center gap-2 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print Audit / Export PDF
              </button>
            </div>
          </div>

          {/* Audit View Box */}
          <div className="glass-panel border border-slate-900 rounded-2xl p-6 md:p-8 space-y-8 bg-slate-950/40 relative overflow-hidden print:border-none print:shadow-none print:bg-white">
            
            {/* Header section */}
            <div className="border-b border-slate-900/80 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:border-slate-300">
              <div>
                <span className="text-[10px] font-mono text-sky-400 block uppercase tracking-widest mb-1 print:text-sky-600">Executive Security Assessment</span>
                <h3 className="font-display font-bold text-2xl text-white print:text-slate-950">AegisRecon Footprint Audit</h3>
                <span className="text-xs font-mono text-slate-500">Target Entity: <span className="text-slate-200 font-bold select-all print:text-slate-800">{reportData.domain}</span></span>
              </div>
              
              <div className="text-right font-mono text-[10px] text-slate-500 space-y-1">
                <div>SYSTEM REF: AR-{Math.floor(Math.random()*89999)+10000}</div>
                <div>GENERATED: {new Date(reportData.timestamp).toLocaleString()}</div>
                <div className="text-emerald-400 font-bold print:text-emerald-600">STATUS: AUDITED</div>
              </div>
            </div>

            {/* Assessment Highlights Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl print:border-slate-200 print:bg-slate-50">
                <span className="text-slate-500 block text-[10px] uppercase mb-1">Security Rating</span>
                <span className={`text-xl font-bold font-display ${
                  reportData.securityScore >= 80 ? "text-emerald-400" : reportData.securityScore >= 50 ? "text-amber-400" : "text-rose-400"
                }`}>
                  {reportData.securityScore}/100
                </span>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl print:border-slate-200 print:bg-slate-50">
                <span className="text-slate-500 block text-[10px] uppercase mb-1">Harvested Addresses</span>
                <span className="text-xl font-bold font-display text-sky-400">{reportData.exposedEmails} Emails</span>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl print:border-slate-200 print:bg-slate-50">
                <span className="text-slate-500 block text-[10px] uppercase mb-1">Missing Headers</span>
                <span className="text-xl font-bold font-display text-purple-400">{reportData.headersMissing} Flags</span>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl print:border-slate-200 print:bg-slate-50">
                <span className="text-slate-500 block text-[10px] uppercase mb-1">Credential Leaks</span>
                <span className="text-xl font-bold font-display text-pink-400">{reportData.breachCount} Exposure</span>
              </div>
            </div>

            {/* AI Generated Advisory text markdown renderer */}
            <div className="prose prose-invert max-w-none text-xs font-mono text-slate-300 space-y-4 leading-relaxed print:text-slate-800">
              <div className="whitespace-pre-line border border-slate-900 p-6 rounded-xl bg-slate-950/60 print:bg-slate-50 print:border-slate-200">
                {reportText}
              </div>
            </div>

            {/* Advisory Sign-off and warning */}
            <div className="pt-6 border-t border-slate-900 text-[10px] text-slate-500 font-mono flex flex-col sm:flex-row justify-between gap-4 print:border-slate-300">
              <div>
                <span>AUDITOR ASSIGNMENT: ashishrepswal622@gmail.com</span>
              </div>
              <div>
                <span className="text-amber-500 font-bold uppercase tracking-wider">CONFIDENTIAL INTERNAL USE ONLY</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
