import styles from './Footer.module.scss'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="about">
          About: This game is inspired by Jeopardy. Teams compete by answering
          trivia questions across different categories and rounds — featuring
          daily doubles and fun challenges!
        </p>
        <p className="copyright">© MohamedAdel2025</p>
      </div>
    </footer>
  );
}
