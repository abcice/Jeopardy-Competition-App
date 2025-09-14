import styles from "./BuzzButton.module.scss";
import BuzzSound from "../../assets/Buzzer.mp3";

// Darken color function for stronger gradient
function darkenColor(hex, percent) {
  const num = parseInt(hex.replace("#",""),16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) - amt,
        G = ((num >> 8) & 0x00FF) - amt,
        B = (num & 0x0000FF) - amt;
  return "#" + (
    0x1000000 +
    (R<0?0:R>255?255:R)*0x10000 +
    (G<0?0:G>255?255:G)*0x100 +
    (B<0?0:B>255?255:B)
  ).toString(16).slice(1);
}

export default function BuzzButton({ team, onBuzz, disabled }) {
  if (!team) {
    return <button className={styles.buzz} onClick={onBuzz} disabled>Loading...</button>;
  }

  const color = team.color || "#f43f5e";
  const darkColor = darkenColor(color, 25);

  const handleClick = () => {
    // Play buzz sound once
    const audio = new Audio(BuzzSound);
    audio.play();
    
    // Call the passed onBuzz handler
    onBuzz && onBuzz();
  };

  return (
    <button
      className={styles.buzz}
      onClick={handleClick}
      disabled={disabled}
      style={{
        "--team-color": color,
        "--team-color-dark": darkColor,
      }}
      title={team.name}
    />
  );
}
