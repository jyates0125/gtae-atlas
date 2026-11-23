#!/usr/bin/env node
/** Compatibility for the previously configured Cloudflare Pages build command.
 * The canonical, security-filtered builder is build-cloudflare.cjs.
 * Keep this entry point server-side only; public/ must never contain scripts/.
 */
'use strict';
require('./build-cloudflare.cjs');
