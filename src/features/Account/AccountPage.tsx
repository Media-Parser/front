import { useEffect, useState } from "react";
import styles from "./Account.module.css";
import Layout from "../../components/Layout/Layout";
import type { UserInfo } from "../../types/documentType";
import { getUserInfoApi } from "../../lib/api/documentsApi";
import { deleteUserApi } from "../../lib/api/documentsApi"; 
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const AccountPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.userId);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userId) return;
      try {
        const res = await getUserInfoApi(userId);
        setUserInfo(res.data as UserInfo);
      } catch (error) {
        console.error("사용자 정보를 불러오는 데 실패했습니다.", error);
      }
    };
    fetchUserInfo();
  }, [userId]);

  const handleDeleteAccount = async () => {
    if (!userId) return;
    if (!window.confirm("정말로 회원탈퇴하시겠습니까?")) return;
    try {
      await deleteUserApi(userId);
      alert("회원탈퇴가 성공적으로 완료되었습니다.");
      clearAuth();
      navigate("/login");
    } catch (error) {
      alert("회원탈퇴에 실패했습니다. 다시 시도해 주세요.");
      console.error("회원탈퇴 실패:", error);
    }
  };

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
            onClick={handleDeleteAccount}
          >
            회원 탈퇴
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage;
