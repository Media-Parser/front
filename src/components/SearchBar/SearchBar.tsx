// 📁 src/components/SearchBar/SearchBar.tsx
import { XCircle } from "lucide-react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "검색어를 입력하세요",
  className = "",
}) => {
  return (
    <div className={`${styles.searchWrapper} ${className}`}>
      <input
        type="search"
        className={styles.searchBar}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className={styles.clearButton}
          onClick={() => onChange("")}
          aria-label="검색어 지우기"
        >
          <XCircle size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
