import { cn } from '@/lib/utils'

// Pentagone unité (rayon 1) pointant vers le haut
const PENTA = '0,-1 0.951,-0.309 0.588,0.809 -0.588,0.809 -0.951,-0.309'

/**
 * Ballon de foot « Telstar » : disque blanc + 6 panneaux pentagonaux foncés
 * (1 central + 5 en couronne). Motif via `currentColor`. À poser sur fond coloré.
 */
export function BallLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn('size-5', className)}>
      <circle cx="16" cy="16" r="13" fill="white" stroke="currentColor" strokeWidth="1.4" />
      <g fill="currentColor">
        <polygon points={PENTA} transform="translate(16 16) scale(4.3)" />
        <polygon points={PENTA} transform="translate(16 16) rotate(36) translate(0 -9.3) scale(2.3) rotate(180)" />
        <polygon points={PENTA} transform="translate(16 16) rotate(108) translate(0 -9.3) scale(2.3) rotate(180)" />
        <polygon points={PENTA} transform="translate(16 16) rotate(180) translate(0 -9.3) scale(2.3) rotate(180)" />
        <polygon points={PENTA} transform="translate(16 16) rotate(252) translate(0 -9.3) scale(2.3) rotate(180)" />
        <polygon points={PENTA} transform="translate(16 16) rotate(324) translate(0 -9.3) scale(2.3) rotate(180)" />
      </g>
    </svg>
  )
}
