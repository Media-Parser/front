import styles from "./Keyword.module.css";
import Layout from "../../components/Layout/Layout";
import { useState } from "react";

// 더미 토픽 및 이미지 데이터
const topics = Array.from({ length: 17 }, (_, i) => `토픽${i + 1}`);

const imageMap: { [key: string]: { src: string; label: string }[] } = {
  토픽1: [
    { src: "/topicimage/topic1/img1.png", label: "더불어민주당" },
    { src: "/topicimage/topic1/img2.png", label: "국민의힘" },
    { src: "/topicimage/topic1/img3.png", label: "조국혁신당" },
    { src: "/topicimage/topic1/img4.png", label: "개혁신당" },
  ],
  // 토픽2 등...
};

const Keyword = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  return (
    <Layout>
      <div className={styles.mainArea}>
        <div className={styles.mainAreaHeader}>
          <h2 className={styles.mainAreaHeaderTitle}>정당별 키워드</h2>
        </div>

        <div className={styles.Content}>
          <div className={styles.topicButtons}>
            <span className={styles.topic}>토픽 | </span>
            {topics.map((topic) => (
              <span
                key={topic}
                className={`${styles.topicText} ${
                  selectedTopic
                    ? selectedTopic === topic
                      ? styles.active
                      : styles.inactive
                    : styles.default
                }`}
                onClick={() => setSelectedTopic(topic)}
              >
                {topic}
              </span>
            ))}
          </div>

          <div className={styles.imgList}>
            {selectedTopic ? (
              imageMap[selectedTopic]?.map(({ src, label }, idx) => (
                <div key={idx} className={styles.imgItemWrapper}>
                  <img
                    src={src}
                    alt={`${selectedTopic} 이미지 ${idx + 1}`}
                    className={styles.imgItem}
                  />
                  <div className={styles.partyLabel}>{label}</div>
                </div>
              ))
            ) : (
              <p className={styles.placeholderText}>
                원하는 토픽을 선택하세요 😊
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Keyword;
