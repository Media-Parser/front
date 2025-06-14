// 📁 src/components/Common/LoadingOrError.tsx
import styles from "./LoadingOrError.module.css";

interface Props {
  loading: boolean;
  error: string | null;
}

const LoadingOrError = ({ loading, error }: Props) => {
  if (loading) return <div className={styles.loading}>불러오는 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  return null;
};

export default LoadingOrError;
