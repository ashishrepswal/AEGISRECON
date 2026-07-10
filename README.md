# Email Harvesting & Reconnaissance Tool

A professional, modern, full-stack cybersecurity OSINT (Open Source Intelligence) and reconnaissance platform designed for penetration testers, security researchers, and SOC analysts.

## Key Features
- **Email Harvesting**: Discovers public-facing employee emails and structural patterns.
- **Email Verification**: Analyzes MX records, role status, disposability, and deliverability.
- **Domain Reconnaissance**: Gathers IP geolocation, hosting asn information, active SSL properties, and active CMS technologies.
- **DNS Lookup**: Displays key record blocks including A, AAAA, MX, TXT, and CAA.
- **WHOIS Query**: Scans registrars, domains, and domain creation timelines.
- **Subdomain Enumeration**: Discovers public subdomains with technology stack and active ports.
- **Security Headers Analyzer**: Scans security headers and issues a consolidated Security Score.
- **SPF/DKIM/DMARC Analyzer**: Evaluates electronic spoofing defense mechanisms.
- **Email Breach Check**: Checks email inclusions in public database disclosures with a risk graph.
- **AI advisory Summary**: Integrated Gemini 3.5 Flash server-side logic writes robust advisories.
- **Admin Command Portal**: Includes live system logs, API metrics, and system diagnostic counters.

## Technologies
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TSX compiler, esbuild
- **AI Service**: Google Gemini API via `@google/genai` SDK

## Installation
1. Ensure dependencies are fully loaded:
   ```bash
   npm install
   ```
2. Run development environment:
   ```bash
   npm run dev
   ```
3. Compile production builds:
   ```bash
   npm run build
   ```
4. Run production service:
   ```bash
   npm run start
   ```

## Disclaimer
"This platform is intended only for authorized security testing, defensive cybersecurity, research, and educational purposes. Users must obtain permission before assessing any third-party systems. Unauthorized use may violate applicable laws and policies."
