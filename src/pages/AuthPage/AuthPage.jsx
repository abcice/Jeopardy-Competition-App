// src/pages/AuthPage/AuthPage.jsx
import { useState } from "react";
import styles from "./AuthPage.module.scss";
import LoginForm from "../../components/LoginForm/LoginForm";
import SignUpForm from "../../components/SignUpForm/SignUpForm";
import JoinGame from "../../components/JoinGame/JoinGame";

export default function AuthPage({ setUser, setPlayerToken }) {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <main className={styles.AuthPage}>
      <div>
        <h3 onClick={() => setShowLogin(!showLogin)}>
          {showLogin ? "SIGN UP" : "LOG IN"}
        </h3>
      </div>
      <div className={styles.formsContainer}>
        <div className={styles.authForms}>
          {showLogin ? <LoginForm setUser={setUser} /> : <SignUpForm setUser={setUser} />}
        </div>
        <div className={styles.joinGameSection}>
          <JoinGame setPlayerToken={setPlayerToken} />
        </div>
      </div>
    </main>
  );
}
