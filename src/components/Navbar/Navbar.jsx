import { useNavigate } from "react-router-dom";
import { getUser, logOut } from "../../utilities/users-service";
import styles from "./Navbar.module.scss";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    logOut();
    navigate("/login");
  }

  return (
    <nav className={styles.navbar}>
      <button className={styles["logout-button"]} onClick={handleLogout}>
        Log Out
      </button>

      {user && <span className={styles["user-name"]}>{user.name}</span>}
    </nav>
  );
}
