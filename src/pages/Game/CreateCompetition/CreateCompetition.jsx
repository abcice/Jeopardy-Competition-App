import styles from './CreateCompetition.module.scss';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import BackButton from '../../components/BackButton/BackButton';
import NextButton from '../../components/NextButton/NextButton';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import * as competitionApi from '../../utilities/competition-api';

export default function GamePage() {
  const { id: competitionId } = useParams(); // competition id from route
  const navigate = useNavigate();

  const [numTeams, setNumTeams] = useState(2);
  const [identifierType, setIdentifierType] = useState('colors');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Predefined colors
  const availableColors = [
    'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'teal'
  ];

  const handleGenerateTeams = () => {
    if (numTeams <= 0) {
      setMessage('❌ Please enter a valid number of teams');
      return;
    }

    let generatedTeams = [];
    for (let i = 0; i < numTeams; i++) {
      if (identifierType === 'colors') {
        generatedTeams.push({
          name: `Team ${i + 1}`,
          color: availableColors[i % availableColors.length],
          number: null,
        });
      } else {
        generatedTeams.push({
          name: `Team ${i + 1}`,
          color: null,
          number: i + 1,
        });
      }
    }
    setTeams(generatedTeams);
    setMessage('');
  };

  const handleSaveTeams = async () => {
    try {
      setLoading(true);
      for (const team of teams) {
        await competitionApi.addTeam(competitionId, team);
      }
      setMessage('✅ Teams saved successfully');
      navigate(`/game/setup/${competitionId}`);
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to save teams');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.gamePage}>
        <Navbar />
        <main>
      <h1>Setup Competition</h1>

      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.controls}>
        <label>How many teams?</label>
        <input
          type="number"
          min="1"
          value={numTeams}
          onChange={(e) => setNumTeams(Number(e.target.value))}
        />

        <label>Identify the team by</label>
        <select
          value={identifierType}
          onChange={(e) => setIdentifierType(e.target.value)}
        >
          <option value="colors">Colors</option>
          <option value="numbers">Numbers</option>
        </select>

        <button onClick={handleGenerateTeams}>Generate Teams</button>
      </div>

      {teams.length > 0 && (
        <div className={styles.teamsPreview}>
          <h2>Teams Preview</h2>
          <ul>
            {teams.map((team, idx) => (
              <li key={idx} style={{ color: team.color || 'inherit' }}>
                {team.name} — {team.color || `#${team.number}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.actions}>
        <BackButton />
        <NextButton
          onClick={handleSaveTeams}
          to={null} // navigation handled inside handleSaveTeams
        />
      </div>

      {loading && <p>⏳ Saving...</p>}
      </main>
      <Footer />
    </div>
  );
}
