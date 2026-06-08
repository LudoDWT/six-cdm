import { useState } from 'react'
import { toast } from 'sonner'
import { CalendarClock } from 'lucide-react'
import { useUpsertBonus } from '@/hooks/useBonus'
import { isLocked } from '@/lib/lock'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface BonusQuestion {
  id: number
  label: string
  lock_at: string
  points: number
  correct_answer: string | null
}

export function formatBonusDeadline(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function BonusQuestionCard({
  question,
  initialAnswer,
  userId,
}: {
  question: BonusQuestion
  initialAnswer: string
  userId: string
}) {
  const [answer, setAnswer] = useState(initialAnswer)
  const upsert = useUpsertBonus()
  const locked = isLocked(question.lock_at)
  const answered = initialAnswer.trim() !== ''

  function handleSubmit() {
    upsert.mutate(
      { user_id: userId, bonus_question_id: question.id, answer },
      {
        onSuccess: () => toast.success('Réponse enregistrée 🎯'),
        onError: (err) =>
          toast.error(`Erreur : ${err instanceof Error ? err.message : 'inconnue'}`),
      },
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-medium">{question.label}</CardTitle>
          <Badge className="bg-festival-gold font-display text-foreground">
            +{question.points} pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={locked}
            placeholder={locked ? 'Verrouillé' : 'Votre réponse…'}
            className="flex-1"
          />
          {!locked && (
            <Button onClick={handleSubmit} disabled={upsert.isPending || answer.trim() === ''} size="sm">
              {answered ? 'Modifier' : 'Valider'}
            </Button>
          )}
        </div>
        {!locked && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5" />
            À valider avant le {formatBonusDeadline(question.lock_at)}
          </p>
        )}
        {question.correct_answer != null && (
          <p className="text-sm text-muted-foreground">
            Bonne réponse :{' '}
            <span className="font-medium text-foreground">{question.correct_answer}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
