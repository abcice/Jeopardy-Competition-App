import { useNavigate } from "react-router-dom";
import styles from "./NextButton.module.scss";

export default function NextButton({ to, onClick }) {
  const navigate = useNavigate();

  const handleClick = async () => {
    if (onClick) {
      await onClick(); // wait for optional save action
    }
    if (to) {
      navigate(to);
    }
  };

  return (
    <button className={styles["next-button"]} onClick={handleClick}>
      Next →
    </button>
  );
}
