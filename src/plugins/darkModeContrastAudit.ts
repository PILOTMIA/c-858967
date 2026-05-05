/**
 * Vite plugin: Dark Mode Contrast Audit
 * Flags low-contrast or near-transparent text classes at build/transform time.
 * Emits warnings for hardcoded color classes that may be invisible in dark mode.
 */

const FORBIDDEN_PATTERNS = [
  // Hardcoded text colors that lack dark-mode variants
  /(?<!dark:)text-(gray|slate|zinc|neutral|stone)-[1-4]00(?!\s)/g,
  /(?<!dark:)text-black(?!\s)/g,
  // Near-transparent text opacity
  /text-[a-z]+-\d+\/[0-2]\d?\b/g,
  // Explicit low opacity on text containers
  /opacity-(?:[0-9]|1[0-9]|20)\b/g,
  // text-transparent without bg-clip-text (gradient text is OK)
  /text-transparent(?!.*bg-clip-text)/g,
];

// Patterns that are acceptable (dark mode variant present on same element)
const SAFE_PATTERNS = [
  /dark:text-/,
  /bg-clip-text/,
  /bg-gradient/,
];

export function darkModeContrastAudit() {
  return {
    name: 'dark-mode-contrast-audit',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      // Only check TSX/JSX component files in src/
      if (!id.includes('/src/') || !/\.(tsx|jsx)$/.test(id)) return null;
      // Skip UI primitives
      if (id.includes('/ui/')) return null;

      const lines = code.split('\n');
      const warnings: string[] = [];

      lines.forEach((line, idx) => {
        // Skip imports/comments
        if (line.trimStart().startsWith('import ') || line.trimStart().startsWith('//')) return;
        // If line has a dark: variant it's likely intentional
        if (SAFE_PATTERNS.some(p => p.test(line))) return;

        for (const pattern of FORBIDDEN_PATTERNS) {
          pattern.lastIndex = 0;
          let match;
          while ((match = pattern.exec(line)) !== null) {
            // Skip if bg-clip-text is on same line (gradient text)
            if (/bg-clip-text/.test(line)) continue;
            warnings.push(
              `  ⚠️  Line ${idx + 1}: "${match[0]}" may be invisible in dark mode`
            );
          }
        }
      });

      if (warnings.length > 0) {
        const shortPath = id.replace(/^.*\/src\//, 'src/');
        console.warn(
          `\n🌙 Dark Mode Contrast Audit: ${shortPath}\n${warnings.join('\n')}\n`
        );
      }

      return null; // Don't modify the code
    },
  };
}
