// src/components/Header/Header.tsx
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>기잣·말ᄊᆞ미</h1>
      <hr className={styles.divider} />
    </header>
  );
};

export default Header;
