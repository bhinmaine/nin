// src/components/NINLogo.tsx
// SVG recreation of the classic NIN logo (white on black, bordered rectangle)

export function NINLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Nine Inch Nails"
    >
      {/* Outer black background */}
      <rect width="200" height="120" fill="black" />
      {/* White border rectangle */}
      <rect x="6" y="6" width="188" height="108" fill="white" />
      {/* Inner black box */}
      <rect x="16" y="16" width="168" height="88" fill="black" />

      {/* N — left */}
      <polygon points="24,92 24,28 40,28 56,64 56,28 68,28 68,92 52,92 36,56 36,92" fill="white" />

      {/* I — middle */}
      <rect x="82" y="28" width="14" height="64" fill="white" />

      {/* N — right (mirrored) */}
      <polygon points="176,92 176,28 160,28 144,64 144,28 132,28 132,92 148,92 164,56 164,92" fill="white" />
    </svg>
  );
}
