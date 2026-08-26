/**
 * Resolves a public-folder asset path relative to the Vite base URL.
 * Use instead of hardcoded `/assets/...` strings so the app works
 * both locally and on GitHub Pages (or any non-root deploy).
 *
 * @example  assetUrl('assets/page-front.png')  →  '/boda_montse_sayd/assets/page-front.png'
 */
export function assetUrl(path: string): string {
  // import.meta.env.BASE_URL always ends with '/'
  return `${import.meta.env.BASE_URL}${path}`
}
