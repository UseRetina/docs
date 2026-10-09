#!/usr/bin/env node

// Tells Bing which docs pages a push to main changed, so it re-reads them
// instead of waiting for its next visit to the sitemap.
//
// The product site (useretina.xyz) announces itself through IndexNow from its
// Worker. This host runs on Mintlify, which cannot serve an IndexNow key file,
// so the docs use Bing's URL Submission API instead. It needs the repository
// secret BING_WEBMASTER_API_KEY (Bing Webmaster Tools, Settings, API access);
// without it this script does nothing and succeeds.

import { execFileSync } from 'node:child_process';
import process from 'node:process';

const SITE = 'https://docs.useretina.xyz';
const key = String(process.env.BING_WEBMASTER_API_KEY || '').trim();
const before = String(process.env.BEFORE_SHA || '').trim();
const after = String(process.env.AFTER_SHA || 'HEAD').trim();
// BING_DRY_RUN=1 lists what would be sent and sends nothing, with or without a key.
const dryRun = process.env.BING_DRY_RUN === '1';

if (!key && !dryRun) {
  console.log('[bing] BING_WEBMASTER_API_KEY is not set; nothing submitted.');
  process.exit(0);
}

// A brand-new branch has no previous commit; compare with the parent instead.
const base = /^0+$/.test(before) || !before ? `${after}~1` : before;
const changed = execFileSync('git', ['diff', '--name-only', '--diff-filter=AMR', base, after], { encoding: 'utf8' })
  .split('\n')
  .map(line => line.trim())
  .filter(file => file.endsWith('.mdx'));

const routeOf = file => file.slice(0, -4).replace(/(^|\/)index$/, '');
const wanted = changed.map(file => `${SITE}/${routeOf(file)}`.replace(/\/$/, ''));
if (!wanted.length) {
  console.log('[bing] no page changed in this push; nothing submitted.');
  process.exit(0);
}

// Only pages the live sitemap lists: that is what Mintlify actually published.
const sitemap = await (await fetch(`${SITE}/sitemap.xml`, { cache: 'no-store' })).text();
const live = new Set([...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(match => match[1].replace(/\/$/, '')));
const urlList = wanted.filter(url => live.has(url));
if (!urlList.length) {
  console.log(`[bing] changed pages are not in the live sitemap yet; nothing submitted: ${wanted.join(', ')}`);
  process.exit(0);
}

if (dryRun) {
  console.log(`[bing] dry run, would submit ${urlList.length} page(s):`);
  urlList.forEach(url => console.log(`  ${url}`));
  process.exit(0);
}

const response = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${encodeURIComponent(key)}`, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ siteUrl: `${SITE}/`, urlList })
});
const body = await response.text();
console.log(`[bing] HTTP ${response.status} for ${urlList.length} page(s):`);
urlList.forEach(url => console.log(`  ${url}`));
if (!response.ok) {
  console.error(body.slice(0, 500));
  process.exit(1);
}
