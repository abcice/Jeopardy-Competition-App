// src/pages/Competition/GamePage/GamePage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import * as competitionApi from '../../../utilities/competition-api';
import styles from './GamePage.module.scss';

export default function GamePage() {
  const { id: competitionId } = useParams();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [selectedButtons, setSelectedButtons] = useState({});
  const [identifierType, setIdentifierType] = useState('colors'); // default
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const availableColors = [
    'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'teal'
  ];

  // Fetch teams and identifier type from the competition
  useEffect(() => {
    async function fetchTeams() {
      try {
        const comp = await competitionApi.getById(competitionId);
        console.log("Fetched competition:", comp);
        setIdentifierType(comp.identifierType || 'colors');

        const teamsData = comp.teams || [];
        setTeams(teamsData);
        const { competition } = await competitionApi.getById(competitionId);
        console.log("Fetched competition:", competition);
        setIdentifierType(competition.identifierType || 'colors');
        setTeams(competition.teams || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setMessage('❌ Failed to load teams');
        setLoading(false);
      }
    }
    fetchTeams();
  }, [competitionId]);

  // Handle team button selection
  const handleSelect = async (teamId) => {
    // Prevent selecting the same button twice
    if (selectedButtons[teamId]) return;

    // Mark this button as selected
    setSelectedButtons((prev) => ({ ...prev, [teamId]: true }));

    try {
      // Update team in backend to mark identifier as chosen
      await competitionApi.updateStatus(competitionId, 'identifier-selected');
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to register selection');
    }

    // Check if all teams have selected
    if (Object.keys(selectedButtons).length + 1 === teams.length) {
      navigate(`/competitions/${competitionId}/board`);
    }
  };

  if (loading) return <p>Loading teams...</p>;

  return (
    <div className={styles.gamePage}>
      <Navbar />
      <main>
        <h1>Select Your Team Identifier</h1>
        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.buttonsContainer}>
          {teams.map((team, idx) => {
            const key = identifierType === 'colors' ? team.color : team.number;
            const disabled = !!selectedButtons[team._id];

            return (
              <button
                key={team._id}
                className={styles.teamButton}
                style={{
                  backgroundColor: identifierType === 'colors' ? team.color : undefined,
                  color: identifierType === 'colors' ? 'white' : 'black',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1
                }}
                disabled={disabled}
                onClick={() => handleSelect(team._id)}
              >
                {identifierType === 'colors' ? team.color : `#${team.number}`}
              </button>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
