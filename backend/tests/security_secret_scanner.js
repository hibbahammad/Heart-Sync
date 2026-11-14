import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

const excludeDirs = new Set(["node_modules", "dist", ".git", ".gemini"]);
const sensitivePatterns = [
  { name: "MongoDB Atlas Credentials", regex: /mongodb\+srv:\/\/[^:]+:[^@]+@/i },
  { name: "Private RSA/EC Key", regex: /-----BEGIN (?:RSA )?PRIVATE KEY-----/ },
  { name: "Hardcoded AWS Key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "Bearer token literal", regex: /Bearer\s+ey[A-Za-z0-9_\-\.]+/i },
];

let hits = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (excludeDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(full);
    } else {
      // Do not scan .env files because they are gitignored and development-only
      if (entry.name === ".env") continue;
      const content = fs.readFileSync(full, "utf8");
      for (const pattern of sensitivePatterns) {
        if (pattern.regex.test(content)) {
          // Exclude template placeholder in .env.example and documentation markdown
          if (content.includes("<username>:<password>") || content.includes("<user>:<password>")) {
            continue;
          }
          hits.push({
            file: path.relative(rootDir, full),
            issue: pattern.name,
          });
        }
      }
    }
  }
}

scanDir(rootDir);

console.log("=================================================");
console.log("HEART SYNC — STATIC SECRET AUDIT SCAN");
console.log("=================================================");
if (hits.length === 0) {
  console.log("✅ ZERO SENSITIVE SECRETS DETECTED IN TRACKABLE CODEBASE!");
  process.exit(0);
} else {
  console.error("❌ POTENTIAL SECRETS DETECTED:");
  hits.forEach((h) => console.error(` - ${h.file}: ${h.issue}`));
  process.exit(1);
}
