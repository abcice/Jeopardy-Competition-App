// Footer.jsx
import styles from './Footer.module.scss'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <hr className={styles.separator} />
      <div className={styles["footer-content"]}>
        <p className={styles.about}>
          About: This game is inspired by Jeopardy. Teams compete by answering
          trivia questions across different categories and rounds — featuring
          daily doubles and fun challenges!
        </p>
        <p className={styles.copyright}>© MohamedAdel2025</p>
      </div>
    </footer>
  );
}
