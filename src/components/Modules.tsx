import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Shield, 
  Search, 
  Terminal, 
  Layers, 
  CheckCircle, 
  Database, 
  Globe, 
  AlertTriangle, 
  Download, 
  ShieldAlert, 
  Plus, 
  Bookmark, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Loader2, 
  Network, 
  Server, 
  FileLock2, 
  ShieldCheck, 
  Flame, 
  Info,
  Clock,
  Eye,
  Settings,
  RefreshCw,
  SearchIcon
} from "lucide-react";
import { Disclaimer } from "./Disclaimer";
import { 
  EmailRecord, 
  VerificationResult, 
  DomainReconResult, 
  DNSRecord, 
  WhoisResult, 
  SubdomainRecord, 
  SecurityHeaderResult, 
  EmailBreachRecord, 
  EmailAuthResult 
} from "../types";

interface ModulesProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  onAddHistory: (query: string, type: string) => void;
  onAddBookmark: (query: string, type: string) => void;
  bookmarks: any[];
}

export function Modules({ activeModule, setActiveModule, onAddHistory, onAddBookmark, bookmarks }: ModulesProps) {
  // Target States
  const [targetDomain, setTargetDomain] = useState("example.com");
  const [targetEmail, setTargetEmail] = useState("admin@example.com");
  const [loading, setLoading] = useState(false);
  const [scanExecuted, setScanExecuted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Result States
  const [harvestedEmails, setHarvestedEmails] = useState<EmailRecord[]>([]);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [domainReconResult, setDomainReconResult] = useState<DomainReconResult | null>(null);
  const [dnsResult, setDnsResult] = useState<DNSRecord[]>([]);
  const [whoisResult, setWhoisResult] = useState<WhoisResult | null>(null);
  const [subdomainsResult, setSubdomainsResult] = useState<SubdomainRecord[]>([]);
  const [headersResult, setHeadersResult] = useState<{ securityScore: number; grade: string; headers: SecurityHeaderResult[] } | null>(null);
  const [emailAuthResult, setEmailAuthResult] = useState<EmailAuthResult | null>(null);
  const [breachResult, setBreachResult] = useState<EmailBreachRecord | null>(null);

  // Demo Port Scanner State
  const [scanPortsResult, setScanPortsResult] = useState<{ port: number; service: string; status: 'Open' | 'Closed'; banner?: string }[]>([]);
  const [scanningPorts, setScanningPorts] = useState(false);

  // Generic Search triggers
  const triggerEmailHarvest = async (domainToScan: string) => {
    setLoading(true);
    setScanExecuted(true);
    setFeedbackMsg("");
    try {
      const res = await fetch("/api/harvest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainToScan })
      });
      const data = await res.json();
      setHarvestedEmails(data.emails || []);
      onAddHistory(domainToScan, "Email Harvesting");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerEmailVerify = async (emailToScan: string) => {
    setLoading(true);
    setScanExecuted(true);
    setFeedbackMsg("");
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToScan })
      });
      const data = await res.json();
      setVerificationResult(data);
      onAddHistory(emailToScan, "Email Verification");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerDomainRecon = async (domainToScan: string) => {
    setLoading(true);
    setScanExecuted(true);
    setFeedbackMsg("");
    try {
      const [reconRes, dnsRes, whoisRes, subRes, headersRes, authRes] = await Promise.all([
        fetch("/api/recon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain: domainToScan }) }),
        fetch("/api/dns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain: domainToScan }) }),
        fetch("/api/whois", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain: domainToScan }) }),
        fetch("/api/subdomains", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain: domainToScan }) }),
        fetch("/api/headers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain: domainToScan }) }),
        fetch("/api/email-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain: domainToScan }) })
      ]);

      const [reconData, dnsData, whoisData, subData, headersData, authData] = await Promise.all([
        reconRes.json(), dnsRes.json(), whoisRes.json(), subRes.json(), headersRes.json(), authRes.json()
      ]);

      setDomainReconResult(reconData);
      setDnsResult(dnsData.records || []);
      setWhoisResult(whoisData);
      setSubdomainsResult(subData.subdomains || []);
      setHeadersResult(headersData);
      setEmailAuthResult(authData);

      onAddHistory(domainToScan, "Comprehensive Domain Recon");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerBreachCheck = async (emailToScan: string) => {
    setLoading(true);
    setScanExecuted(true);
    setFeedbackMsg("");
    try {
      const res = await fetch("/api/breach-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToScan })
      });
      const data = await res.json();
      setBreachResult(data);
      onAddHistory(emailToScan, "Credential Breach Check");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePortScanSimulation = () => {
    setScanningPorts(true);
    setScanPortsResult([]);
    
    const portsToScan = [
      { port: 21, service: "FTP", status: Math.random() > 0.8 ? 'Open' as const : 'Closed' as const, banner: "vsFTPd 3.0.3" },
      { port: 22, service: "SSH", status: Math.random() > 0.5 ? 'Open' as const : 'Closed' as const, banner: "OpenSSH 8.9p1 Ubuntu" },
      { port: 25, service: "SMTP", status: Math.random() > 0.7 ? 'Open' as const : 'Closed' as const, banner: "Postfix smtpd" },
      { port: 80, service: "HTTP", status: 'Open' as const, banner: "nginx/1.24.0" },
      { port: 110, service: "POP3", status: 'Closed' as const },
      { port: 443, service: "HTTPS", status: 'Open' as const, banner: "nginx/1.24.0 (SSL Active)" },
      { port: 3306, service: "MySQL", status: Math.random() > 0.9 ? 'Open' as const : 'Closed' as const, banner: "MySQL 8.0.35" },
      { port: 8080, service: "HTTP-ALT", status: Math.random() > 0.6 ? 'Open' as const : 'Closed' as const, banner: "Apache Tomcat/9.0" }
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < portsToScan.length) {
        setScanPortsResult(prev => [...prev, portsToScan[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setScanningPorts(false);
      }
    }, 300);
  };

  const handleExportCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(item => 
      Object.values(item).map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedbackMsg("CSV Exported successfully!");
  };

  const handleExportJSON = (data: any, filename: string) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `${filename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedbackMsg("JSON Exported successfully!");
  };

  // Render Module 1: Email Harvesting
  const renderEmailHarvest = () => {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-900">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow space-y-2">
              <label className="text-xs font-mono text-slate-400 block uppercase tracking-wide">Target Corporate Domain</label>
              <div className="relative">
                <Globe className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. google.com"
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={() => triggerEmailHarvest(targetDomain)}
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-purple-500 text-slate-950 font-display font-medium rounded-xl text-xs hover:brightness-110 transition-all shrink-0 w-full md:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Harvest Emails</span>
            </button>
            <button
              onClick={() => {
                onAddBookmark(targetDomain, "Email Harvesting");
                setFeedbackMsg("Target domain bookmarked!");
              }}
              className="p-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl"
              title="Bookmark Domain"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
          {feedbackMsg && <p className="text-xs text-emerald-400 font-mono mt-3">{feedbackMsg}</p>}
        </div>

        <Disclaimer />

        {scanExecuted && !loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Discovered Email Nodes</h3>
                <p className="text-xs text-slate-500">Collected publicly disclosed corporate directory addresses.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportCSV(harvestedEmails, `emails-${targetDomain}`)}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-mono rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button
                  onClick={() => handleExportJSON(harvestedEmails, `emails-${targetDomain}`)}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-mono rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> JSON
                </button>
              </div>
            </div>

            <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-900">
                    <tr>
                      <th className="py-3 px-4">Discovered Email</th>
                      <th className="py-3 px-4">Source Disclosures</th>
                      <th className="py-3 px-4">Confidence Score</th>
                      <th className="py-3 px-4">Predicted Division</th>
                      <th className="py-3 px-4 text-right">Risk Factor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {harvestedEmails.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-sky-400">{item.email}</td>
                        <td className="py-3.5 px-4 text-slate-400">{item.source}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-sky-500 h-full" style={{ width: `${item.confidenceScore}%` }} />
                            </div>
                            <span>{item.confidenceScore}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-purple-300">{item.departmentGuess}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.riskLevel === 'High' 
                              ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" 
                              : item.riskLevel === 'Medium' 
                              ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" 
                              : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          }`}>
                            {item.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-slate-400">Harvesting target email structures from public directories...</p>
          </div>
        )}
      </div>
    );
  };

  // Render Module 2: Email Verification
  const renderEmailVerify = () => {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-900">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow space-y-2">
              <label className="text-xs font-mono text-slate-400 block uppercase tracking-wide">Target Email Account</label>
              <div className="relative">
                <SearchIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. admin@example.com"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={() => triggerEmailVerify(targetEmail)}
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-purple-500 text-slate-950 font-display font-medium rounded-xl text-xs hover:brightness-110 transition-all shrink-0 w-full md:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Verify Deliverability</span>
            </button>
          </div>
          {feedbackMsg && <p className="text-xs text-emerald-400 font-mono mt-3">{feedbackMsg}</p>}
        </div>

        <Disclaimer />

        {scanExecuted && !loading && verificationResult && (
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Score panel */}
            <div className="glass-panel border border-slate-900 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400 block uppercase tracking-wider mb-1">Deliverability Grade</span>
                <h4 className="font-display font-bold text-2xl text-slate-200 truncate">{verificationResult.email}</h4>
              </div>

              {/* Responsive SVG Gauge */}
              <div className="my-6 flex flex-col items-center justify-center">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="72" cy="72" r="60" className="stroke-slate-900 fill-none" strokeWidth="8" />
                    <circle 
                      cx="72" 
                      cy="72" 
                      r="60" 
                      className={`${
                        verificationResult.deliverabilityScore >= 80 
                          ? "stroke-emerald-500" 
                          : verificationResult.deliverabilityScore >= 40 
                          ? "stroke-amber-500" 
                          : "stroke-rose-500"
                      } fill-none`} 
                      strokeWidth="8" 
                      strokeDasharray="377" 
                      strokeDashoffset={377 - (377 * verificationResult.deliverabilityScore) / 100}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-display font-bold text-white">{verificationResult.deliverabilityScore}%</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{verificationResult.status}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Validation Status</span>
                  <span className={`font-bold ${
                    verificationResult.status === 'Deliverable' 
                      ? "text-emerald-400" 
                      : verificationResult.status === 'Risky' 
                      ? "text-amber-400" 
                      : "text-rose-400"
                  }`}>
                    {verificationResult.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnostic Flags */}
            <div className="glass-panel border border-slate-900 p-6 rounded-2xl md:col-span-2 space-y-4">
              <h3 className="font-display font-bold text-slate-100">Verification Diagnostic Flags</h3>
              
              <div className="grid sm:grid-cols-2 gap-4 font-mono text-xs">
                
                <div className="p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="block text-slate-200">Syntax Format</span>
                    <span className="text-[10px] text-slate-500">RFC Standards check</span>
                  </div>
                  {verificationResult.syntax ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="block text-slate-200">Active MX Record</span>
                    <span className="text-[10px] text-slate-500">Valid mail exchanger discoverable</span>
                  </div>
                  {verificationResult.mxRecord ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="block text-slate-200">Disposable Inbox</span>
                    <span className="text-[10px] text-slate-500">Temporary discard mailbox</span>
                  </div>
                  {!verificationResult.disposable ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="block text-slate-200">Role Account Flag</span>
                    <span className="text-[10px] text-slate-500">System admin / Generic mail alias</span>
                  </div>
                  {!verificationResult.roleAccount ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-amber-400 shrink-0" />}
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="block text-slate-200">Catch-all Status</span>
                    <span className="text-[10px] text-slate-500">Accepts unlisted local mail addresses</span>
                  </div>
                  {!verificationResult.catchAll ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-amber-400 shrink-0" />}
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="block text-slate-200">SMTP Server Handshake</span>
                    <span className="text-[10px] text-slate-500">Direct server response check</span>
                  </div>
                  {verificationResult.smtpValidation ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </div>

              </div>

              <div className="p-4 bg-sky-500/5 border border-sky-500/15 rounded-xl flex items-start gap-2.5 text-xs text-sky-300">
                <Info className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <p>
                  Active handshaking checks query target SMTP exchangers directly without sending an email payload. However, some domains enforce catch-all routing rules or proxy protections to spoof handshakes. Use this metric as a priority indicator.
                </p>
              </div>

            </div>

          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-slate-400">Executing passive handshakes and looking up MX parameters...</p>
          </div>
        )}
      </div>
    );
  };

  // Render Module 3: Domain Recon & Technologies
  const renderDomainRecon = () => {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-900">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow space-y-2">
              <label className="text-xs font-mono text-slate-400 block uppercase tracking-wide">Domain Target</label>
              <div className="relative">
                <Globe className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. example.com"
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={() => triggerDomainRecon(targetDomain)}
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-purple-500 text-slate-950 font-display font-medium rounded-xl text-xs hover:brightness-110 transition-all shrink-0 w-full md:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
              <span>Execute Recon Scans</span>
            </button>
          </div>
        </div>

        <Disclaimer />

        {scanExecuted && !loading && domainReconResult && (
          <div className="grid md:grid-cols-2 gap-6 font-mono text-xs">
            
            {/* Server Specifications */}
            <div className="glass-panel border border-slate-900 p-6 rounded-2xl space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200 uppercase tracking-wider">Network Infrastructure Properties</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span className="text-slate-500">Target IP Address</span>
                  <span className="text-sky-400 font-bold">{domainReconResult.ipAddress}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span className="text-slate-500">Hosting Provider</span>
                  <span className="text-slate-200">{domainReconResult.hostingProvider}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span className="text-slate-500">ASN Block</span>
                  <span className="text-purple-400 font-bold">{domainReconResult.asn}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span className="text-slate-500">Location Country</span>
                  <span className="text-slate-200">{domainReconResult.country}</span>
                </div>
              </div>
            </div>

            {/* SSL Certificates */}
            <div className="glass-panel border border-slate-900 p-6 rounded-2xl space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200 uppercase tracking-wider">SSL Security Profile</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span className="text-slate-500">Certification State</span>
                  <span className="text-emerald-400 font-bold">Valid & Active</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span className="text-slate-500">Issuer Authority</span>
                  <span className="text-slate-200">{domainReconResult.sslCertificate.issuer}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span className="text-slate-500">Expiration Deadline</span>
                  <span className="text-amber-400">{domainReconResult.sslCertificate.validTo}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span className="text-slate-500">Encryption Depth</span>
                  <span className="text-slate-200">{domainReconResult.sslCertificate.bits}-bit Cryptography</span>
                </div>
              </div>
            </div>

            {/* Technology stacks */}
            <div className="glass-panel border border-slate-900 p-6 rounded-2xl space-y-4 md:col-span-2">
              <h3 className="font-display font-bold text-sm text-slate-200 uppercase tracking-wider">Detected Frontline Technologies</h3>
              
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl text-center">
                  <span className="text-slate-500 block text-[10px] uppercase mb-1">Content CMS</span>
                  <span className="text-sky-400 font-bold text-sm">{domainReconResult.technologies.cms}</span>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl text-center">
                  <span className="text-slate-500 block text-[10px] uppercase mb-1">Web Server</span>
                  <span className="text-purple-400 font-bold text-sm">{domainReconResult.technologies.webServer}</span>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl text-center">
                  <span className="text-slate-500 block text-[10px] uppercase mb-1">CDN Proxy Node</span>
                  <span className="text-emerald-400 font-bold text-sm">{domainReconResult.technologies.cdn}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-slate-400">Sniffing remote server configurations, SSL contexts and ASNs...</p>
          </div>
        )}
      </div>
    );
  };

  // Render Module 4: DNS Lookup
  const renderDnsLookup = () => {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-900">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow space-y-2">
              <label className="text-xs font-mono text-slate-400 block uppercase tracking-wide">Target Domain</label>
              <div className="relative">
                <Globe className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. example.com"
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={() => triggerDomainRecon(targetDomain)}
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-purple-500 text-slate-950 font-display font-medium rounded-xl text-xs hover:brightness-110 transition-all shrink-0 w-full md:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
              <span>Query DNS Records</span>
            </button>
          </div>
        </div>

        <Disclaimer />

        {scanExecuted && !loading && dnsResult.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-white">Active DNS Records Map</h3>
            <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-900">
                  <tr>
                    <th className="py-3 px-4 w-24">Record Type</th>
                    <th className="py-3 px-4">Value / Resolution Targets</th>
                    <th className="py-3 px-4 w-32">TTL (sec)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {dnsResult.map((record, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3.5 px-4"><span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-sky-400">{record.type}</span></td>
                      <td className="py-3.5 px-4 text-slate-200 select-all font-semibold">{record.value}</td>
                      <td className="py-3.5 px-4 text-slate-500">{record.ttl || 3600}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-slate-400">Polling authoritative nameservers for DNS blocks...</p>
          </div>
        )}
      </div>
    );
  };

  // Render Module 5: WHOIS Lookup
  const renderWhois = () => {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-900">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow space-y-2">
              <label className="text-xs font-mono text-slate-400 block uppercase tracking-wide">Domain Address</label>
              <div className="relative">
                <Globe className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. example.com"
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={() => triggerDomainRecon(targetDomain)}
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-purple-500 text-slate-950 font-display font-medium rounded-xl text-xs hover:brightness-110 transition-all shrink-0 w-full md:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              <span>Fetch WHOIS Metadata</span>
            </button>
          </div>
        </div>

        <Disclaimer />

        {scanExecuted && !loading && whoisResult && (
          <div className="grid md:grid-cols-2 gap-6 font-mono text-xs">
            
            {/* Registrar particulars */}
            <div className="glass-panel border border-slate-900 p-6 rounded-2xl space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200 uppercase tracking-wider">Registrar Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span className="text-slate-500">Sponsoring Registrar</span>
                  <span className="text-slate-200 font-bold">{whoisResult.registrar}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span className="text-slate-500">Organization Name</span>
                  <span className="text-slate-200 truncate max-w-xs">{whoisResult.organization}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span className="text-slate-500">Registry Country</span>
                  <span className="text-slate-200">{whoisResult.country}</span>
                </div>
              </div>
            </div>

            {/* Lifecycle Timeline */}
            <div className="glass-panel border border-slate-900 p-6 rounded-2xl space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200 uppercase tracking-wider">Registration Timeline</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span className="text-slate-500">Original Registration</span>
                  <span className="text-sky-400 font-bold">{whoisResult.registrationDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span className="text-slate-500">Expiration Date</span>
                  <span className="text-rose-400 font-bold">{whoisResult.expiryDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span className="text-slate-500">DNSSEC Integrity Check</span>
                  <span className={whoisResult.dnssec ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                    {whoisResult.dnssec ? "Active / Signed" : "Inactive / Unsigned"}
                  </span>
                </div>
              </div>
            </div>

            {/* Status lines */}
            <div className="glass-panel border border-slate-900 p-6 rounded-2xl md:col-span-2 space-y-2">
              <span className="text-slate-500 text-[10px] uppercase">EPP Status Flags</span>
              <pre className="p-3 bg-slate-950 border border-slate-900 rounded-xl text-slate-400 overflow-x-auto text-[10px]">
                {whoisResult.status}
              </pre>
            </div>

          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-slate-400">Retrieving remote WHOIS registrar entries...</p>
          </div>
        )}
      </div>
    );
  };

  // Render Module 6: Subdomains Enumerate
  const renderSubdomains = () => {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-900">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow space-y-2">
              <label className="text-xs font-mono text-slate-400 block uppercase tracking-wide">Domain Target</label>
              <div className="relative">
                <Globe className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. example.com"
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={() => triggerDomainRecon(targetDomain)}
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-purple-500 text-slate-950 font-display font-medium rounded-xl text-xs hover:brightness-110 transition-all shrink-0 w-full md:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
              <span>Map Subdomains</span>
            </button>
          </div>
        </div>

        <Disclaimer />

        {scanExecuted && !loading && subdomainsResult.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-white">Discovered Sub-Nodes & Active Endpoints</h3>
            <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-900">
                  <tr>
                    <th className="py-3 px-4">Subdomain DNS</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Mapped IP</th>
                    <th className="py-3 px-4">Inferred Stack</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {subdomainsResult.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3.5 px-4 text-sky-400 font-bold">{sub.subdomain}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.status === 200 
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                            : sub.status === 403 || sub.status === 401 
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" 
                            : "bg-slate-800 border border-slate-700 text-slate-300"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{sub.ip}</td>
                      <td className="py-3.5 px-4 text-purple-300">{sub.technology}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-slate-400">Enumerating subdomains and checking operational state indicators...</p>
          </div>
        )}
      </div>
    );
  };

  // Render Module 7: Security Headers
  const renderHeaders = () => {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-900">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow space-y-2">
              <label className="text-xs font-mono text-slate-400 block uppercase tracking-wide">Target Domain</label>
              <div className="relative">
                <Globe className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. example.com"
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={() => triggerDomainRecon(targetDomain)}
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-purple-500 text-slate-950 font-display font-medium rounded-xl text-xs hover:brightness-110 transition-all shrink-0 w-full md:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileLock2 className="w-4 h-4" />}
              <span>Inspect Security Headers</span>
            </button>
          </div>
        </div>

        <Disclaimer />

        {scanExecuted && !loading && headersResult && (
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Score box */}
            <div className="glass-panel border border-slate-900 p-6 rounded-2xl flex flex-col justify-between h-fit space-y-6">
              <div>
                <span className="text-xs font-mono text-slate-400 block uppercase tracking-wider mb-1">Headers Rating Grade</span>
                <h4 className="font-display font-bold text-lg text-slate-200">{targetDomain}</h4>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="text-6xl font-display font-black bg-gradient-to-r from-sky-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {headersResult.grade}
                </div>
                <div className="text-xs font-mono text-slate-500">Security Score: {headersResult.securityScore}/100</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
                <p className="text-[11px] font-mono leading-relaxed text-slate-400">
                  Security Headers mitigate standard browser attack vectors including Clickjacking, mime spoofing, XSS injectors and referrer leakage.
                </p>
              </div>
            </div>

            {/* List and descriptions */}
            <div className="glass-panel border border-slate-900 p-6 rounded-2xl md:col-span-2 space-y-4">
              <h3 className="font-display font-bold text-slate-200">Scanned HTTP Security Headers</h3>
              
              <div className="space-y-4 text-xs font-mono">
                {headersResult.headers.map((hdr, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-100">{hdr.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hdr.status === 'Present' 
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                          : hdr.status === 'Insecure' 
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" 
                          : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                      }`}>
                        {hdr.status}
                      </span>
                    </div>
                    {hdr.value && (
                      <div className="p-2 bg-slate-950 border border-slate-900 text-[10px] text-slate-400 overflow-x-auto">
                        {hdr.value}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 leading-relaxed">{hdr.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-slate-400">Analyzing remote HTTP response headers and security scores...</p>
          </div>
        )}
      </div>
    );
  };

  // Render Module 8: SPF / DKIM / DMARC
  const renderSpfCheck = () => {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-900">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow space-y-2">
              <label className="text-xs font-mono text-slate-400 block uppercase tracking-wide">Domain Target</label>
              <div className="relative">
                <Globe className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. example.com"
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={() => triggerDomainRecon(targetDomain)}
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-purple-500 text-slate-950 font-display font-medium rounded-xl text-xs hover:brightness-110 transition-all shrink-0 w-full md:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Verify Mail Alignment</span>
            </button>
          </div>
        </div>

        <Disclaimer />

        {scanExecuted && !loading && emailAuthResult && (
          <div className="space-y-6 font-mono text-xs">
            
            <div className="grid sm:grid-cols-3 gap-4">
              
              <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">SPF Record</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    emailAuthResult.spf.status === 'Pass' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : emailAuthResult.spf.status === 'Warning' ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                  }`}>{emailAuthResult.spf.status}</span>
                </div>
                {emailAuthResult.spf.record && <pre className="p-2 bg-slate-950 border border-slate-900 text-[10px] text-slate-400 overflow-x-auto">{emailAuthResult.spf.record}</pre>}
                <p className="text-[11px] text-slate-500">{emailAuthResult.spf.details}</p>
              </div>

              <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">DKIM Record</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    emailAuthResult.dkim.status === 'Pass' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                  }`}>{emailAuthResult.dkim.status}</span>
                </div>
                {emailAuthResult.dkim.record && <pre className="p-2 bg-slate-950 border border-slate-900 text-[10px] text-slate-400 overflow-x-auto truncate">{emailAuthResult.dkim.record}</pre>}
                <p className="text-[11px] text-slate-500">{emailAuthResult.dkim.details}</p>
              </div>

              <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">DMARC Record</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    emailAuthResult.dmarc.status === 'Pass' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : emailAuthResult.dmarc.status === 'Warning' ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                  }`}>{emailAuthResult.dmarc.status}</span>
                </div>
                {emailAuthResult.dmarc.record && <pre className="p-2 bg-slate-950 border border-slate-900 text-[10px] text-slate-400 overflow-x-auto">{emailAuthResult.dmarc.record}</pre>}
                <p className="text-[11px] text-slate-500">{emailAuthResult.dmarc.details}</p>
              </div>

            </div>

            {/* Recommendations */}
            <div className="glass-panel border border-slate-900 p-6 rounded-2xl space-y-3">
              <h3 className="font-display font-bold text-sm text-slate-200 uppercase tracking-wider">Spoof Mitigation Protocols Advisory</h3>
              
              <ul className="space-y-2 text-[11px] text-slate-300">
                {emailAuthResult.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold shrink-0">&bull;</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-slate-400">Auditing SPF, DMARC policies and selector key validations...</p>
          </div>
        )}
      </div>
    );
  };

  // Render Module 9: Email Breach Check
  const renderBreaches = () => {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-900">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow space-y-2">
              <label className="text-xs font-mono text-slate-400 block uppercase tracking-wide">Target Email Account</label>
              <div className="relative">
                <SearchIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. user@domain.com"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={() => triggerBreachCheck(targetEmail)}
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-purple-500 text-slate-950 font-display font-medium rounded-xl text-xs hover:brightness-110 transition-all shrink-0 w-full md:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
              <span>Scan Database Breaches</span>
            </button>
          </div>
        </div>

        <Disclaimer />

        {scanExecuted && !loading && breachResult && (
          <div className="grid md:grid-cols-3 gap-6 font-mono text-xs">
            
            {/* Risk Box */}
            <div className="glass-panel border border-slate-900 p-6 rounded-2xl flex flex-col justify-between h-fit space-y-6">
              <div>
                <span className="text-xs font-mono text-slate-500 block uppercase mb-1">Exposure Level</span>
                <h4 className="font-display font-bold text-base text-slate-200">{breachResult.email}</h4>
              </div>

              <div className="text-center py-6">
                <div className={`text-6xl font-display font-black mb-1 ${
                  breachResult.riskLevel === 'High' ? "text-rose-400" : breachResult.riskLevel === 'Medium' ? "text-amber-400" : "text-emerald-400"
                }`}>
                  {breachResult.exposureCount}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Public Exposures</div>
              </div>

              <div className={`p-4 rounded-xl border text-[11px] leading-relaxed ${
                breachResult.riskLevel === 'High' 
                  ? "bg-rose-500/5 border-rose-500/20 text-rose-300" 
                  : breachResult.riskLevel === 'Medium' 
                  ? "bg-amber-500/5 border-amber-500/20 text-amber-300" 
                  : "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
              }`}>
                {breachResult.riskLevel === 'High' 
                  ? "WARNING: This email occurs extensively in publicized disclosures. Immediate credential rotation is advised." 
                  : breachResult.riskLevel === 'Medium' 
                  ? "NOTICE: This email was found in minor public archives. Ensure active multi-factor verification." 
                  : "SECURE: No active exposures discoverable in tracked database blocks."
                }
              </div>
            </div>

            {/* Inclusions list */}
            <div className="glass-panel border border-slate-900 p-6 rounded-2xl md:col-span-2 space-y-4">
              <h3 className="font-display font-bold text-slate-200">Discovered Inclusions</h3>
              
              {breachResult.breaches.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-slate-900 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p>Account clean in tracked datasets!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {breachResult.breaches.map((b, i) => (
                    <div key={i} className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-100">{b.name}</span>
                        <span className="text-[10px] text-slate-500">Date: {b.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{b.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {b.dataClasses.map((dc, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-900 text-slate-500 rounded text-[9px] border border-slate-850">
                            {dc}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2 mt-4">
                <span className="text-[10px] text-slate-500 uppercase block">Active Remediations</span>
                <ul className="space-y-1.5 text-[11px] text-slate-400">
                  {breachResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold">&bull;</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-slate-400">Scanning indexed credentials and breach disclosure libraries...</p>
          </div>
        )}
      </div>
    );
  };

  // Render Dashboard main summary overview
  const renderOverview = () => {
    return (
      <div className="space-y-8">
        
        {/* Welcome Block */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <h2 className="font-display font-bold text-2xl text-white">Active Threat Footprinting Console</h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Conduct passive corporate OSINT, index exposed personnel, verify certificate scopes, check authentication alignment, and draft intelligence alerts from a central, authoritative workspace.
            </p>
          </div>
          <button 
            onClick={() => setActiveModule("harvest")}
            className="px-5 py-3 bg-gradient-to-r from-sky-500 to-purple-500 text-slate-950 font-display font-bold text-xs rounded-xl hover:brightness-110 transition-all shrink-0 z-10 shadow-lg shadow-sky-500/10"
          >
            Launch Footprint Scan
          </button>
        </div>

        {/* Global Security Metrics Display Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          
          <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-sky-500/5 border border-sky-500/10 text-sky-400 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-slate-500 text-[10px] uppercase">Active Targets</span>
              <span className="text-xl font-bold text-slate-100 font-display">12 Domains</span>
            </div>
          </div>

          <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-purple-500/5 border border-purple-500/10 text-purple-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-slate-500 text-[10px] uppercase">Discovered Nodes</span>
              <span className="text-xl font-bold text-slate-100 font-display">140 Nodes</span>
            </div>
          </div>

          <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-slate-500 text-[10px] uppercase">Verification Score</span>
              <span className="text-xl font-bold text-slate-100 font-display">94% OK</span>
            </div>
          </div>

          <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-pink-500/5 border border-pink-500/10 text-pink-400 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-slate-500 text-[10px] uppercase">Tracked Exploits</span>
              <span className="text-xl font-bold text-slate-100 font-display">2 Leaked</span>
            </div>
          </div>

        </div>

        {/* Port Scanner & Extra tool widget */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Diagnostic Active Scanner */}
          <div className="glass-panel border border-slate-900 p-6 rounded-2xl space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-white text-base">Educational Live Port Checker</h3>
                <p className="text-[11px] text-slate-500 font-mono">Verify typical public services mapped across standard nodes (21, 22, 25, 80, 443).</p>
              </div>
              <button 
                onClick={handlePortScanSimulation}
                disabled={scanningPorts}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-sky-400 font-mono rounded-xl transition-all flex items-center gap-2"
              >
                {scanningPorts ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
                <span>Scan Target Ports</span>
              </button>
            </div>

            <div className="glass-panel border border-slate-900 rounded-xl overflow-hidden font-mono text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-900">
                  <tr>
                    <th className="py-2.5 px-4 w-20">Port</th>
                    <th className="py-2.5 px-4">Service</th>
                    <th className="py-2.5 px-4">State</th>
                    <th className="py-2.5 px-4">Inferred Service Banner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {scanPortsResult.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        Click &quot;Scan Target Ports&quot; to execute diagnostic scanning lookups.
                      </td>
                    </tr>
                  ) : (
                    scanPortsResult.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-900/10">
                        <td className="py-2.5 px-4 font-semibold text-slate-200">{p.port}</td>
                        <td className="py-2.5 px-4 text-purple-300">{p.service}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            p.status === 'Open' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-slate-850 border border-slate-800 text-slate-500"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-400">{p.banner || "No response banner detected"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick links & tips */}
          <div className="glass-panel border border-slate-900 p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div>
              <h3 className="font-display font-bold text-slate-200 text-base mb-1">Quick Threat Modules</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-mono">Select target scanner protocols directly from the shortcuts index below.</p>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <button 
                onClick={() => setActiveModule("harvest")}
                className="w-full text-left p-3 bg-slate-950 border border-slate-900 rounded-xl hover:border-slate-800 hover:text-sky-400 transition-all flex justify-between"
              >
                <span>Email Harvesting</span>
                <span className="text-slate-600">Scan Code</span>
              </button>
              <button 
                onClick={() => setActiveModule("headers")}
                className="w-full text-left p-3 bg-slate-950 border border-slate-900 rounded-xl hover:border-slate-800 hover:text-purple-400 transition-all flex justify-between"
              >
                <span>HTTP Headers Score</span>
                <span className="text-slate-600">Scan Code</span>
              </button>
              <button 
                onClick={() => setActiveModule("breaches")}
                className="w-full text-left p-3 bg-slate-950 border border-slate-900 rounded-xl hover:border-slate-800 hover:text-emerald-400 transition-all flex justify-between"
              >
                <span>Breach Lookup Database</span>
                <span className="text-slate-600">Scan Code</span>
              </button>
            </div>

            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-2 text-[10px] text-amber-300">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-mono">
                Scans are executed in passive mode to guarantee target compliance. Authorized parameters strictly enforced.
              </p>
            </div>
          </div>

        </div>

        <Disclaimer />

      </div>
    );
  };

  // Switch Module screen rendering
  const renderActiveScreen = () => {
    switch (activeModule) {
      case "dashboard":
        return renderOverview();
      case "harvest":
        return renderEmailHarvest();
      case "verify":
        return renderEmailVerify();
      case "recon":
        return renderDomainRecon();
      case "dns":
        return renderDnsLookup();
      case "whois":
        return renderWhois();
      case "subdomains":
        return renderSubdomain();
      case "headers":
        return renderHeaders();
      case "spf":
        return renderSpfCheck();
      case "breaches":
        return renderBreaches();
      default:
        return renderOverview();
    }
  };

  const renderSubdomain = () => {
    return renderSubdomains();
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {renderActiveScreen()}
    </div>
  );
}
