import styles from "./SupportPage.module.css";
import Layout from "../../components/Layout/Layout";
import React, { useState } from "react";
import Button from "../../components/Button/Button";
import { Smile } from "lucide-react";
import emailjs from "emailjs-com";

const SupportPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiryType: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, inquiryType, message } = formData;

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: name,
          reply_to: email,
          inquiry_type: inquiryType,
          message: message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      alert("문의가 성공적으로 전송되었습니다!");
      setFormData({
        name: "",
        email: "",
        inquiryType: "",
        message: "",
      });
    } catch (error) {
      console.error("이메일 전송 실패:", error);
      alert("문의 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <Layout>
      <div className={styles.mainArea}>
        <div className={styles.mainAreaHeader}>
          <h2 className={styles.mainAreaHeaderTitle}>지원</h2>
        </div>
        <div className={styles.Content}>
          <span className={styles.default}>
            자세한 사항은 hc.media.parser@gmail.com으로 문의주세요.
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
              <Button
                className={styles.submitButton}
                label="제출하기"
                icon={<Smile size={18} />}
                onClick={() => {}}
                type="submit"
              />
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupportPage;
