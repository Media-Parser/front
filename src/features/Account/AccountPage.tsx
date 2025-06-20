import { useEffect, useState } from "react";
import styles from "./Account.module.css";
import Layout from "../../components/Layout/Layout";
import type { UserInfo } from "../../types/documentType";
import { getUserInfoApi } from "../../lib/api/documentsApi";

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
        <div className={styles.deleteAccount}>
          <button
            className={styles.deleteButton}
            onClick={() => {
              if (window.confirm("정말로 계정을 삭제하시겠습니까?")) {
                // 계정 삭제 로직을 여기에 추가
                console.log("계정 삭제 요청");
              }
            }}
          >
            계정 삭제
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage;
