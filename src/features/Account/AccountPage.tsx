import { useEffect, useState } from "react";
import styles from "./Account.module.css";
import Layout from "../../components/Layout/Layout";
import type { UserInfo } from "../../types/documents_type";
import { getUserInfoApi } from "../../lib/api/documents_api";

const AccountPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user_id) return;
      try {
        const res = await getUserInfoApi(user_id); // ✅ user_id는 string으로 확정됨
        setUserInfo(res.data as UserInfo);
      } catch (error) {
        console.error("사용자 정보를 불러오는 데 실패했습니다.", error);
      }
    };
    fetchUserInfo();
  }, [user_id]);

  return (
    <Layout>
      <div className={styles.mainArea}>
        <div className={styles.mainAreaHeader}>
          <h2>사용자 개인정보</h2>
        </div>
        <div className={styles.Content}>
          <br />
          <div className={styles.infoRow}>
            <span className={styles.label}>이름</span>
            <span className={styles.value}>{userInfo?.user_name ?? "-"}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>이메일</span>
            <span className={styles.value}>{userInfo?.user_email ?? "-"}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>연결계정</span>
            <span className={styles.value}>{userInfo?.provider ?? "-"}</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage;
