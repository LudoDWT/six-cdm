import { useState } from 'react'
import { toast } from 'sonner'
import { useBonusQuestions, useBonusPredictions, useUpsertBonus } from '@/hooks/useBonus'
import { useAuth } from '@/hooks/useAuth'
import { isLocked } from '@/lib/lock'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function BonusQuestionCard({
  question,
  initialAnswer,
  userId,
}: {
  question: { id: number; label: string; lock_at: string; points: number; correct_answer: string | null }
  initialAnswer: string
  userId: string
}) {
  const [answer, setAnswer] = useState(initialAnswer)
  const upsert = useUpsertBonus()
  const locked = isLocked(question.lock_at)

  function handleSubmit() {
    upsert.mutate(
      { user_id: userId, bonus_question_id: question.id, answer },
      {
        onSuccess: () => toast.success('Réponse enregistrée'),
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
          <Badge variant="secondary">{question.points} pts</Badge>
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
            <Button
              onClick={handleSubmit}
              disabled={upsert.isPending || answer.trim() === ''}
              size="sm"
            >
              Valider
            </Button>
          )}
        </div>
        {question.correct_answer != null && (
          <p className="text-sm text-muted-foreground">
            Bonne réponse : <span className="font-medium text-foreground">{question.correct_answer}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function BonusPage() {
  const { data: questions, isLoading: qLoading, error: qError } = useBonusQuestions()
  const { data: predictions, isLoading: pLoading, error: pError } = useBonusPredictions()
  const { session } = useAuth()

  const isLoading = qLoading || pLoading
  const error = qError ?? pError

  if (isLoading) {
    return <div className="text-muted-foreground">Chargement…</div>
  }

  if (error) {
    return <div className="text-destructive">Erreur lors du chargement des questions bonus.</div>
  }

  const userId = session?.user.id

  // Map bonus_question_id -> answer for current user
  const myAnswers = new Map<number, string>()
  if (predictions && userId) {
    for (const pred of predictions) {
      if (pred.user_id === userId) {
        myAnswers.set(pred.bonus_question_id, pred.answer)
      }
    }
  }

  if (!userId) {
    return <div className="text-muted-foreground">Non connecté.</div>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Questions Bonus</h1>
      {(questions ?? []).length === 0 ? (
        <p className="text-muted-foreground">Aucune question bonus pour l'instant.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(questions ?? []).map((q) => (
            <BonusQuestionCard
              key={q.id}
              question={q}
              initialAnswer={myAnswers.get(q.id) ?? ''}
              userId={userId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
