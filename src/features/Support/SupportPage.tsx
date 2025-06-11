import styles from "./SupportPage.module.css";
import Layout from "../../components/Layout/Layout";
import React, { useState } from "react";

const SupportPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiryType: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("폼 제출됨:", formData);
    // TODO: 실제 문의사항 처리 로직 (API 호출 등)
    alert("문의가 제출되었습니다.");
  };

  return (
    <Layout>
      <div className={styles.mainArea}>
        <div className={styles.mainAreaHeader}>
          <h2 className={styles.mainAreaHeaderTitle}>지원</h2>
        </div>
        <div className={styles.Content}>
          <span className={styles.default}>
            자세한 사항은 media-parser@gmail.com으로 연락주세요.
          </span>
          <div className={styles.formArea}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.label}>
                이름
                <input
                  type="text"
                  name="name"
                  className={styles.input}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className={styles.label}>
                이메일
                <input
                  type="email"
                  name="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className={styles.label}>
                문의 유형
                <select
                  name="inquiryType"
                  className={styles.select}
                  value={formData.inquiryType}
                  onChange={handleChange}
                  required
                >
                  <option value="">선택해주세요</option>
                  <option value="account">계정 관련</option>
                  <option value="bug">버그 신고</option>
                  <option value="feature">기능 요청</option>
                  <option value="etc">기타</option>
                </select>
              </label>

              <label className={styles.label}>
                문의 내용
                <textarea
                  name="message"
                  className={styles.textarea}
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </label>

              <button type="submit" className={styles.submitButton}>
                제출하기
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupportPage;
