import styles from './QuestionValue.module.css';

type Props = {
  score: number
}

export const QuestionValue = ({ score }: Props) => (
  <button className={styles.questionValue} type="submit">{score}</button>
);
