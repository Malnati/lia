#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const workspaceRoot = path.dirname(repoRoot);
const expectedRepos = ['lia', 'lia-backend', 'lia-core', 'lia-pwa', 'lia-desktop', 'lia-dashboard'];
const skippedDirs = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', 'playwright-report', 'test-results', '.wrangler']);
const docAllowList = new Set(['REQ.md', 'README.md']);
const disallowedAuthDocumentationPatterns = [
  /Supabase Auth/i,
  /Login Supabase/i,
  /JWT Supabase/i,
  /auth\.users/i
];

const disallowedRuntimePatterns = [
  /github\.io/i,
  /GitHub Pages/i,
  /pages\.github/i,
  /\bgh-pages\b/i,
  /actions\/deploy-pages/i,
  /actions\/configure-pages/i,
  /actions\/upload-pages-artifact/i,
  /peaceiris\/actions-gh-pages/i,
  /JamesIves\/github-pages-deploy-action/i
];

const report = [];
const violations = [];

const requiredSemanticContractFiles = [
  ['lia/REQ.md', 'Política semântica de uso de serviços externos'],
  ['lia/README.md', 'Limites semânticos para serviços externos'],
  ['lia/docs/COVERAGE_MATRIX.md', 'Política semântica de serviços externos']
];

for (const [relativeFile, phrase] of requiredSemanticContractFiles) {
  const file = path.join(workspaceRoot, relativeFile);
  const content = fs.existsSync(file) ? readText(file) : '';
  if (!content || !content.includes(phrase)) {
    violations.push(`${relativeFile} não registra contrato semântico obrigatório: ${phrase}`);
  }
}

for (const repo of expectedRepos) {
  const root = path.join(workspaceRoot, repo);
  if (!fs.existsSync(root)) {
    report.push(`skip ${repo}: repositório local ausente neste checkout`);
    continue;
  }
  scanRepo(repo, root);
}

for (const line of report) console.log(line);

if (violations.length > 0) {
  console.error('\nContrato de runtime/autenticação violado:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log('\nOK: GitHub Pages não é runtime de app, docs não dependem de Supabase Auth e política semântica de serviços está registrada.');

function scanRepo(repo, root) {
  const files = listFiles(root);
  let matches = 0;

  for (const file of files) {
    const relative = path.relative(root, file);
    const content = readText(file);
    if (content === null) continue;

    const found = disallowedRuntimePatterns.filter((pattern) => pattern.test(content));
    const forbiddenAuthDocs = isAuthContractDocument(relative)
      ? disallowedAuthDocumentationPatterns.filter((pattern) => pattern.test(content))
      : [];
    if (found.length === 0 && forbiddenAuthDocs.length === 0) continue;
    matches += 1;

    if (forbiddenAuthDocs.length > 0) {
      violations.push(`${repo}/${relative} contém auth acoplada a provedor externo: ${forbiddenAuthDocs.map(String).join(', ')}`);
      continue;
    }

    if (isAllowedDocumentation(relative)) {
      report.push(`allow ${repo}/${relative}: referência documental restrita a guia/contrato`);
      continue;
    }

    if (isAllowedRuntimeContractGuard(relative, content)) {
      report.push(`allow ${repo}/${relative}: guarda automatizada anti-GitHub Pages runtime`);
      continue;
    }

    violations.push(`${repo}/${relative} contém ${found.map(String).join(', ')}`);
  }

  validateWorkflowNames(repo, root);
  report.push(`scan ${repo}: ${files.length} arquivos, ${matches} referência(s) classificadas`);
}

function validateWorkflowNames(repo, root) {
  const workflows = path.join(root, '.github', 'workflows');
  if (!fs.existsSync(workflows)) return;
  for (const file of listFiles(workflows)) {
    const relative = path.relative(root, file);
    const content = readText(file);
    if (content === null) continue;
    if (/GitHub Pages/i.test(content) && !/guia|docs|documentation|documenta/i.test(content)) {
      violations.push(`${repo}/${relative} menciona GitHub Pages sem restringir a documentação/guias`);
    }
  }
}

function isAuthContractDocument(relative) {
  if (docAllowList.has(relative)) return true;
  return relative.startsWith(`docs${path.sep}`) && relative.endsWith('.md');
}

function isAllowedDocumentation(relative) {
  if (relative === path.join('scripts', 'validate-runtime-contract.mjs')) return true;
  if (docAllowList.has(relative)) return true;
  return relative.startsWith(`docs${path.sep}`) && relative.endsWith('.md');
}

function isAllowedRuntimeContractGuard(relative, content) {
  const isTestOrPortalSource = relative.startsWith(`tests${path.sep}`) || relative.startsWith(path.join('apps', 'web', 'src'));
  if (!isTestOrPortalSource) return false;
  return /GitHub Pages só pode ser guia|forbiddenGitHubRuntime|not\.toMatch\(/i.test(content);
}

function listFiles(root) {
  const out = [];
  walk(root, out);
  return out;
}

function walk(current, out) {
  const entries = fs.readdirSync(current, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) {
      if (!skippedDirs.has(entry.name)) walk(full, out);
      continue;
    }
    if (entry.isFile()) out.push(full);
  }
}

function readText(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.includes(0)) return null;
  return buffer.toString('utf8');
}
