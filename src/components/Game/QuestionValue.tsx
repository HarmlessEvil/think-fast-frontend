import styles from './QuestionValue.module.css';

type Props = {
  questionIndex: number
  score: number
  themeIndex: number
}

export const QuestionValue = ({ questionIndex, score, themeIndex }: Props) => (
  <button className={styles.questionValue} type="submit" name="question" value={`${themeIndex}:${questionIndex}`}>
    {score}
  </button>
);
