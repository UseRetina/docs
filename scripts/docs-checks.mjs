#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const config = readJson('docs.json');
const metadata = readJson('docs-meta.json');
const sourceMap = readJson('product-docs-map.json');
const errors = [];

function walk(directory) {
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap(entry => {
    const relative = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(relative) : [relative.replaceAll('\\', '/')];
  });
}

function navigationPages(node) {
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(navigationPages);
  if (!node || typeof node !== 'object') return [];
  return Object.values(node).flatMap(navigationPages);
}

const mdxFiles = walk('.').filter(file => file.endsWith('.mdx')).sort();
const fileRoutes = mdxFiles.map(file => file.slice(0, -4));
const navRoutes = (config.navigation?.groups || []).flatMap(group => navigationPages(group?.pages || []));
const routeSet = new Set(fileRoutes);

for (const route of navRoutes) {
  if (!routeSet.has(route)) errors.push(`Navigation points to missing page: ${route}`);
}

for (const route of fileRoutes) {
  if (!navRoutes.includes(route)) errors.push(`MDX page is missing from navigation: ${route}`);
}

if (new Set(navRoutes).size !== navRoutes.length) errors.push('Navigation contains a duplicate page.');

const metaRoutes = Object.keys(metadata.pages || {}).sort();
const mappedRoutes = Object.keys(sourceMap.pages || {}).sort();
for (const route of fileRoutes) {
  if (!metaRoutes.includes(route)) errors.push(`Missing docs-meta entry: ${route}`);
  if (!mappedRoutes.includes(route)) errors.push(`Missing product source mapping: ${route}`);
}
for (const route of metaRoutes) if (!routeSet.has(route)) errors.push(`docs-meta references a missing page: ${route}`);
for (const route of mappedRoutes) if (!routeSet.has(route)) errors.push(`product-docs-map references a missing page: ${route}`);

const redirects = Array.isArray(config.redirects) ? config.redirects : [];
const redirectSources = new Set();
for (const redirect of redirects) {
  if (!redirect?.source || !redirect?.destination) {
    errors.push('Every redirect needs a source and destination.');
    continue;
  }
  if (redirectSources.has(redirect.source)) errors.push(`Duplicate redirect source: ${redirect.source}`);
  redirectSources.add(redirect.source);
  const destination = String(redirect.destination).replace(/^\//, '').replace(/\/$/, '');
  if (!routeSet.has(destination)) errors.push(`Redirect destination is missing: ${redirect.destination}`);
}

const forbidden = [
  /there is no account/i,
  /no database/i,
  /no email/i,
  /manual snapshots only/i,
  /no background snapshots?/i,
  /single-device/i,
  /Arcium/i,
  /we cannot read/i,
  /password-gated/i,
  /DM[^\n]*password/i,
  /\{\/\*\s*TODO:/i
];

for (const file of mdxFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  if (/\u2014|&mdash;|&#8212;|&#x2014;/i.test(content)) errors.push(`${file}: contains an em dash.`);
  if (/!\[[^\]]*\]\(|<img\b|<video\b/i.test(content)) errors.push(`${file}: documentation pages cannot contain product imagery.`);
  if (!/^---\r?\n[\s\S]+?\r?\n---\r?\n/.test(content)) errors.push(`${file}: missing frontmatter.`);
  if (!/^title:\s*".+"\s*$/m.test(content)) errors.push(`${file}: missing quoted title.`);
  if (!/^description:\s*".+"\s*$/m.test(content)) errors.push(`${file}: missing quoted description.`);
  if (!/Last verified: \d{1,2} [A-Z][a-z]+ \d{4}\./.test(content)) errors.push(`${file}: missing visible verification date.`);
  for (const pattern of forbidden) if (pattern.test(content)) errors.push(`${file}: contains stale or unfinished wording matching ${pattern}.`);

  const words = content
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\p{L}\p{N}']+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length > 1200) errors.push(`${file}: ${words.length} words exceeds the 1200-word page limit.`);

  const links = [
    ...content.matchAll(/\]\((\/[^)\s]+)\)/g),
    ...content.matchAll(/href=["'](\/[^"']+)["']/g)
  ].map(match => match[1]);
  for (const link of links) {
    const route = link.split('#')[0].split('?')[0].replace(/^\//, '').replace(/\/$/, '');
    if (route && !routeSet.has(route)) errors.push(`${file}: broken internal link ${link}`);
  }
}

if (config.metadata?.timestamp !== true) errors.push('docs.json must enable Git-derived last-modified timestamps.');

if (errors.length) {
  console.error(`[docs checks] ${errors.length} problem${errors.length === 1 ? '' : 's'} found:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`[docs checks] ${mdxFiles.length} pages passed navigation, metadata, link, freshness, image, and style checks.`);
