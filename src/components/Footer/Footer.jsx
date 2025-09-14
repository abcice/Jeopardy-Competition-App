import styles from './Footer.module.scss'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles["footer-content"]}>
        <p className={styles.about}>
          Inspired by Jeopardy — answer, fail, repeat, and maybe question your life choices. 😉
        </p>
        <p className={styles.copyright}>© MohamedAdel2025</p>
      </div>
    </footer>
  );
}
