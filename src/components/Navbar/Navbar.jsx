import { useNavigate } from "react-router-dom";
import { getUser, logOut } from "../../utilities/users-service";
import styles from "./Navbar.module.scss";
import logo from "../../assets/Logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    logOut();
    navigate("/login");
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles["nav-left"]}>
        <img src={logo} alt="Logo" className={styles.logo} onClick={() => navigate("/")} />
        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => navigate("/competition/start")}>Start Game</button>
        <button onClick={() => navigate("/jeopardy/create")}>Create Jeopardy</button>
        <button onClick={() => navigate("/jeopardy/edit")}>Edit Jeopardy</button>
      </div>

      <div className={styles["nav-right"]}>
        {user && <span className={styles["user-name"]}>{user.name}</span>}
        <button className={styles["logout-button"]} onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </nav>
  );
}
