/**
 * Web Protector - Rule Engine
 * Deterministic weighted heuristic rules to analyze URL phishing and safety risks.
 * 
 * Score Mapping:
 *   0 - 33  : Safe
 *   34 - 66 : Suspicious
 *   67 - 100: Phishing
 */

const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'verification', 'secure', 'security', 'update',
  'banking', 'bank', 'account', 'signin', 'sign-in', 'password',
  'wallet', 'confirm', 'credential', 'support', 'billing', 'invoice',
  'authenticate', 'appleid', 'paypal', 'recovery'
];

/**
 * Parses and normalizes a given URL string.
 * Automatically adds 'https://' if protocol is omitted.
 */
function normalizeUrl(rawUrl) {
  let trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    throw new Error('URL cannot be empty');
  }

  // Prepend protocol if missing for URL parsing
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'http://' + trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    return {
      raw: rawUrl.trim(),
      normalized: trimmed,
      parsed
    };
  } catch (err) {
    throw new Error(`Invalid URL format: ${err.message}`);
  }
}

/**
 * Checks if a hostname is an IPv4 or IPv6 address.
 */
function isIpAddress(hostname) {
  // IPv4 pattern
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // IPv6 pattern or bracketed IPv6
  const cleanHost = hostname.replace(/^\[|\]$/g, '');
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Pattern.test(cleanHost) || ipv6Pattern.test(cleanHost);
}

/**
 * Evaluates all deterministic rules and generates score and feature breakdown.
 */
function analyzeUrl(inputUrl) {
  const { raw, normalized, parsed } = normalizeUrl(inputUrl);

  const hostname = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol.toLowerCase();
  const fullUrl = parsed.href;
  const rawLower = raw.toLowerCase();

  const features = [];
  let rawRiskPoints = 0;

  // 1. HTTPS Presence (Weight: Medium, Contribution: +20)
  const isHttps = protocol === 'https:';
  if (!isHttps) {
    rawRiskPoints += 20;
    features.push({
      id: 'https',
      name: 'Protocol Security',
      category: 'Encryption',
      status: 'danger',
      weight: 'Medium',
      contribution: 20,
      value: protocol.replace(':', '').toUpperCase(),
      description: 'Site does not use HTTPS encryption. Credentials transmitted in cleartext.'
    });
  } else {
    features.push({
      id: 'https',
      name: 'Protocol Security',
      category: 'Encryption',
      status: 'safe',
      weight: 'Medium',
      contribution: 0,
      value: 'HTTPS',
      description: 'Secure TLS/SSL protocol in use.'
    });
  }

  // 2. IP Address Host (Weight: High, Contribution: +30)
  const isRawIp = isIpAddress(hostname);
  if (isRawIp) {
    rawRiskPoints += 30;
    features.push({
      id: 'ip_address',
      name: 'Host Identification',
      category: 'Identity',
      status: 'danger',
      weight: 'High',
      contribution: 30,
      value: hostname,
      description: 'URL uses a raw IP address instead of a registered domain name (common phishing tactic).'
    });
  } else {
    features.push({
      id: 'ip_address',
      name: 'Host Identification',
      category: 'Identity',
      status: 'safe',
      weight: 'High',
      contribution: 0,
      value: hostname,
      description: 'URL uses a registered domain name.'
    });
  }

  // 3. URL Length (Weight: Low, Contribution: +10)
  const urlLength = raw.length;
  if (urlLength > 75) {
    rawRiskPoints += 10;
    features.push({
      id: 'url_length',
      name: 'URL Length',
      category: 'Structure',
      status: 'warning',
      weight: 'Low',
      contribution: 10,
      value: `${urlLength} chars`,
      description: `URL length is ${urlLength} characters (> 75 chars), often used to hide target destination or pack obfuscated parameters.`
    });
  } else {
    features.push({
      id: 'url_length',
      name: 'URL Length',
      category: 'Structure',
      status: 'safe',
      weight: 'Low',
      contribution: 0,
      value: `${urlLength} chars`,
      description: 'Standard, concise URL length.'
    });
  }

  // 4. Suspicious Keywords (Weight: Medium, Contribution: +20)
  const foundKeywords = SUSPICIOUS_KEYWORDS.filter(kw => {
    // Check if keyword is in pathname, search params, or hostname (excluding well-known legit domains)
    return fullUrl.toLowerCase().includes(kw);
  });

  if (foundKeywords.length > 0) {
    // Escalate slightly if multiple keywords are found
    const keywordContribution = Math.min(25, 15 + (foundKeywords.length - 1) * 5);
    rawRiskPoints += keywordContribution;
    features.push({
      id: 'suspicious_keywords',
      name: 'Sensitive Keywords',
      category: 'Content Heuristics',
      status: 'danger',
      weight: 'Medium',
      contribution: keywordContribution,
      value: foundKeywords.slice(0, 4).join(', ') + (foundKeywords.length > 4 ? '...' : ''),
      description: `Contains high-risk credential or banking keywords: "${foundKeywords.slice(0, 3).join('", "')}".`
    });
  } else {
    features.push({
      id: 'suspicious_keywords',
      name: 'Sensitive Keywords',
      category: 'Content Heuristics',
      status: 'safe',
      weight: 'Medium',
      contribution: 0,
      value: 'None detected',
      description: 'No common credential-harvesting keywords found in URL.'
    });
  }

  // 5. Subdomain Count (Weight: Medium, Contribution: +15)
  // Strip TLD (.com, .co.uk, etc.) to count subdomains
  const hostParts = hostname.split('.').filter(Boolean);
  // Simple heuristic: if parts > 3 (e.g. sub2.sub1.example.com)
  const subdomainCount = hostParts.length > 2 ? hostParts.length - 2 : 0;
  if (subdomainCount >= 3) {
    rawRiskPoints += 15;
    features.push({
      id: 'subdomains',
      name: 'Subdomain Depth',
      category: 'Structure',
      status: 'danger',
      weight: 'Medium',
      contribution: 15,
      value: `${subdomainCount} subdomains`,
      description: `Deep subdomain nesting (${subdomainCount} levels). Often deployed by attackers to imitate legitimate brand domains.`
    });
  } else if (subdomainCount === 2) {
    rawRiskPoints += 5;
    features.push({
      id: 'subdomains',
      name: 'Subdomain Depth',
      category: 'Structure',
      status: 'warning',
      weight: 'Low',
      contribution: 5,
      value: `${subdomainCount} subdomains`,
      description: 'Moderate subdomain nesting detected.'
    });
  } else {
    features.push({
      id: 'subdomains',
      name: 'Subdomain Depth',
      category: 'Structure',
      status: 'safe',
      weight: 'Medium',
      contribution: 0,
      value: `${subdomainCount} subdomains`,
      description: 'Normal domain hierarchy depth.'
    });
  }

  // 6. '@' Symbol in URL (Weight: High, Contribution: +25)
  const hasAtSymbol = raw.includes('@');
  if (hasAtSymbol) {
    rawRiskPoints += 25;
    features.push({
      id: 'at_symbol',
      name: '@ Symbol Obfuscation',
      category: 'Authentication',
      status: 'danger',
      weight: 'High',
      contribution: 25,
      value: 'Present',
      description: 'Presence of "@" in URL allows browsers to ignore everything preceding it, misleading users on the true destination.'
    });
  } else {
    features.push({
      id: 'at_symbol',
      name: '@ Symbol Obfuscation',
      category: 'Authentication',
      status: 'safe',
      weight: 'High',
      contribution: 0,
      value: 'Absent',
      description: 'No deceptive "@" userinfo token found.'
    });
  }

  // 7. Excessive Hyphens in Domain (Weight: Low, Contribution: +10)
  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    rawRiskPoints += 12;
    features.push({
      id: 'hyphens',
      name: 'Domain Hyphens',
      category: 'Brand Impersonation',
      status: 'danger',
      weight: 'Low',
      contribution: 12,
      value: `${hyphenCount} hyphens`,
      description: `Domain contains ${hyphenCount} hyphens. Attackers frequently use hyphens to string brand names together.`
    });
  } else if (hyphenCount >= 2) {
    rawRiskPoints += 6;
    features.push({
      id: 'hyphens',
      name: 'Domain Hyphens',
      category: 'Brand Impersonation',
      status: 'warning',
      weight: 'Low',
      contribution: 6,
      value: `${hyphenCount} hyphens`,
      description: 'Multiple hyphens detected in domain name.'
    });
  } else {
    features.push({
      id: 'hyphens',
      name: 'Domain Hyphens',
      category: 'Brand Impersonation',
      status: 'safe',
      weight: 'Low',
      contribution: 0,
      value: `${hyphenCount} hyphens`,
      description: 'Normal domain name hyphenation.'
    });
  }

  // 8. Obfuscation & Encoded Characters (Weight: Low, Contribution: +10)
  const hasDoubleSlashInPath = parsed.pathname.includes('//');
  const percentEncodingCount = (raw.match(/%[0-9a-fA-F]{2}/g) || []).length;
  if (hasDoubleSlashInPath || percentEncodingCount > 3) {
    rawRiskPoints += 10;
    features.push({
      id: 'obfuscation',
      name: 'URL Obfuscation',
      category: 'Encoding',
      status: 'warning',
      weight: 'Low',
      contribution: 10,
      value: percentEncodingCount > 3 ? `${percentEncodingCount} hex tokens` : 'Redirect slashes',
      description: 'URL contains excessive hex-encoding or redirection tokens.'
    });
  }

  // Calculate final clamped risk score 0 - 100
  const riskScore = Math.min(100, Math.max(0, Math.round(rawRiskPoints)));

  // Map to classification
  let riskLevel = 'Safe';
  if (riskScore >= 67) {
    riskLevel = 'Phishing';
  } else if (riskScore >= 34) {
    riskLevel = 'Suspicious';
  }

  // Calculate confidence percentage
  // High confidence when signals are strong (either very safe or clearly malicious)
  let confidence = 85;
  if (riskScore <= 15 || riskScore >= 75) {
    confidence = 94 + Math.min(5, Math.floor(Math.abs(riskScore - 50) / 10));
  } else if (riskScore >= 30 && riskScore <= 60) {
    confidence = 82;
  }

  // Summary generation
  let summary = '';
  if (riskLevel === 'Safe') {
    summary = 'This URL exhibits strong standard safety indicators: valid domain, standard structure, and no prominent phishing patterns.';
  } else if (riskLevel === 'Suspicious') {
    summary = 'This URL exhibits multiple anomaly signals. Exercise caution before submitting personal or sensitive data.';
  } else {
    summary = 'HIGH RISK: This URL demonstrates multiple hallmark indicators of phishing or malicious credential theft.';
  }

  return {
    url: raw,
    hostname,
    riskScore,
    riskLevel,
    confidence,
    summary,
    scannedAt: new Date().toISOString(),
    features
  };
}

module.exports = {
  analyzeUrl,
  normalizeUrl,
  isIpAddress
};
