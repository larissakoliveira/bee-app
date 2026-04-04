import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * Optional: set VITE_LCP_IMAGE_PRELOAD_URL in .env to the full optimized AVIF URL of your hero product
 * (copy from Network tab after load). Lets the browser fetch LCP image in parallel with JS.
 */
function lcpImagePreload(): Plugin {
  let preloadHref = '';
  return {
    name: 'lcp-image-preload',
    configResolved(config) {
      const env = loadEnv(config.mode, process.cwd(), 'VITE');
      preloadHref = (env.VITE_LCP_IMAGE_PRELOAD_URL ?? '').trim();
    },
    transformIndexHtml(html) {
      if (!preloadHref) return html;
      const link = `\n    <link rel="preload" as="image" href="${escapeAttr(preloadHref)}" fetchpriority="high" />`;
      return html.replace('<head>', `<head>${link}`);
    },
  };
}

/**
 * Production-only CSP (injected into built index.html). Hosts should still send HSTS + COOP via edge (see vercel.json).
 */
function cspProductionMeta(): Plugin {
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
  ].join('; ');

  return {
    name: 'csp-production-meta',
    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        if (html.includes('http-equiv="Content-Security-Policy"')) return html;
        const meta = `\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`;
        if (html.includes('<meta charset="UTF-8"')) {
          return html.replace(/<meta\s+charset="UTF-8"\s*\/?>/i, (m) => `${m}${meta}`);
        }
        return html.replace('<head>', `<head>${meta}`);
      },
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    ...(command === 'build' ? [lcpImagePreload(), cspProductionMeta()] : []),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  preview: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
  build: {
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    target: 'es2022',
    ...(command === 'build' && {
      esbuild: {
        legalComments: 'none',
        drop: ['debugger'] as const,
      },
    }),
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          i18n: ['i18next', 'react-i18next'],
          data: ['graphql-request'],
        },
      },
    },
  },
}));
