import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Search, 
  Terminal, 
  Layers, 
  Settings, 
  CheckCircle, 
  Database, 
  LayoutDashboard, 
  Globe, 
  FileText, 
  BookMarked, 
  History, 
  Wifi, 
  Server,
  Activity, 
  Menu, 
  X,
  FileLock2,
  Mail,
  Flame,
  ShieldCheck,
  Power
} from "lucide-react";
import { SearchHistoryItem, SearchHistoryItem as BookmarkItem } from "../types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeModule: string;
  setActiveModule: (module: string) => void;
  history: SearchHistoryItem[];
  bookmarks: BookmarkItem[];
  onRemoveBookmark: (id: string) => void;
  systemStatus: string;
  onLogout: () => void;
}

export function DashboardLayout({ 
  children, 
  activeModule, 
  setActiveModule, 
  history, 
  bookmarks, 
  onRemoveBookmark,
  systemStatus,
  onLogout
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Sidebar modules
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "harvest", label: "Email Harvesting", icon: Search },
    { id: "verify", label: "Email Verification", icon: CheckCircle },
    { id: "recon", label: "Domain Recon", icon: Globe },
    { id: "dns", label: "DNS Lookup", icon: Terminal },
    { id: "whois", label: "WHOIS Lookup", icon: Layers },
    { id: "subdomains", label: "Subdomains", icon: Server },
    { id: "headers", label: "Security Headers", icon: FileLock2 },
    { id: "spf", label: "SPF / DKIM / DMARC", icon: ShieldCheck },
    { id: "breaches", label: "Email Breach Check", icon: Flame },
    { id: "reports", label: "Report Generator", icon: FileText },
    { id: "admin", label: "Admin Panel", icon: Activity },
  ];

  return (
    <div className="min-h-screen text-slate-300 bg-[#05050a] font-sans cyber-grid flex overflow-hidden">
      
      {/* Sidebar for Desktop */}
      <aside className={`bg-[#0a0a16] border-r border-slate-800 shrink-0 transition-all duration-300 relative z-30 flex flex-col justify-between ${sidebarOpen ? "w-64" : "w-16"}`}>
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Logo Section */}
          <div className="h-16 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white tracking-tight text-base font-display">AEGIS<span className="text-blue-400">RECON</span></span>
                  <span className="text-[9px] block font-mono text-slate-500 uppercase tracking-widest">Security Console</span>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] mx-auto">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
            
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-900"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Group Header */}
          {sidebarOpen && (
            <div className="text-[10px] uppercase font-bold text-slate-500 mt-6 mb-2 px-6 tracking-widest">
              Main Console
            </div>
          )}

          {/* Navigation Items */}
          <nav className="px-3 py-1 space-y-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              
              // Render heading headers in full sidebar mode
              const showGroupHeader = sidebarOpen && idx === 1; // Show OSINT Modules header before secondary items
              
              return (
                <React.Fragment key={item.id}>
                  {showGroupHeader && (
                    <div className="text-[10px] uppercase font-bold text-slate-500 mt-5 mb-2 px-3 tracking-widest">
                      OSINT Modules
                    </div>
                  )}
                  <button
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                      isActive 
                        ? "bg-blue-600/10 text-blue-400 border-r-2 border-blue-500" 
                        : "border-r-2 border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                    title={item.label}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Footer Section of Sidebar */}
        <div className="border-t border-slate-800 p-3 space-y-1 shrink-0 bg-[#0a0a16]">
          <button
            onClick={() => setShowBookmarks(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            title="Bookmarks"
          >
            <BookMarked className="w-4 h-4 text-slate-500" />
            {sidebarOpen && <span>Bookmarks ({bookmarks.length})</span>}
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            title="Search History"
          >
            <History className="w-4 h-4 text-slate-500" />
            {sidebarOpen && <span>Search History</span>}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-all"
            title="Exit Workspace"
          >
            <Power className="w-4 h-4 text-rose-500/80" />
            {sidebarOpen && <span>Exit Workspace</span>}
          </button>

          {/* User profile card */}
          {sidebarOpen && (
            <div className="mt-4 bg-slate-900/50 border border-slate-800/80 rounded-lg p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
                AR
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-white truncate">Ashish Repswal</p>
                <p className="text-[10px] text-slate-500 truncate">Security Researcher</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-grow flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-[#0a0a16]/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 relative z-20">
          <div className="flex items-center gap-4">
            <h1 className="font-display font-semibold text-white text-sm tracking-wide">
              Module: <span className="text-blue-400">{navItems.find(n => n.id === activeModule)?.label || "Workspace"}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* System Status badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-500/5 border border-blue-500/20 rounded-full text-[10px] font-mono text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>OSINT Server: {systemStatus}</span>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-800 pl-4 text-xs">
              <span className="text-slate-500 hidden md:inline">Analyst:</span>
              <span className="font-mono text-slate-300 bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
                ashishrepswal622@gmail.com
              </span>
            </div>
          </div>
        </header>

        {/* Workspace Views Scroll container */}
        <main className="flex-grow overflow-y-auto p-6 relative z-10">
          {children}
        </main>
      </div>

      {/* Bookmarks Modal Side Drawer */}
      <AnimatePresence>
        {showBookmarks && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookmarks(false)}
              className="absolute inset-0 bg-slate-950"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-slate-950 border-l border-slate-900 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-sky-400" />
                  <span className="font-display font-bold text-sm uppercase tracking-wide">Saved Bookmarks</span>
                </div>
                <button 
                  onClick={() => setShowBookmarks(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {bookmarks.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <BookMarked className="w-8 h-8 mx-auto text-slate-700 mb-3" />
                    <p className="text-xs">No targets bookmarked yet.</p>
                    <p className="text-[10px] text-slate-600 mt-1">Click the bookmark icon during scanning to save shortcuts.</p>
                  </div>
                ) : (
                  bookmarks.map((b) => (
                    <div key={b.id} className="p-4 bg-slate-900/50 border border-slate-900 rounded-xl relative group">
                      <button 
                        onClick={() => onRemoveBookmark(b.id)}
                        className="absolute top-3 right-3 text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-slate-950 transition-colors"
                        title="Remove Bookmark"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-1">{b.type}</div>
                      <div className="font-mono text-sm text-slate-200 font-semibold mb-2">{b.query}</div>
                      <div className="text-[10px] font-mono text-slate-500">{new Date(b.timestamp).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search History Modal Side Drawer */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-slate-950"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-slate-950 border-l border-slate-900 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" />
                  <span className="font-display font-bold text-sm uppercase tracking-wide">Audit Search Logs</span>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <History className="w-8 h-8 mx-auto text-slate-700 mb-3 animate-pulse" />
                    <p className="text-xs font-mono">No target searches logged yet.</p>
                  </div>
                ) : (
                  history.map((h, i) => (
                    <div key={h.id || i} className="p-3.5 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-sky-400 block mb-0.5">{h.type}</span>
                        <span className="font-mono text-xs text-slate-200 block truncate max-w-xs">{h.query}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">{new Date(h.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
