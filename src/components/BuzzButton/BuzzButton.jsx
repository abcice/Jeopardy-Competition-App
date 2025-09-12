import styles from "./BuzzButton.module.scss";

export default function BuzzButton({ team, identifierType, onBuzz, disabled }) {
  if (!team) {
    return (
      <button className={styles.buzz} onClick={onBuzz} disabled>
        Loading team...
      </button>
    );
  }

  const label =
    identifierType === "colors"
      ? team.color || team.name
      : team.number
      ? `#${team.number}`
      : team.name;

  return (
    <button
      className={styles.buzz}
      onClick={onBuzz}
      disabled={disabled}
      style={{ backgroundColor: team?.color || "gray" }} // ✅ fallback color
    >
      {label}
    </button>
  );
}
