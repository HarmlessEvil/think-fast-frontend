import { CategoryHeader } from '../../components/Game/CategoryHeader.tsx';
import { QuestionValue } from '../../components/Game/QuestionValue.tsx';
import styles from './GamePage.module.css';

export const GamePage = () => (
  <>
    <header className={styles.header}>
      <h1>"Trivia Challenge" Pack</h1>
      <p>Round 1</p>
      <div className={styles.score}>
        <span>Player1: 1200</span>
        <span>Player2: 800</span>
        <span>Player3: 600</span>
      </div>
    </header>

    <form className={styles.main}>
      <CategoryHeader name="Category 1"/>
      <CategoryHeader name="Category 2"/>
      <CategoryHeader name="Category 3"/>
      <CategoryHeader name="Category 4"/>
      <CategoryHeader name="Category 5"/>

      <QuestionValue score={100} />
      <QuestionValue score={100} />
      <QuestionValue score={100} />
      <QuestionValue score={100} />
      <QuestionValue score={100} />

      <QuestionValue score={200} />
      <QuestionValue score={200} />
      <QuestionValue score={200} />
      <QuestionValue score={200} />
      <QuestionValue score={200} />
    </form>

    <form className={styles.footer}>
      <button type="submit">Buzz In</button>
      <button type="submit">Skip Question</button>
    </form>
  </>
);
