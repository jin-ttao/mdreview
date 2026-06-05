#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const uiPath = path.join(projectRoot, "src", "ui.html");
const args = process.argv.slice(2);
const noOpen = args.includes("--no-open");
const query = args.filter((arg) => arg !== "--no-open").join(" ").trim();

if (!query) {
  console.error("Usage: mdreview <markdown-path-or-query>");
  process.exit(1);
}

const cwd = process.cwd();
const roots = uniqueExistingDirs([
  cwd,
  path.join(os.homedir(), "Desktop", "home", "code"),
]);

const target = await resolveTarget(query, roots);
if (!target) process.exit(1);

const markdown = fs.readFileSync(target, "utf8");
const title = path.basename(target);

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");

  if (url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync(uiPath, "utf8"));
    return;
  }

  if (url.pathname === "/api/document") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      title,
      file: path.relative(cwd, target).startsWith("..") ? target : path.relative(cwd, target),
      absolutePath: target,
      markdown,
    }));
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

server.listen(0, "127.0.0.1", () => {
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}/`;
  console.log(`mdreview opened: ${target}`);
  console.log(url);
  if (!noOpen) openBrowser(url);
});

function uniqueExistingDirs(items) {
  return [...new Set(items)]
    .map((item) => path.resolve(item))
    .filter((item) => fs.existsSync(item) && fs.statSync(item).isDirectory());
}

async function resolveTarget(input, searchRoots) {
  const exact = path.resolve(cwd, input);
  if (fs.existsSync(exact) && fs.statSync(exact).isFile()) {
    return exact;
  }

  const matches = [];
  const needle = input.toLowerCase().replace(/\.md$/, "");

  for (const root of searchRoots) {
    walk(root, (file) => {
      if (!file.endsWith(".md")) return;
      const base = path.basename(file, ".md").toLowerCase();
      const relative = path.relative(root, file).toLowerCase();
      if (base.includes(needle) || relative.includes(needle)) {
        matches.push(file);
      }
    });
  }

  const deduped = [...new Set(matches)].sort();
  if (deduped.length === 0) {
    console.error(`No Markdown file matched "${input}".`);
    console.error("Searched roots:");
    for (const root of searchRoots) console.error(`- ${root}`);
    return null;
  }

  if (deduped.length === 1) return deduped[0];

  console.log(`Multiple files matched "${input}":`);
  deduped.slice(0, 20).forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });

  const answer = await ask(`Choose 1-${Math.min(deduped.length, 20)}: `);
  const index = Number(answer) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= Math.min(deduped.length, 20)) {
    console.error("Invalid selection.");
    return null;
  }

  return deduped[index];
}

function walk(dir, onFile) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, onFile);
    } else if (entry.isFile()) {
      onFile(fullPath);
    }
  }
}

function ask(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function openBrowser(url) {
  const platform = process.platform;
  const command = platform === "darwin" ? "open" : platform === "win32" ? "cmd" : "xdg-open";
  const args = platform === "win32" ? ["/c", "start", url] : [url];
  const child = spawn(command, args, { stdio: "ignore", detached: true });
  child.unref();
}
