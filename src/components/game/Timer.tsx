import { useEffect, useState } from 'react';

type Props = {
  until: Date;
}

export const Timer = ({ until }: Props) => {
  const [remainingMS, setRemainingMS] = useState(Math.max(until.getTime() - Date.now(), 0));

  useEffect(() => {
    const intervalID = setInterval(() => {
      const remainingMS = Math.max(until.getTime() - Date.now(), 0);
      if (remainingMS === 0) {
        clearInterval(intervalID);
      }

      setRemainingMS(remainingMS);
    }, 1000);

    return () => {
      clearInterval(intervalID);
    };
  });

  return (<span>{Math.ceil(remainingMS / 1000)} seconds</span>);
};
