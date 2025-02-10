import styles from './QuestionValue.module.css';

type Props = {
  disabled: boolean
  questionIndex: number
  score: number
  themeIndex: number
}

export const QuestionValue = (
  {
    disabled,
    questionIndex,
    score,
    themeIndex,
  }: Props,
) => (
  <button
    className={styles.questionValue}
    disabled={disabled}
    type="submit"
    name="question"
    value={`${themeIndex}:${questionIndex}`}
  >
    {score}
  </button>
);
