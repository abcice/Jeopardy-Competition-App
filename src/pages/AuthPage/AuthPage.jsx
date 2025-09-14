import { useState } from "react";
import styles from "./AuthPage.module.scss";
import LoginForm from "../../components/LoginForm/LoginForm";
import SignUpForm from "../../components/SignUpForm/SignUpForm";
import JoinGame from "../../components/JoinGame/JoinGame";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

export default function AuthPage({ setUser, setPlayerToken }) {
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'signup'

  return (
    <>
      <Header />
      <main className={styles.AuthPage}>
        <div className={styles.tabToggle}>
          <span
            className={activeTab === "login" ? styles.active : ""}
            onClick={() => setActiveTab("login")}
          >
            LOG IN
          </span>
          <span
            className={activeTab === "signup" ? styles.active : ""}
            onClick={() => setActiveTab("signup")}
          >
            SIGN UP
          </span>
        </div>

        <div className={styles.formsContainer}>
          <div className={styles.authForms}>
            {activeTab === "login" ? (
              <LoginForm setUser={setUser} />
            ) : (
              <SignUpForm setUser={setUser} />
            )}
          </div>
          <div className={styles.joinGameSection}>
            <JoinGame setPlayerToken={setPlayerToken} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
