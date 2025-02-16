import React from 'react';
import styles from './QuestionBoard.module.css';
import { CategoryHeader } from './CategoryHeader.tsx';
import { QuestionValue } from './QuestionValue.tsx';

export type Question = {
  questionIndex: number
  themeIndex: number
}

type Theme = {
  name: string
  questions: {
    points: number
    text: string
  }[]
}

type Props = {
  onQuestionChosen: (question: Question) => void
  playedQuestions: Set<string>
  themes: Theme[]
}

// TODO: Show which player selects a question

export const QuestionBoard = (
  {
    onQuestionChosen,
    playedQuestions,
    themes,
  }: Props,
) => {
  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();

    const submitter = e.nativeEvent.submitter;
    if (!submitter || (!(submitter instanceof HTMLButtonElement) && !(submitter instanceof HTMLInputElement))) {
      return;
    }

    const questionID = submitter.value;

    const [themeIndex, questionIndex] = questionID.split(':', 2).map(Number);
    onQuestionChosen({ questionIndex, themeIndex });
  };

  return (
    <form className={styles.board} onSubmit={onSubmit}>
      {themes.map((theme) => (
        <CategoryHeader key={theme.name} name={theme.name}/>
      ))}

      {themes.map((theme, themeIndex) =>
        theme.questions.map((question, questionIndex) => {
          const questionID = `${themeIndex}:${questionIndex}`;

          return (
            <QuestionValue
              key={questionID}
              isPlayed={playedQuestions.has(questionID)}
              questionID={questionID}
              score={question.points}
            />
          );
        }))}
    </form>
  );
};
