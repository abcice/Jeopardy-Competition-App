import React from "react";
import styles from "./Header.module.scss";
import logo from "../../assets/Logo.png"; // Jeopardy logo

export default function Header() {
  return (
    <header className={styles.header}>
      <img src={logo} alt="Jeopardy Logo" className={styles.logo} />
      <h1 className={styles.title}>Jeopardy</h1>
    </header>
  );
}
