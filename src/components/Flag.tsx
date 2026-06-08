import { cn } from '@/lib/utils'
import { teamCountryCode } from '@/lib/flags'

interface Props {
  team: string
  className?: string
}

/**
 * Drapeau SVG (via flag-icons) d'une équipe. Robuste cross-plateforme
 * (contrairement aux emoji drapeaux, invisibles sous Windows).
 * Pour un placeholder de phase finale (sans pays), affiche une pastille « ? ».
 */
export function Flag({ team, className }: Props) {
  const code = teamCountryCode(team)
  if (!code) {
    return (
      <span
        aria-hidden
        className={cn(
          'grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground',
          className,
        )}
      >
        ?
      </span>
    )
  }
  return (
    <span
      role="img"
      aria-label={team}
      className={cn(
        `fi fi-${code}`,
        'inline-block h-4 w-[22px] shrink-0 rounded-[3px] bg-cover bg-center shadow-sm ring-1 ring-black/10',
        className,
      )}
    />
  )
}
