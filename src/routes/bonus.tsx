import { useBonusQuestions, useBonusPredictions } from '@/hooks/useBonus'
import { useAuth } from '@/hooks/useAuth'
import { BonusQuestionCard } from '@/components/BonusQuestionCard'

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
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-4xl leading-none">Questions Bonus</h1>
        <div className="festival-rule mt-2 h-1 w-16 rounded-full" />
        <p className="mt-2 text-sm text-muted-foreground">
          Des points en plus pour les pronos audacieux — à valider{' '}
          <span className="font-semibold text-foreground">au plus tard le 14 juin à 23h59</span>.
        </p>
      </div>
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
