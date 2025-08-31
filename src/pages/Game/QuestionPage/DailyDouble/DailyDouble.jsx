import styles from './DailyDouble.module.scss'
import * as competitionApi from '../../../../utilities/competition-api'
import { useState } from 'react'

export default function DailyDouble({ competitionId, team, question, onFinish }) {
  const [bid, setBid] = useState('');
  const [error, setError] = useState('');

  const handleBidChange = (e) => {
    setBid(e.target.value);
    setError('');
  };

  const handleSubmit = async () => {
    const numericBid = parseInt(bid);
    if (isNaN(numericBid) || numericBid <= 0) {
      setError('⚠️ Enter a valid positive number');
      return;
    }
    if (numericBid > team.score) {
      setError(`⚠️ You cannot bid more than your current score (${team.score})`);
      return;
    }

    try {
      await competitionApi.markCorrect(competitionId, team._id, numericBid);
      onFinish(); // close DailyDouble, return to QuestionPage
    } catch (err) {
      console.error(err);
      setError('❌ Failed to submit bid');
    }
  };

  const handleCancel = () => {
    onFinish(); // allow skipping/returning if needed
  };

  return (
    <div className={styles.dailyDoubleOverlay}>
      <div className={styles.dailyDoubleBox}>
        <h2>💥 Daily Double!</h2>
        <p>Your current score: {team.score}</p>
        <p>Enter your bid:</p>
        <input type="number" value={bid} onChange={handleBidChange} min="1" max={team.score} />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttons}>
          <button onClick={handleSubmit}>Submit Bid</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
        <p>If correct, you will earn double your bid!</p>
      </div>
    </div>
  );
}
