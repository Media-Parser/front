import React from "react";
import styles from "./Tooltip.module.css";

interface TooltipProps {
  visible: boolean;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  visible,
  position = "top",
  children,
  className,
}) => {
  if (!visible) return null;

  return (
    <div className={`${styles.tooltip} ${styles[position]} ${className ?? ""}`}>
      {children}
    </div>
  );
};

export default Tooltip;
