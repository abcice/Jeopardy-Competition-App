import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./Dashboard.module.scss";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <main className={styles.dashboard}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.actions}>
          <button onClick={() => navigate("/competition/start")}>
            Start Game
          </button>
          <button onClick={() => navigate("/jeopardy/create")}>
            Create Jeopardy
          </button>
          <button onClick={() => navigate("/jeopardy/edit")}>
            Edit Jeopardy
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
