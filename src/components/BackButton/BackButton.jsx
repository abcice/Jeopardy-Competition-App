import { useNavigate, useLocation } from "react-router-dom";
import styles from "./BackButton.module.scss";

export default function BackButton({ fallback = "/", onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    // existing logic for import-question, edit, etc.
    if (path.includes("/import-question") && location.state?.fromImport) {
      navigate(`/jeopardy/${location.state.jeopardyId}/create-question`, {
        state: { ...location.state, fromImport: false },
      });
      return;
    }

    if (path.match(/^\/jeopardy\/edit\/[^/]+$/)) {
      navigate("/jeopardy/edit");
      return;
    }

    if (path.includes("/jeopardy/create")) {
      navigate("/");
      return;
    }

    if (path.includes("/competition/start")) {
      navigate("/");
      return;
    }

    navigate(fallback);
  };

  return (
    <button className={styles.backButton} onClick={handleBack}>
      ← Go Back
    </button>
  );
}
