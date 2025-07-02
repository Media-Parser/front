// 📁 src/components/Button.tsx

import type { ReactNode } from "react";
import styles from "./Button.module.css";

interface ButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  icon,
  label,
  onClick,
  type = "button",
  className = "",
}) => {
  return (
    <button
      type={type}
      className={`${styles.iconButton} ${className}`}
      onClick={onClick}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label} data-text={label}>
        {label}
      </span>
    </button>
  );
};

export default Button;
