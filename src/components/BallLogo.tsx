import { cn } from '@/lib/utils'

/**
 * Ballon de foot reconnaissable : disque blanc, grand pentagone central foncé
 * et coutures courtes (motif via `currentColor`). À poser sur un fond coloré.
 */
export function BallLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn('size-5', className)}>
      <circle cx="16" cy="16" r="13" fill="white" />
      {/* pentagone central foncé */}
      <polygon
        points="16,10 21.71,14.15 19.53,20.85 12.47,20.85 10.29,14.15"
        fill="currentColor"
      />
      {/* coutures courtes vers les panneaux voisins */}
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="16" y1="10" x2="16" y2="6.3" />
        <line x1="21.71" y1="14.15" x2="24.7" y2="13.1" />
        <line x1="19.53" y1="20.85" x2="21.4" y2="23.5" />
        <line x1="12.47" y1="20.85" x2="10.6" y2="23.5" />
        <line x1="10.29" y1="14.15" x2="7.3" y2="13.1" />
      </g>
      <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
