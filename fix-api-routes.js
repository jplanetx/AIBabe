#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = process.cwd();
const apiRouteGlob = "app/api";

function getAllRouteFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach((file) => {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(getAllRouteFiles(filePath));
    } else if (
      file.name === "route.ts" ||
      file.name === "route.js"
    ) {
      results.push(filePath);
    }
  });
  return results;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Extract all dynamic exports
  const dynamicRegex = /export\s+const\s+dynamic\s*=\s*[^;]+;/g;
  const dynamics = content.match(dynamicRegex) || [];

  // Remove all dynamic exports from content
  content = content.replace(dynamicRegex, "").trimStart();

  // Remove duplicate dynamic exports, keep only first
  const dynamicExport = dynamics.length > 0 ? dynamics[0] : null;

  // Move dynamic export to top with no whitespace/comments above
  if (dynamicExport) {
    content = `${dynamicExport}\n\n${content}`;
  }

// Replace all prisma imports with import { db } from "@/lib/db";
 // Remove any import of prisma client
 content = content.replace(
   /import\s+prisma\s+from\s+["'][^"']+["'];?/g,
   ""
 );

// Remove existing db imports from other paths
content = content.replace(
  /import\s+{\s*db\s*}\s+from\s+["'](?!@\/lib\/db["'])[^"']+["'];?\s*/g,
  ""
);

// Ensure import { db } from "@/lib/db"; is present
const hasDbUsage = /\bdb\./g.test(content);
if (hasDbUsage && !content.includes(`import { db } from "@/lib/db";`)) {
   // Insert after first import or at top if no imports
   const importRegex = /import .+ from .+;/;
   const firstImportMatch = content.match(importRegex);
   if (firstImportMatch) {
     const idx = content.indexOf(firstImportMatch[0]) + firstImportMatch[0].length;
     content =
       content.slice(0, idx) +
       `\nimport { db } from "@/lib/db";` +
       content.slice(idx);
   } else {
     content = `import { db } from "@/lib/db";\n\n` + content;
   }
 }

  // Replace all prisma. with db.
  content = content.replace(/\bprisma\./g, "db.");

  // Write back fixed content
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Fixed: ${filePath}`);
}

function main() {
  const routeFiles = getAllRouteFiles(path.join(rootDir, apiRouteGlob));
  if (routeFiles.length === 0) {
    console.log("No route.ts or route.js files found under app/api.");
    return;
  }

  routeFiles.forEach(fixFile);

  // Optional: Detect accidental imports of route files
  /*
  console.log("\nChecking for accidental imports of route files...");
  const importCheckRegex = /import\s+.*\s+from\s+["'].*route(\.ts|\.js)["']/g;
  const allFiles = getAllFiles(rootDir);
  allFiles.forEach((file) => {
    if (file.endsWith(".ts") || file.endsWith(".js")) {
      const content = fs.readFileSync(file, "utf8");
      if (importCheckRegex.test(content)) {
        console.warn(`Warning: Possible accidental import of route file in ${file}`);
      }
    }
  });
  */

// Run next build and report
 console.log("\nRunning `npx next build` to verify...");
 try {
   execSync("npx next build", { stdio: "inherit" });
   console.log("Build succeeded.");
 } catch (e) {
   console.error("Build failed. Please check errors above.");
  process.exit(1);
 }
}

main();