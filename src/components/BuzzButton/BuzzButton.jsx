import styles from "./BuzzButton.module.scss";

export default function BuzzButton({ team, identifierType, onBuzz, disabled }) {
  const handleClick = () => {
    if (disabled) return;
    const audio = new Audio("/sounds/buzz.mp3");
    audio.play();
    if (onBuzz) onBuzz(team);
  };

  const label = identifierType === "colors" ? team.color : `#${team.number}`;

  return (
    <button
      className={styles.buzzButton}
      style={{
        backgroundColor: identifierType === "colors" ? team.color : undefined,
        color: identifierType === "colors" ? "white" : "black",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

