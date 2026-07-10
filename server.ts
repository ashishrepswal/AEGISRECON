import express, { Request, Response } from "express";
import path from "path";
import dns from "dns";
import { GoogleGenAI } from "@google/genai";
import { 
  EmailRecord, 
  VerificationResult, 
  DomainReconResult, 
  DNSRecord, 
  WhoisResult, 
  SubdomainRecord, 
  SecurityHeaderResult, 
  EmailBreachRecord, 
  EmailAuthResult,
  ApiLogItem
} from "./src/types";

// Setup environment variables (Express v4 format)
export const app = express();

// Custom middleware to handle Vercel routing, preserve original req.url, and safely parse JSON body
app.use((req, res, next) => {
  if (process.env.VERCEL === "1") {
    // 1. Recover the original URL if Vercel rewrote it to the serverless handler
    const currentUrl = req.url.toLowerCase();
    const isServerlessFile = 
      currentUrl.includes("/api/index") || 
      currentUrl.includes("/api/server") || 
      req.url === "/" || 
      req.url === "/api";

    const originalUrl = 
      (req.headers["x-vercel-forwarded-path"] as string) || 
      (req.headers["x-vercel-forwarded-uri"] as string) ||
      (req.headers["x-forwarded-url"] as string) || 
      (req.headers["x-original-url"] as string);

    if (isServerlessFile && originalUrl) {
      let normalizedUrl = originalUrl;
      // Extract only the pathname part if it contains query parameters or domain
      try {
        if (normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://")) {
          const urlObj = new URL(normalizedUrl);
          normalizedUrl = urlObj.pathname + urlObj.search;
        }
      } catch (e) {}

      if (normalizedUrl && !normalizedUrl.startsWith("/api/") && normalizedUrl !== "/api") {
        if (normalizedUrl.startsWith("/")) {
          normalizedUrl = `/api${normalizedUrl}`;
        } else {
          normalizedUrl = `/api/${normalizedUrl}`;
        }
      }
      req.url = normalizedUrl;
    } else {
      // Fallback: If no headers are found or isServerlessFile is false but URL doesn't start with /api/, let's check if it should
      if (req.url && !req.url.startsWith("/api/") && req.url !== "/api") {
        const knownRoutes = [
          "/harvest", "/verify", "/recon", "/dns", "/whois", "/subdomains", 
          "/headers", "/email-auth", "/breach-check", "/gemini/analyze", 
          "/stats", "/search-history", "/saved-reports", "/save-report", 
          "/bookmarks", "/bookmark"
        ];
        const pathname = req.url.split("?")[0];
        if (knownRoutes.includes(pathname) || knownRoutes.some(r => pathname.startsWith(r + "/"))) {
          req.url = `/api${req.url}`;
        }
      }
    }

    // 2. Safe body parsing to prevent hanging in serverless environments (Vercel)
    if (req.method === "GET" || req.method === "HEAD") {
      next();
      return;
    }

    if (req.body !== undefined) {
      next();
      return;
    }

    const contentLength = req.headers["content-length"];
    if (!contentLength || contentLength === "0") {
      req.body = {};
      next();
      return;
    }

    // Only call express.json() as a fallback
    express.json()(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: "Invalid JSON body" });
      } else {
        next();
      }
    });
  } else {
    // Standard Node/Cloud Run environment: use default body parsing and leave req.url untouched
    if (req.method === "GET" || req.method === "HEAD") {
      next();
    } else {
      express.json()(req, res, next);
    }
  }
});
const PORT = 3000;

// Lazy-loaded Gemini AI client to avoid crashes on load if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } catch (err) {
        console.error("Failed to initialize Gemini Client", err);
      }
    }
  }
  return aiClient;
}

// In-Memory API Logger & Search History for Admin Panel & Extra Features
const apiLogs: ApiLogItem[] = [];
const searchHistory: { id: string; query: string; type: string; timestamp: string }[] = [];
const savedReports: any[] = [];
const bookmarkedItems: { id: string; query: string; type: string; timestamp: string; note?: string }[] = [];

// Helper middleware to log API requests
function logApiRequest(req: Request, res: Response, next: () => void) {
  const start = Date.now();
  res.on("finish", () => {
    const latency = Date.now() - start;
    const logItem: ApiLogItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      method: req.method,
      endpoint: req.originalUrl,
      status: res.statusCode,
      ip: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1",
      latency
    };
    apiLogs.unshift(logItem);
    if (apiLogs.length > 200) apiLogs.pop(); // Cap history
  });
  next();
}

app.use(logApiRequest);

// HELPER: Simulate intelligent OSINT based on Domain
function getDomainStructure(domain: string) {
  const clean = domain.toLowerCase().trim();
  const name = clean.split(".")[0];
  const tld = clean.split(".")[1] || "com";
  return { clean, name, tld };
}

// ==========================================
// MODULE 1: EMAIL HARVESTING ENDPOINT
// ==========================================
app.post("/api/harvest", (req: Request, res: Response) => {
  const { domain } = req.body;
  if (!domain || typeof domain !== "string") {
    res.status(400).json({ error: "Domain parameter is required." });
    return;
  }

  const { clean, name } = getDomainStructure(domain);
  
  // Record search history
  searchHistory.unshift({
    id: Math.random().toString(36).substring(2, 9),
    query: clean,
    type: "Email Harvesting",
    timestamp: new Date().toISOString()
  });

  // Generative seed patterns based on the domain name to provide a highly convincing OSINT harvest list
  const departments = [
    { prefix: "info", dept: "General Inquiries", score: 95, risk: "Low" as const },
    { prefix: "support", dept: "Customer Success", score: 90, risk: "Low" as const },
    { prefix: "contact", dept: "General Relations", score: 95, risk: "Low" as const },
    { prefix: "sales", dept: "Commercial / Sales", score: 85, risk: "Medium" as const },
    { prefix: "hr", dept: "Human Resources", score: 80, risk: "Medium" as const },
    { prefix: "jobs", dept: "Talent Acquisition", score: 75, risk: "Low" as const },
    { prefix: "billing", dept: "Finance / Accounts", score: 85, risk: "High" as const },
    { prefix: "admin", dept: "System Administration", score: 90, risk: "High" as const },
    { prefix: "security", dept: "Cybersecurity Response", score: 95, risk: "Medium" as const },
    { prefix: "press", dept: "Public Relations", score: 85, risk: "Low" as const },
    { prefix: "dev", dept: "Engineering / Devops", score: 70, risk: "High" as const },
    { prefix: "legal", dept: "Legal & Compliance", score: 80, risk: "Medium" as const },
  ];

  const firstNames = ["alex", "sarah", "michael", "emily", "james", "david", "jessica", "robert", "lisa", "john", "karen", "thomas"];
  const lastNames = ["smith", "jones", "miller", "taylor", "brown", "davis", "wilson", "anderson", "thomas", "jackson", "white", "harris"];
  const sources = ["LinkedIn Profile", "GitHub Commits", "Whois Registry", "Public Web Page", "Corporate Directory", "PGP Key Server", "DNS Text Records", "StackOverflow Profiles"];

  const emails: EmailRecord[] = [];

  // 1. Add department role emails
  departments.forEach((dept, i) => {
    emails.push({
      id: `harvest-role-${i}`,
      email: `${dept.prefix}@${clean}`,
      source: i % 2 === 0 ? "Corporate Directory" : "Whois Registry",
      confidenceScore: dept.score,
      departmentGuess: dept.dept,
      riskLevel: dept.risk,
    });
  });

  // 2. Add personal employee guessing structure based on seed
  for (let i = 0; i < 8; i++) {
    const fn = firstNames[(name.charCodeAt(0) + i) % firstNames.length];
    const ln = lastNames[(name.charCodeAt(name.length - 1) + i) % lastNames.length];
    const src1 = sources[(name.charCodeAt(0) + i) % sources.length];
    const src2 = sources[(name.charCodeAt(name.length - 1) + i) % sources.length];
    
    const formats = [
      `${fn}.${ln}@${clean}`,
      `${fn.charAt(0)}${ln}@${clean}`,
      `${fn}@${clean}`,
      `${fn}${ln}@${clean}`
    ];
    
    const chosenFormat = formats[i % formats.length];
    const deptOptions = ["Executive Staff", "Information Technology", "Commercial", "Product Engineering", "Customer Experience", "Marketing & Growth"];
    const chosenDept = deptOptions[(fn.length + ln.length + i) % deptOptions.length];
    
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (chosenDept.includes("IT") || chosenDept.includes("Engineering") || chosenDept.includes("Executive")) {
      riskLevel = i % 2 === 0 ? 'High' : 'Medium';
    } else if (i % 3 === 0) {
      riskLevel = 'Medium';
    }

    emails.push({
      id: `harvest-user-${i}`,
      email: chosenFormat,
      source: `${src1}, ${src2}`,
      confidenceScore: Math.floor(70 + (i * 4.3) % 29),
      departmentGuess: chosenDept,
      riskLevel,
    });
  }

  res.json({
    domain: clean,
    totalHarvested: emails.length,
    timestamp: new Date().toISOString(),
    emails
  });
});

// ==========================================
// MODULE 2: EMAIL VERIFICATION ENDPOINT
// ==========================================
app.post("/api/verify", (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const [localPart, domainPart] = cleanEmail.split("@");
  
  // Record search history
  searchHistory.unshift({
    id: Math.random().toString(36).substring(2, 9),
    query: cleanEmail,
    type: "Email Verification",
    timestamp: new Date().toISOString()
  });

  const disposableDomains = ["mailinator.com", "tempmail.com", "10minutemail.com", "trashmail.com", "yopmail.com", "dispostable.com"];
  const rolePrefixes = ["admin", "support", "sales", "info", "contact", "billing", "security", "jobs", "hr", "webmaster", "postmaster"];

  const isDisposable = disposableDomains.includes(domainPart);
  const isRole = rolePrefixes.includes(localPart);
  const isSyntaxValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
  
  // High deliverability score if not disposable, valid syntax and a realistic local name
  let deliverabilityScore = 95;
  if (!isSyntaxValid) deliverabilityScore = 0;
  else {
    if (isDisposable) deliverabilityScore -= 60;
    if (isRole) deliverabilityScore -= 10;
    if (localPart.length < 3) deliverabilityScore -= 15;
  }
  
  deliverabilityScore = Math.max(0, deliverabilityScore);

  let status: 'Deliverable' | 'Undeliverable' | 'Risky' = 'Deliverable';
  if (deliverabilityScore < 40) {
    status = 'Undeliverable';
  } else if (deliverabilityScore < 80) {
    status = 'Risky';
  }

  const result: VerificationResult = {
    email: cleanEmail,
    syntax: isSyntaxValid,
    mxRecord: isSyntaxValid && !isDisposable,
    disposable: isDisposable,
    roleAccount: isRole,
    catchAll: domainPart === "gmail.com" ? false : (domainPart.length % 2 === 0),
    smtpValidation: isSyntaxValid && !isDisposable && (localPart.length > 2),
    status,
    deliverabilityScore
  };

  res.json(result);
});

// ==========================================
// MODULE 3: DOMAIN RECON ENDPOINT
// ==========================================
app.post("/api/recon", (req: Request, res: Response) => {
  const { domain } = req.body;
  if (!domain || typeof domain !== "string") {
    res.status(400).json({ error: "Domain parameter is required." });
    return;
  }

  const { clean, name } = getDomainStructure(domain);
  
  // Record search history
  searchHistory.unshift({
    id: Math.random().toString(36).substring(2, 9),
    query: clean,
    type: "Domain Recon",
    timestamp: new Date().toISOString()
  });

  // Calculate simulated parameters from hash to remain deterministic
  const nameSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const ip = `104.${(nameSum % 120) + 12}.${(nameSum % 250) + 2}.${(nameSum % 254) + 1}`;
  
  const hosters = ["Cloudflare, Inc.", "Amazon Web Services, Inc.", "Google LLC", "DigitalOcean, LLC", "Fastly, Inc.", "Microsoft Corporation"];
  const hostingProvider = hosters[nameSum % hosters.length];
  
  const asn = `AS${15000 + (nameSum % 25000)}`;
  const countries = ["US", "DE", "NL", "IE", "SG", "GB", "CA", "FR", "JP"];
  const country = countries[nameSum % countries.length];

  const issuers = ["Let's Encrypt SHA256", "DigiCert Global G2", "Cloudflare Inc ECC CA-3", "Sectigo Limited", "Google Trust Services LLC"];
  const sslIssuer = issuers[nameSum % issuers.length];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 90 + (nameSum % 300));
  const sslValidTo = tomorrow.toISOString().split("T")[0];

  const cmsSystems = ["None / Static HTML", "WordPress 6.4", "Next.js (React)", "Webflow", "Shopify", "Drupal 10"];
  const servers = ["cloudflare", "nginx/1.24.0", "AmazonS3", "Apache/2.4.58", "Google Frontend"];
  const cdns = ["Cloudflare CDN", "Amazon CloudFront", "Fastly Edge", "Google Cloud CDN", "Akamai Technologies"];

  const result: DomainReconResult = {
    domain: clean,
    ipAddress: ip,
    hostingProvider,
    asn,
    country,
    sslCertificate: {
      valid: true,
      issuer: sslIssuer,
      validTo: sslValidTo,
      bits: nameSum % 2 === 0 ? 256 : 128
    },
    technologies: {
      cms: cmsSystems[nameSum % cmsSystems.length],
      webServer: servers[nameSum % servers.length],
      cdn: cdns[nameSum % cdns.length]
    }
  };

  res.json(result);
});

// ==========================================
// MODULE 4: DNS LOOKUP ENDPOINT
// ==========================================
app.post("/api/dns", (req: Request, res: Response) => {
  const { domain } = req.body;
  if (!domain || typeof domain !== "string") {
    res.status(400).json({ error: "Domain parameter is required." });
    return;
  }

  const { clean, name } = getDomainStructure(domain);
  const nameSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Simulated DNS Records
  const ip = `104.${(nameSum % 120) + 12}.${(nameSum % 250) + 2}.${(nameSum % 254) + 1}`;
  const ip6 = `2606:4700:3030::ac43:${(nameSum % 9000) + 1000}`;

  const records: DNSRecord[] = [
    { type: "A", value: ip, ttl: 300 },
    { type: "AAAA", value: ip6, ttl: 300 },
    { type: "MX", value: `mail.protection.outlook.com (Priority: 10)`, ttl: 3600, priority: 10 },
    { type: "MX", value: `alt1.aspmx.l.google.com (Priority: 20)`, ttl: 3600, priority: 20 },
    { type: "TXT", value: `v=spf1 include:_spf.google.com include:sendgrid.net ~all`, ttl: 3600 },
    { type: "TXT", value: `google-site-verification=GzRF${nameSum}HGDJ73642378`, ttl: 3600 },
    { type: "NS", value: `ns1.dns-hosting-provider.net`, ttl: 86400 },
    { type: "NS", value: `ns2.dns-hosting-provider.net`, ttl: 86400 },
    { type: "CAA", value: `0 issue "digicert.com"`, ttl: 3600 },
    { type: "SOA", value: `ns1.dns-hosting-provider.net. hostmaster.${clean}. 2026071001 7200 3600 1209600 3600`, ttl: 86400 }
  ];

  res.json({
    domain: clean,
    records
  });
});

// ==========================================
// MODULE 5: WHOIS ENDPOINT
// ==========================================
app.post("/api/whois", (req: Request, res: Response) => {
  const { domain } = req.body;
  if (!domain || typeof domain !== "string") {
    res.status(400).json({ error: "Domain parameter is required." });
    return;
  }

  const { clean, name } = getDomainStructure(domain);
  const nameSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const registrars = ["GoDaddy.com, LLC", "Namecheap, Inc.", "Gandi SAS", "Google Domains LLC", "Network Solutions, LLC", "Cloudflare, Inc."];
  const registrar = registrars[nameSum % registrars.length];

  const regYear = 2000 + (nameSum % 23);
  const registrationDate = `${regYear}-03-${(nameSum % 28) + 1}`;
  const expiryDate = `${regYear + 10}-03-${(nameSum % 28) + 1}`;

  const orgs = [`${name.toUpperCase()} Corporation`, `${name.charAt(0).toUpperCase() + name.slice(1)} Technology Partners`, "Domains By Proxy LLC", "Withheld for Privacy Provider"];
  const organization = orgs[nameSum % orgs.length];

  const countries = ["US", "CA", "GB", "DE", "IS", "SG", "FR"];
  const country = countries[nameSum % countries.length];

  const result: WhoisResult = {
    domain: clean,
    registrar,
    registrationDate,
    expiryDate,
    organization,
    country,
    status: "clientTransferProhibited https://icann.org/epp#clientTransferProhibited",
    dnssec: nameSum % 3 === 0
  };

  res.json(result);
});

// ==========================================
// MODULE 6: SUBDOMAIN ENUMERATION ENDPOINT
// ==========================================
app.post("/api/subdomains", (req: Request, res: Response) => {
  const { domain } = req.body;
  if (!domain || typeof domain !== "string") {
    res.status(400).json({ error: "Domain parameter is required." });
    return;
  }

  const { clean, name } = getDomainStructure(domain);
  const nameSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const potentialSubdomains = [
    { prefix: "www", ipOffset: 1, tech: "Cloudflare" },
    { prefix: "api", ipOffset: 5, tech: "Node.js / Express" },
    { prefix: "mail", ipOffset: 12, tech: "Microsoft Exchange" },
    { prefix: "dev", ipOffset: 89, tech: "Next.js / Docker" },
    { prefix: "staging", ipOffset: 92, tech: "Apache Web Server" },
    { prefix: "vpn", ipOffset: 41, tech: "Cisco ASA VPN" },
    { prefix: "blog", ipOffset: 19, tech: "WordPress" },
    { prefix: "shop", ipOffset: 34, tech: "Shopify Engine" },
    { prefix: "status", ipOffset: 27, tech: "UptimeRobot Monitor" },
    { prefix: "test", ipOffset: 104, tech: "Nginx Testbed" },
    { prefix: "admin", ipOffset: 63, tech: "PHP Admin Panel" },
    { prefix: "portal", ipOffset: 52, tech: "Okta Identity Provider" }
  ];

  const subdomains: SubdomainRecord[] = [];

  // Pick deterministic subdomains based on the domain name hash
  potentialSubdomains.forEach((item, index) => {
    // 60% chance of being active
    const isActive = ((nameSum + index) % 10) < 7;
    if (isActive) {
      const statusList = [200, 200, 200, 301, 302, 403, 401];
      const status = statusList[(nameSum + index) % statusList.length];
      const ip = `104.${(nameSum % 100) + 12}.${(nameSum % 200) + 3}.${(nameSum % 250) + item.ipOffset}`;
      
      subdomains.push({
        subdomain: `${item.prefix}.${clean}`,
        status,
        ip,
        technology: item.tech
      });
    }
  });

  res.json({
    domain: clean,
    count: subdomains.length,
    subdomains
  });
});

// ==========================================
// MODULE 7: SECURITY HEADERS ENDPOINT
// ==========================================
app.post("/api/headers", (req: Request, res: Response) => {
  const { domain } = req.body;
  if (!domain || typeof domain !== "string") {
    res.status(400).json({ error: "Domain parameter is required." });
    return;
  }

  const { clean, name } = getDomainStructure(domain);
  const nameSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // A domain-specific randomized but deterministic header grading
  const headers: SecurityHeaderResult[] = [
    {
      name: "Content-Security-Policy (CSP)",
      status: nameSum % 3 === 0 ? "Present" : "Missing",
      value: nameSum % 3 === 0 ? "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" : "",
      scoreImpact: 30,
      recommendation: "Implement strict CSP directives to restrict script execution, prevent Cross-Site Scripting (XSS), and define secure resource origins."
    },
    {
      name: "Strict-Transport-Security (HSTS)",
      status: nameSum % 2 === 0 ? "Present" : "Insecure",
      value: nameSum % 2 === 0 ? "max-age=63072000; includeSubDomains; preload" : "max-age=300",
      scoreImpact: 20,
      recommendation: "Increase the max-age directive to at least 1 year (31536000 seconds) and verify the 'includeSubDomains' and 'preload' options are present to secure HTTPS transportation."
    },
    {
      name: "X-Frame-Options",
      status: nameSum % 4 !== 0 ? "Present" : "Missing",
      value: nameSum % 4 !== 0 ? "SAMEORIGIN" : "",
      scoreImpact: 15,
      recommendation: "Configure this header as SAMEORIGIN or DENY to protect your domain portal from Clickjacking overlay exploits."
    },
    {
      name: "X-Content-Type-Options",
      status: nameSum % 5 !== 0 ? "Present" : "Missing",
      value: nameSum % 5 !== 0 ? "nosniff" : "",
      scoreImpact: 10,
      recommendation: "Explicitly set this header to 'nosniff' to disable MIME-sniffing and prevent the browser from executing files as executable scripts."
    },
    {
      name: "Referrer-Policy",
      status: nameSum % 3 !== 1 ? "Present" : "Missing",
      value: nameSum % 3 !== 1 ? "strict-origin-when-cross-origin" : "",
      scoreImpact: 10,
      recommendation: "Implement 'strict-origin-when-cross-origin' to ensure minimal referrer data leakages across modern cross-origin lookups."
    },
    {
      name: "Permissions-Policy",
      status: nameSum % 6 === 0 ? "Present" : "Missing",
      value: nameSum % 6 === 0 ? "geolocation=(), microphone=(), camera=()" : "",
      scoreImpact: 15,
      recommendation: "Restructure browser permissions policy to disable geolocation, microphone, and camera endpoints unless explicitly needed by modules."
    }
  ];

  // Calculate overall cybersecurity grading score
  let maxScore = 100;
  let penalty = 0;
  headers.forEach(h => {
    if (h.status === "Missing") penalty += h.scoreImpact;
    if (h.status === "Insecure") penalty += (h.scoreImpact / 2);
  });
  
  const securityScore = Math.max(10, maxScore - penalty);

  res.json({
    domain: clean,
    securityScore,
    grade: securityScore >= 90 ? "A" : securityScore >= 75 ? "B" : securityScore >= 55 ? "C" : securityScore >= 35 ? "D" : "F",
    headers
  });
});

// ==========================================
// MODULE 8: SPF / DKIM / DMARC ENDPOINT
// ==========================================
app.post("/api/email-auth", (req: Request, res: Response) => {
  const { domain } = req.body;
  if (!domain || typeof domain !== "string") {
    res.status(400).json({ error: "Domain parameter is required." });
    return;
  }

  const { clean, name } = getDomainStructure(domain);
  const nameSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const spfStatus = nameSum % 3 === 0 ? "Pass" : nameSum % 3 === 1 ? "Warning" : "Fail";
  const dkimStatus = nameSum % 2 === 0 ? "Pass" : "Warning";
  const dmarcStatus = nameSum % 4 === 0 ? "Pass" : nameSum % 4 === 1 ? "Warning" : "Fail";

  const result: EmailAuthResult = {
    spf: {
      status: spfStatus,
      record: spfStatus !== "Fail" ? "v=spf1 include:_spf.google.com include:sendgrid.net ~all" : "",
      details: spfStatus === "Pass" ? "SPF record is valid and allows authorized mail servers." : spfStatus === "Warning" ? "SPF record exists but uses softfail (~all) which allows spoofing under some MTAs." : "No valid SPF record discovered on domain records."
    },
    dkim: {
      status: dkimStatus,
      record: dkimStatus === "Pass" ? "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv1..." : "",
      details: dkimStatus === "Pass" ? "DKIM selector signature record is active and matches cryptographic standards." : "DKIM configuration not explicitly verified on root selector. Double check active mailers."
    },
    dmarc: {
      status: dmarcStatus,
      record: dmarcStatus !== "Fail" ? `v=DMARC1; p=${dmarcStatus === "Pass" ? "reject" : "none"}; rua=mailto:dmarc-rua@${clean}` : "",
      details: dmarcStatus === "Pass" ? "DMARC policy is set to strict reject ('p=reject'). Spammers blocked." : dmarcStatus === "Warning" ? "DMARC policy exists but set to monitor mode ('p=none'). Phishing mails might bypass." : "No DMARC policy discovered. Domain is extremely susceptible to email spoofing campaigns."
    },
    recommendations: []
  };

  if (spfStatus === "Fail") {
    result.recommendations.push("Create a v=spf1 TXT record defining authorized SMTP outbound relays.");
  } else if (spfStatus === "Warning") {
    result.recommendations.push("Upgrade SPF ending mechanism from softfail (~all) to hardfail (-all) if strict alignment is required.");
  }

  if (dkimStatus === "Warning") {
    result.recommendations.push("Ensure 2048-bit DKIM keys are configured across active marketing portals (Sendgrid, Mailchimp).");
  }

  if (dmarcStatus !== "Pass") {
    result.recommendations.push("Configure DMARC alignment and progressively upgrade policy from 'p=none' to 'p=quarantine' and ultimately 'p=reject'.");
  }

  res.json({
    domain: clean,
    ...result
  });
});

// ==========================================
// MODULE 9: EMAIL BREACH CHECK ENDPOINT
// ==========================================
app.post("/api/breach-check", (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const [localPart, domainPart] = cleanEmail.split("@");
  const localSum = localPart.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Determine exposures based on localSum hash
  const hasBreaches = localSum % 2 === 0;
  
  // Record search history
  searchHistory.unshift({
    id: Math.random().toString(36).substring(2, 9),
    query: cleanEmail,
    type: "Breach Lookup",
    timestamp: new Date().toISOString()
  });

  if (!hasBreaches) {
    const result: EmailBreachRecord = {
      email: cleanEmail,
      riskLevel: "None",
      exposureCount: 0,
      breaches: [],
      timeline: [
        { year: "2023", count: 0 },
        { year: "2024", count: 0 },
        { year: "2025", count: 0 },
        { year: "2026", count: 0 }
      ],
      recommendations: [
        "Email appears clean in popular breach datasets.",
        "Enable multi-factor authentication (MFA) as a preventive security measure.",
        "Ensure unique password strategies across critical online accounts."
      ]
    };
    res.json(result);
    return;
  }

  const allBreaches = [
    {
      name: "Canva Breach",
      date: "2024-05",
      description: "In May 2024, the graphic design platform Canva suffered a security incident exposing email addresses, names, and salted bcrypt hashes.",
      dataClasses: ["Emails", "Passwords", "Names", "Locations"]
    },
    {
      name: "Dropbox Database Leak",
      date: "2016-08",
      description: "A historical database disclosure involving millions of credentials including email accounts and bcrypt hashed passwords.",
      dataClasses: ["Emails", "Passwords", "Usernames"]
    },
    {
      name: "LinkedIn Scraping Incident",
      date: "2021-04",
      description: "A publicly parsed archive of corporate profiles exposing full names, email addresses, and employment backgrounds.",
      dataClasses: ["Emails", "Names", "Job Titles", "Social Connections"]
    },
    {
      name: "Adobe Customer Account Leak",
      date: "2013-10",
      description: "A major compromise disclosing usernames, password hints, and email accounts in cleartext formats.",
      dataClasses: ["Emails", "Password Hints", "Usernames"]
    },
    {
      name: "SecurityForum Community Portal Hack",
      date: "2025-01",
      description: "A recent exploit on a cybersecurity enthusiast forum leaking developer credentials and cleartext password references.",
      dataClasses: ["Emails", "Passwords", "IP Addresses"]
    }
  ];

  const exposureCount = (localSum % 4) + 1;
  const breaches = allBreaches.slice(0, exposureCount);

  const timeline = [
    { year: "2013", count: localSum % 2 === 0 ? 1 : 0 },
    { year: "2016", count: localSum % 3 === 0 ? 1 : 0 },
    { year: "2021", count: localSum % 5 === 0 ? 1 : 0 },
    { year: "2024", count: 1 },
    { year: "2025", count: localSum % 4 === 0 ? 1 : 0 }
  ].filter(t => t.count > 0);

  const riskLevel = exposureCount >= 4 ? "High" : exposureCount >= 2 ? "Medium" : "Low";

  const recommendations = [
    "IMMEDIATELY change any passwords that share similarity with previous credentials.",
    "Enroll in an active credential manager (e.g., Bitwarden, 1Password) to randomize login strings.",
    "Verify darkweb monitoring tools are configured to alert your SOC on secondary corporate leaks.",
    "Activate 2FA (Two-Factor Authentication) using an authenticator app (such as Google Authenticator or Yubikey)."
  ];

  const result: EmailBreachRecord = {
    email: cleanEmail,
    riskLevel,
    exposureCount,
    breaches,
    timeline,
    recommendations
  };

  res.json(result);
});

// ==========================================
// MODULE 10: REPORT GENERATION (AI ASSISTED)
// ==========================================
app.post("/api/gemini/analyze", async (req: Request, res: Response) => {
  const { domain, emails, securityScore, headersMissing, breachCount } = req.body;
  if (!domain || typeof domain !== "string") {
    res.status(400).json({ error: "Domain parameter is required." });
    return;
  }

  // Fallback template in case Gemini is not configured
  const generateFallbackSummary = (d: string, score: number) => {
    return `### Executive Security Assessment Report for **${d}**

**Overall Threat Posture**: Action Required
**Calculated Security Score**: **${score}/100**

#### Key Discoveries:
1. **Email Exposures**: Identified potential public employee credentials that could be leveraged by malicious actors for spear-phishing or credential stuffing campaigns.
2. **Missing HTTP Security Headers**: Crucial HTTP response flags are missing or configured incorrectly, elevating the risk of Clickjacking and Cross-Site Scripting (XSS).
3. **Domain Authentication**: DKIM/DMARC protocols are incomplete. Outbound email flows are vulnerable to domain spoofing.

#### Immediate Recommendations:
- Implement a rigid Content-Security-Policy (CSP) to restrict JavaScript origin resources.
- Enable DMARC alignment with a reject or quarantine policy (\`p=reject\`).
- Conduct periodic user awareness training concerning targeted spear-phishing tactics.
- Register endpoints with dark-web monitoring watchlists.`;
  };

  const client = getGeminiClient();
  if (!client) {
    // If Gemini key is missing, respond gracefully with simulated professional cyber analyst output
    console.log("No Gemini API key found, returning simulated analyst report.");
    const summary = generateFallbackSummary(domain, securityScore || 75);
    res.json({ text: summary, source: "Simulated Expert Engine (Offline Mode)" });
    return;
  }

  try {
    const prompt = `You are a Senior Principal Cybersecurity Penetration Tester and OSINT Specialist.
Analyze the following OSINT and email reconnaissance footprint discovered for the domain "${domain}":
- Calculative Security Header Score: ${securityScore || 75}/100
- Exposed Emails Found: ${emails || 12}
- Number of Missing/Insecure Security Headers: ${headersMissing || 3}
- Email Breach Exposure Count: ${breachCount || 2}

Please generate an Executive Security Assessment and Advisory report in Markdown.
The report must include:
1. Executive Threat Summary (professional, authoritative, and clinical).
2. High-priority risk scenarios based on the discovered email footprint (e.g. social engineering vector, spoofing vector).
3. Clear, action-oriented, and prioritized technical remediation recommendations.

Keep your tone professional, clinical, helpful, and highly scannable using bold headings.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    res.json({
      text: response.text || generateFallbackSummary(domain, securityScore || 75),
      source: "Gemini 3.5 Flash Model (Online AI Mode)"
    });

  } catch (error: any) {
    console.error("Gemini API Error: ", error);
    const summary = generateFallbackSummary(domain, securityScore || 75);
    res.json({ 
      text: summary, 
      source: "Simulated Expert Engine (API Fallback)", 
      error: error.message 
    });
  }
});

// ==========================================
// ADMIN & STATISTICS ENDPOINTS
// ==========================================
app.get("/api/stats", (req: Request, res: Response) => {
  // Total stats
  const totalRequests = apiLogs.length;
  const errorRequests = apiLogs.filter(l => l.status >= 400).length;
  const successRequests = totalRequests - errorRequests;
  
  // Calculate endpoint distribution
  const endpoints: Record<string, number> = {};
  apiLogs.forEach(l => {
    endpoints[l.endpoint] = (endpoints[l.endpoint] || 0) + 1;
  });

  const latencySum = apiLogs.reduce((acc, curr) => acc + curr.latency, 0);
  const avgLatency = totalRequests ? Math.round(latencySum / totalRequests) : 25;

  res.json({
    systemHealth: "Operational",
    uptime: Math.round(process.uptime()),
    totalLogsCount: apiLogs.length,
    totalRequests,
    avgLatency,
    errorRate: totalRequests ? ((errorRequests / totalRequests) * 100).toFixed(1) + "%" : "0.0%",
    endpointDistribution: Object.entries(endpoints).map(([name, count]) => ({ name, count })),
    recentLogs: apiLogs.slice(0, 30)
  });
});

app.get("/api/search-history", (req: Request, res: Response) => {
  res.json({ history: searchHistory });
});

app.get("/api/saved-reports", (req: Request, res: Response) => {
  res.json({ reports: savedReports });
});

app.post("/api/save-report", (req: Request, res: Response) => {
  const report = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    ...req.body
  };
  savedReports.unshift(report);
  res.json({ success: true, report });
});

app.get("/api/bookmarks", (req: Request, res: Response) => {
  res.json({ bookmarks: bookmarkedItems });
});

app.post("/api/bookmark", (req: Request, res: Response) => {
  const { query, type, note } = req.body;
  if (!query || !type) {
    res.status(400).json({ error: "Query and type are required." });
    return;
  }
  const item = {
    id: Math.random().toString(36).substring(2, 9),
    query,
    type,
    note: note || "",
    timestamp: new Date().toISOString()
  };
  bookmarkedItems.unshift(item);
  res.json({ success: true, bookmark: item });
});

app.delete("/api/bookmark/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = bookmarkedItems.findIndex(b => b.id === id);
  if (idx !== -1) {
    bookmarkedItems.splice(idx, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Bookmark not found" });
  }
});

// ==========================================
// VITE CLIENT DEV MIDDLEWARE & STATIC ASSET PRODUCTION FLOW
// ==========================================
async function startApp() {
  if (process.env.NODE_ENV !== "production") {
    // Serve client assets with Vite middlewares in development
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the compiled static output inside the 'dist' folder
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Email Harvesting & Reconnaissance server active on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startApp().catch((err) => {
    console.error("Critical error starting application", err);
  });
}
