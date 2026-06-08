import { Trophy, Target, Lock, Coins, CheckCircle2 } from 'lucide-react'
import { useBonusQuestions } from '@/hooks/useBonus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PRIZE_SPLIT, CONTRIB_STEP } from '@/lib/prize'

function Example({ pred, real, pts, label }: { pred: string; real: string; pts: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary/40 px-3 py-2 text-sm">
      <span>
        Prono <span className="font-display">{pred}</span> · Résultat{' '}
        <span className="font-display">{real}</span>
      </span>
      <span className="flex items-center gap-2">
        <span className="text-muted-foreground">{label}</span>
        <Badge className="bg-primary font-display text-primary-foreground">{pts}</Badge>
      </span>
    </div>
  )
}

export function ReglesPage() {
  const { data: bonusQuestions } = useBonusQuestions()
  const splitPct = PRIZE_SPLIT.map((p) => Math.round(p * 100))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl leading-none">Règles &amp; barème</h1>
        <div className="festival-rule mt-2 h-1 w-16 rounded-full" />
        <p className="mt-2 text-sm text-muted-foreground">
          Tout le monde joue avec les mêmes règles. Voici exactement comment les points sont
          attribués.
        </p>
      </div>

      {/* Barème des matchs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="size-4 text-primary" /> Pronostics de match
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
              <span>
                <span className="font-semibold">Bon résultat</span> (bon vainqueur, ou match nul
                bien prévu) ={' '}
                <span className="font-semibold text-primary">1 point</span>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
              <span>
                <span className="font-semibold">Score exact</span> ={' '}
                <span className="font-semibold text-primary">3 points</span>
              </span>
            </li>
          </ul>
          <p className="text-muted-foreground">
            Le score exact <span className="font-medium text-foreground">remplace</span> le point de
            résultat (il ne s'additionne pas) : un score exact rapporte 3 points, pas 4.
          </p>
          <div className="space-y-2 pt-1">
            <Example pred="2 - 1" real="2 - 1" label="score exact" pts="3 pts" />
            <Example pred="2 - 1" real="3 - 0" label="bon vainqueur" pts="1 pt" />
            <Example pred="1 - 1" real="0 - 0" label="bon nul" pts="1 pt" />
            <Example pred="2 - 1" real="0 - 2" label="raté" pts="0 pt" />
          </div>
        </CardContent>
      </Card>

      {/* Verrouillage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="size-4 text-primary" /> Verrouillage
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Chaque pronostic est modifiable <span className="font-medium text-foreground">jusqu'au
          coup d'envoi</span> du match, puis figé. C'est garanti côté serveur — impossible de parier
          un match commencé. Les pronostics de chacun sont visibles par tous.
        </CardContent>
      </Card>

      {/* Bonus tournoi */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-4 text-festival-gold" /> Bonus tournoi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Des pronostics « tournoi » à valider{' '}
            <span className="font-medium text-foreground">au plus tard le 14 juin à 23h59</span>.
            Chaque bonne réponse rapporte les points indiqués.
          </p>
          <ul className="divide-y divide-border">
            {(bonusQuestions ?? []).map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-2 py-2">
                <span>{q.label}</span>
                <Badge className="bg-festival-gold font-display text-foreground">
                  +{q.points} pts
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Cagnotte */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Coins className="size-4 text-festival-gold" /> Cagnotte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Participation par tranches de{' '}
            <span className="font-semibold text-foreground">{CONTRIB_STEP}€</span>. À la fin, la
            cagnotte est répartie entre les 3 premiers contributeurs au classement général :{' '}
            <span className="font-semibold text-foreground">
              {splitPct[0]}% / {splitPct[1]}% / {splitPct[2]}%
            </span>
            .
          </p>
          <p>Seuls les joueurs ayant contribué peuvent remporter une part.</p>
        </CardContent>
      </Card>
    </div>
  )
}
