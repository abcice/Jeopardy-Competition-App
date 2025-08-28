import { useNavigate } from "react-router-dom";
import styles from "./BackButton.module.scss";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button className="back-button" onClick={() => navigate(-1)}>
      ← Go Back
    </button>
  );
}
