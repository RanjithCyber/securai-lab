export type SeverityLevel = "critical" | "high" | "medium" | "low" | "none";

interface VulnerabilityRule {
  pattern: RegExp;
  name: string;
  severity: SeverityLevel;
  remedy: string;
}

const VULNERABILITY_RULES: VulnerabilityRule[] = [
  {
    pattern: /eval\s*\(/gi,
    name: "Dangerous eval() usage",
    severity: "critical",
    remedy: "Remove eval() and replace with safe alternatives like JSON.parse() for JSON or predefined function maps for dynamic dispatch.",
  },
  {
    pattern: /exec\s*\(/gi,
    name: "Shell command injection risk (exec)",
    severity: "critical",
    remedy: "Sanitize all inputs before passing to exec(). Use parameterized subprocess calls and validate against an allowlist.",
  },
  {
    pattern: /os\.system\s*\(/gi,
    name: "OS command injection (os.system)",
    severity: "critical",
    remedy: "Replace os.system() with subprocess.run() using a list of arguments to prevent shell injection.",
  },
  {
    pattern: /subprocess\.(call|Popen|run)\s*\([^,\]]*shell\s*=\s*True/gi,
    name: "Subprocess with shell=True",
    severity: "critical",
    remedy: "Set shell=False and pass arguments as a list to prevent command injection.",
  },
  {
    pattern: /SELECT\s+\*?\s+FROM[^;]*\+\s*[\w'"]/gi,
    name: "SQL Injection vulnerability",
    severity: "critical",
    remedy: "Use parameterized queries or prepared statements. Never concatenate user input into SQL strings.",
  },
  {
    pattern: /password\s*=\s*["'][^"']+["']/gi,
    name: "Hardcoded password detected",
    severity: "high",
    remedy: "Move credentials to environment variables. Use a secrets manager in production.",
  },
  {
    pattern: /api_key\s*=\s*["'][^"']+["']/gi,
    name: "Hardcoded API key",
    severity: "high",
    remedy: "Store API keys in environment variables (process.env / os.environ) and never commit them to source control.",
  },
  {
    pattern: /secret\s*=\s*["'][^"']+["']/gi,
    name: "Hardcoded secret value",
    severity: "high",
    remedy: "Use environment variables or a dedicated secrets vault instead of embedding secrets in code.",
  },
  {
    pattern: /innerHTML\s*=/gi,
    name: "XSS via innerHTML assignment",
    severity: "high",
    remedy: "Use textContent for plain text or DOMPurify.sanitize() before assigning to innerHTML. Prefer framework-safe rendering.",
  },
  {
    pattern: /document\.write\s*\(/gi,
    name: "XSS risk via document.write()",
    severity: "high",
    remedy: "Replace document.write() with DOM manipulation methods like createElement() and appendChild().",
  },
  {
    pattern: /pickle\.(load|loads)\s*\(/gi,
    name: "Insecure deserialization (pickle)",
    severity: "high",
    remedy: "Avoid deserializing pickle data from untrusted sources. Use JSON or a safe serialization format instead.",
  },
  {
    pattern: /md5\s*\(/gi,
    name: "Weak hashing algorithm (MD5)",
    severity: "medium",
    remedy: "Replace MD5 with a strong hash function: bcrypt/argon2 for passwords, SHA-256+ for data integrity.",
  },
  {
    pattern: /sha1\s*\(/gi,
    name: "Weak hashing algorithm (SHA-1)",
    severity: "medium",
    remedy: "Upgrade to SHA-256 or SHA-3 for cryptographic use cases.",
  },
  {
    pattern: /console\.log\s*\([^)]*password/gi,
    name: "Sensitive data in logs",
    severity: "medium",
    remedy: "Remove password or credential values from log statements. Use redacted placeholders.",
  },
  {
    pattern: /http:\/\//gi,
    name: "Insecure HTTP connection",
    severity: "medium",
    remedy: "Use HTTPS instead of HTTP for all external connections to prevent man-in-the-middle attacks.",
  },
  {
    pattern: /TODO|FIXME|HACK/g,
    name: "Unresolved security TODO/FIXME",
    severity: "low",
    remedy: "Review and resolve all security-related TODOs before deploying to production.",
  },
  {
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/gi,
    name: "Empty catch block (swallowed exception)",
    severity: "low",
    remedy: "Handle exceptions explicitly. Empty catch blocks hide errors and make debugging difficult.",
  },
];

function rankSeverity(s: SeverityLevel): number {
  return { critical: 4, high: 3, medium: 2, low: 1, none: 0 }[s];
}

export interface ScanResult {
  severity: SeverityLevel;
  vulnerabilitiesFound: string[];
  remediation: string;
}

export function analyzeCode(code: string, _language: string): ScanResult {
  const matched: VulnerabilityRule[] = [];

  for (const rule of VULNERABILITY_RULES) {
    rule.pattern.lastIndex = 0;
    if (rule.pattern.test(code)) {
      matched.push(rule);
    }
  }

  if (matched.length === 0) {
    return {
      severity: "none",
      vulnerabilitiesFound: [],
      remediation:
        "No known vulnerability patterns detected by static analysis. Run dynamic analysis and manual review for a complete security assessment.",
    };
  }

  const topSeverity = matched.reduce<SeverityLevel>((best, r) => {
    return rankSeverity(r.severity) > rankSeverity(best) ? r.severity : best;
  }, "none");

  const vulnNames = matched.map((r) => r.name);

  const remediations = matched
    .map((r) => `[${r.severity.toUpperCase()}] ${r.name}:\n  ${r.remedy}`)
    .join("\n\n");

  return {
    severity: topSeverity,
    vulnerabilitiesFound: vulnNames,
    remediation: remediations,
  };
}
