export interface EmailRecord {
  id: string;
  email: string;
  source: string;
  confidenceScore: number; // 0-100
  departmentGuess: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface VerificationResult {
  email: string;
  syntax: boolean;
  mxRecord: boolean;
  disposable: boolean;
  roleAccount: boolean;
  catchAll: boolean;
  smtpValidation: boolean;
  status: 'Deliverable' | 'Undeliverable' | 'Risky';
  deliverabilityScore: number; // 0-100
}

export interface DomainReconResult {
  domain: string;
  ipAddress: string;
  hostingProvider: string;
  asn: string;
  country: string;
  sslCertificate: {
    valid: boolean;
    issuer: string;
    validTo: string;
    bits: number;
  };
  technologies: {
    cms: string;
    webServer: string;
    cdn: string;
  };
}

export interface DNSRecord {
  type: 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CAA' | 'SOA' | 'PTR';
  value: string;
  ttl?: number;
  priority?: number;
}

export interface WhoisResult {
  domain: string;
  registrar: string;
  registrationDate: string;
  expiryDate: string;
  organization: string;
  country: string;
  status: string;
  dnssec: boolean;
}

export interface SubdomainRecord {
  subdomain: string;
  status: number; // 200, 403, 404, etc
  ip: string;
  technology: string;
}

export interface SecurityHeaderResult {
  name: string;
  status: 'Present' | 'Missing' | 'Insecure';
  value: string;
  scoreImpact: number;
  recommendation: string;
}

export interface EmailBreachRecord {
  email: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'None';
  exposureCount: number;
  breaches: {
    name: string;
    date: string;
    description: string;
    dataClasses: string[];
  }[];
  timeline: { year: string; count: number }[];
  recommendations: string[];
}

export interface EmailAuthResult {
  spf: { status: 'Pass' | 'Warning' | 'Fail'; record: string; details: string };
  dkim: { status: 'Pass' | 'Warning' | 'Fail'; record: string; details: string };
  dmarc: { status: 'Pass' | 'Warning' | 'Fail'; record: string; details: string };
  recommendations: string[];
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: string;
  timestamp: string;
}

export interface ApiLogItem {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  ip: string;
  latency: number;
}
