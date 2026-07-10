import React from "react";
import { motion } from "motion/react";
import { 
  Shield, 
  Search, 
  Terminal, 
  Layers, 
  Cpu, 
  FileLock2, 
  Database, 
  Fingerprint, 
  Globe2, 
  CheckCircle2, 
  ArrowRight,
  BookOpen
} from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const stats = [
    { value: "10+", label: "OSINT Recon Modules", icon: Layers, color: "text-sky-400" },
    { value: "< 2.5s", label: "Realtime Target Lookup", icon: Cpu, color: "text-purple-400" },
    { value: "100%", label: "GDPR & Educational Safe", icon: Shield, color: "text-emerald-400" },
    { value: "Gemini", label: "AI Security Advisory", icon: Fingerprint, color: "text-pink-400" }
  ];

  const features = [
    {
      title: "Email Harvesting & Pattern Discovery",
      description: "Extract public-facing corporate structures and guess department structures with calculated OSINT scores.",
      icon: Search,
      color: "border-sky-500/20 text-sky-400 bg-sky-500/5"
    },
    {
      title: "Active Deliverability Verification",
      description: "Validate syntaxes, run simulated MX/SMTP lookups, and screen disposable accounts safely.",
      icon: CheckCircle2,
      color: "border-purple-500/20 text-purple-400 bg-purple-500/5"
    },
    {
      title: "Domain Reconnaissance & Tech-Stack",
      description: "Detect server operating systems, hosting servers, CDN nodes, and current SSL configurations.",
      icon: Globe2,
      color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
    },
    {
      title: "DNS & WHOIS Timeline Analysis",
      description: "Query full record blocks (A, AAAA, MX, TXT, CAA) and build standard registrar registries.",
      icon: Terminal,
      color: "border-pink-500/20 text-pink-400 bg-pink-500/5"
    },
    {
      title: "Active Security Headers Score",
      description: "Evaluate active defense headers (CSP, HSTS, CORS) and calculate unified risk multipliers.",
      icon: FileLock2,
      color: "border-amber-500/20 text-amber-400 bg-amber-500/5"
    },
    {
      title: "Exposed Breach Database Checks",
      description: "Cross-check targets against historic data exposures with timeline trends and advisories.",
      icon: Database,
      color: "border-cyan-500/20 text-cyan-400 bg-cyan-500/5"
    }
  ];

  return (
    <div className="min-h-screen text-slate-300 cyber-grid relative overflow-hidden bg-[#05050a] flex flex-col justify-between">
      
      {/* Background Neon Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[150px] pointer-events-none" />

      {/* Landing Header */}
      <header className="border-b border-slate-800 bg-[#0a0a16]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-lg font-display">AEGIS<span className="text-blue-400">RECON</span></span>
              <span className="text-[9px] block font-mono text-slate-500 uppercase tracking-widest">v1.4.2 [Educational OSINT]</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onStart} 
              className="px-4 py-2 text-xs font-mono border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
            >
              Access Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex-grow flex flex-col justify-center relative z-10 w-full">
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-6">
            <Terminal className="w-3.5 h-3.5" /> Threat Footprinting Framework
          </div>
          
          <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tight text-white mb-6 leading-[1.15]">
            Professional Email Harvesting & <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              OSINT Reconnaissance Platform
            </span>
          </h1>
          
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-10">
            A secure, automated platform for mapping digital footprints, auditing domain posture, detecting data exposures, and preparing intelligence reports for defensive cybersecurity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium bg-blue-600 hover:bg-blue-500 text-white font-display hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              Start Automated Scan <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-slate-300 bg-slate-900/60 border border-slate-800 hover:border-slate-700 font-display flex items-center justify-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4 text-slate-400" /> Explore Features
            </a>
          </div>
        </motion.div>

        {/* Statistics Widgets */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              className="bg-[#0a0a16] p-5 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-slate-700 transition-all group"
            >
              <div className={`p-3 rounded-xl bg-slate-900 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-2xl font-bold font-display text-white">{stat.value}</span>
                <span className="text-xs text-slate-500 block">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Grid Section */}
        <div id="features" className="mb-16 scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-3">Enterprise Reconnaissance Capabilities</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Equipped with deep passive and active diagnostic scans to inspect and secure exposed nodes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                className="bg-[#0a0a16] border border-slate-800 p-6 rounded-2xl relative overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group"
                whileHover={{ y: -4 }}
              >
                <div>
                  <div className={`inline-flex p-3 rounded-xl border mb-5 ${feat.color}`}>
                    <feat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-slate-100 text-lg mb-2 group-hover:text-blue-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {feat.description}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-850 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>MODULE_0{i + 1}</span>
                  <span className="text-blue-400/40">READY</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="max-w-4xl mx-auto bg-[#0a0a16] border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex gap-4">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-amber-400 text-sm mb-1 uppercase tracking-wider">Educational Compliance Directive</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                AegisRecon is built exclusively for research, authorization-driven penetration testing, and classroom instruction. Conducting intrusive lookups, spoofing mail servers, or scanning un-owned infrastructures without legitimate operational clearance is strictly prohibited by computer protection statutes. Run scanner cycles responsibly.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0a0a16]/60 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>&copy; {new Date().getFullYear()} AegisRecon OSINT Platform</span>
            <span>&bull;</span>
            <span className="text-blue-400">Authorized Educational Context</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="cursor-pointer hover:text-slate-300">Terms of Use</span>
            <span className="cursor-pointer hover:text-slate-300">Privacy Policy</span>
            <span className="cursor-pointer hover:text-slate-300">Security Disclosure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
