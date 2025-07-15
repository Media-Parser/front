import styles from "./Keyword.module.css";
import Layout from "../../components/Layout/Layout";
import { useState, useEffect } from "react";

// 더미 토픽 및 이미지 데이터
const topics = Array.from({ length: 18 }, (_, i) => `토픽${i + 1}`);

const partyImageInfo = [
  { name: "더불어민주당", max: 18 },
  { name: "국민의힘", max: 18 },
  { name: "개혁신당", max: 18 },
  { name: "조국혁신당", max: 15 },
];

const generateImageMap = () => {
  const result: {
    [key: string]: { src: string; label: string }[];
  } = {};

  for (let i = 0; i <= 17; i++) {
    const topicKey = `토픽${i + 1}`; // 화면에 표시할 토픽명 (1부터 시작)
    result[topicKey] = partyImageInfo.map(({ name, max }) => {
      const fileIndex = i; // i 자체가 0부터 시작해서 파일명 인덱스와 일치
      const safeIndex = Math.min(fileIndex, max - 1);
      return {
        label: name,
        src: `/topicimage/topic${i}/${name}_topic_${safeIndex}.png`,
      };
    });
  }

  return result;
};

const ImageWithFallback = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  return error ? (
    <div className={styles.imageFallback}>
      해당 Topic에 대한 내용이 없습니다
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={styles.imgItem}
      onError={() => setError(true)}
    />
  );
};

const imageMap = generateImageMap();

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
                  <ImageWithFallback
                    src={src}
                    alt={`${selectedTopic} 이미지 ${idx + 1}`}
                  />
                  <div className={styles.partyLabel}>▪️{label}</div>
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
