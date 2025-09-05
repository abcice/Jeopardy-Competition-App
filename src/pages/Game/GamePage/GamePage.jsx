import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import * as competitionApi from '../../../utilities/competition-api';
import socket from '../../../utilities/socket';
import styles from './GamePage.module.scss';

export default function GamePage() {
  const { id: competitionId } = useParams();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedButtons, setSelectedButtons] = useState({});
  const [identifierType, setIdentifierType] = useState('colors');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  

  const availableColors = [
    'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'teal'
  ];

  // Fetch competition data once
  useEffect(() => {
    async function fetchCompetition() {
      try {
        const comp = await competitionApi.getById(competitionId);
        console.log("Fetched competition:", comp);

        setCompetition(comp);
        setIdentifierType(comp.identifierType || 'colors');
        setTeams(comp.teams || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setMessage('❌ Failed to load competition');
        setLoading(false);
      }
    }
    fetchCompetition();
  }, [competitionId]);

  // Handle team button selection
  const handleSelect = async (teamId) => {
    socket.emit("join-competition", { competitionId, teamId });

    if (selectedButtons[teamId]) return;

    setSelectedButtons((prev) => ({ ...prev, [teamId]: true }));

    try {
      await competitionApi.updateStatus(competitionId, 'identifier-selected');
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to register selection');
    }

    if (Object.keys(selectedButtons).length + 1 === teams.length) {
      navigate(`/competitions/${competitionId}/board`);
    }
  };

  if (loading || !competition) return <p>Loading teams...</p>;

  return (
    <div className={styles.gamePage}>
      <Navbar />
      <main>
        <p>Share this link with players:</p>
        <code>{`${window.location.origin}/join/${competition.joinCode}`}</code>

        <p>Or tell them to enter this code:</p>
        <code>{competition.joinCode}</code>

        <h1>Select Your Team Identifier</h1>
        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.buttonsContainer}>
          {teams.map((team) => {
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
