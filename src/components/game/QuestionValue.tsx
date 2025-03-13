import styles from './QuestionValue.module.css';

type Props = {
  disabled?: boolean
  isPlayed: boolean
  questionID: string
  score: number
}

export const QuestionValue = (
  {
    disabled = false,
    isPlayed,
    questionID,
    score,
  }: Props,
) => (
  <button
    className={styles.questionValue}
    disabled={disabled || isPlayed}
    type="submit"
    name="question"
    value={questionID}
  >
    {isPlayed && '(X)'}{score}
  </button>
);
