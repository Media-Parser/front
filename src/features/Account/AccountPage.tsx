/* 📁 src/features/Account/AccountPage.tsx */
import styles from "./Account.module.css";
import Layout from "../../components/Layout/Layout";

const AccountPage: React.FC = () => {
  return (
    <Layout>
      <div className={styles.mainArea}>
        <div className={styles.mainAreaHeader}>
          <h2>사용자 개인정보</h2>
        </div>
        <div className={styles.Content}>
          <br></br>
          <div className={styles.infoRow}>
            <span className={styles.label}>이름</span>
            <span className={styles.value}>홍길동</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>비밀번호</span>
            <span className={styles.value}>********</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>이메일</span>
            <span className={styles.value}>honggildong@example.com</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>연결계정</span>
            <span className={styles.value}>카카오</span>
          </div>
        </div>
      </div>  
    </Layout>
  );
};

export default AccountPage;
