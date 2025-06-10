// src/components/Header.tsx
import styles from "./Header.module.css";
import logoImage from "../../assets/logo.png";

const Header = () => {
  return (
    <div className={styles.appHeader}>
      <div className={styles.title}>
        <img className={styles.logoImage} src={logoImage} alt="로고" />
      </div>
      <hr className={styles.divider} />
    </div>
  );
};

export default Header;
