import styles from './QuestionValue.module.css';

type Props = {
  isPlayed: boolean
  questionID: string
  score: number
}

export const QuestionValue = (
  {
    isPlayed,
    questionID,
    score,
  }: Props,
) => (
  <button
    className={styles.questionValue}
    disabled={isPlayed}
    type="submit"
    name="question"
    value={questionID}
  >
    {isPlayed && '(X)'}{score}
  </button>
);
