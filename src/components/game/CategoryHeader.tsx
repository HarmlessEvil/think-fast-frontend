import styles from './CategoryHeader.module.css';

type Props = {
  name: string;
}

export const CategoryHeader = ({ name }: Props) => (
  <div className={styles.categoryHeader}>{name}</div>
);
