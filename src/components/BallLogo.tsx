import { cn } from '@/lib/utils'

/** Ballon de foot stylisé, en trait (hérite de `currentColor`). */
export function BallLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn('size-5', className)}
    >
      <circle cx="12" cy="12" r="9.25" />
      {/* pentagone central */}
      <path d="M12 7.1l3.14 2.28-1.2 3.69H10.06l-1.2-3.69L12 7.1z" />
      {/* coutures vers l'extérieur */}
      <path d="M12 7.1V3.2" />
      <path d="M15.14 9.38l3.5-1.16" />
      <path d="M13.94 13.07l2.2 3.02" />
      <path d="M10.06 13.07l-2.2 3.02" />
      <path d="M8.86 9.38L5.36 8.22" />
    </svg>
  )
}
