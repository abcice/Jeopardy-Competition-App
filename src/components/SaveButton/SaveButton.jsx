import { useNavigate } from "react-router-dom";
import styles from "./SaveButton.module.scss";

/**
 * SaveButton
 * 
 * @param {string} to - route to navigate to after saving
 * @param {function} onSave - async function to run before navigation (e.g. call API)
 */
export default function SaveButton({ to, onSave }) {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      if (onSave) {
        await onSave(); // wait for save (DB/API call)
      }
      if (to) {
        navigate(to); // go to next page
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Something went wrong while saving. Please try again.");
    }
  };

  return (
    <button className={styles["save-button"]} onClick={handleClick}>
      Save
    </button>
  );
}
