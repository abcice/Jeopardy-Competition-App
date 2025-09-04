import { useState } from "react";
import styles from "./DailyDouble.module.scss";

export default function DailyDouble({ competitionId, team, question, onSubmitBid, onCancel }) {
  const [bid, setBid] = useState('');
  const [error, setError] = useState('');

  const handleBidChange = (e) => {
    setBid(e.target.value);
    setError('');
  };

  const handleSubmit = () => {
    const numericBid = parseInt(bid, 10);
    if (isNaN(numericBid) || numericBid <= 0) {
      setError('⚠️ Enter a valid positive number');
      return;
    }
    if (numericBid > team.score) {
      setError(`⚠️ You cannot bid more than your current score (${team.score})`);
      return;
    }

    onSubmitBid(numericBid); // ✅ pass back to parent state
  };

  return (
    <div className={styles.dailyDoubleOverlay}>
      <div className={styles.dailyDoubleBox}>
        <h2>💥 Daily Double!</h2>
        <p>Your current score: {team.score}</p>
        <p>Enter your bid:</p>
        <input
          type="number"
          value={bid}
          onChange={handleBidChange}
          min="1"
          max={team.score}
        />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttons}>
          <button onClick={handleSubmit}>Submit Bid</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
        <p>If correct, you will earn double your bid!</p>
      </div>
    </div>
  );
}
