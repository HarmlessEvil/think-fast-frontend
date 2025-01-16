import { Outlet } from 'react-router-dom';
import styles from './App.module.css';

export const App = () => (
  <>
    <Outlet/>
    <footer className={styles.footer}>
      <p>© 2025 Think Fast! <a className={styles.privacyPolicy} href="#">Privacy Policy</a></p>
    </footer>
  </>
);
