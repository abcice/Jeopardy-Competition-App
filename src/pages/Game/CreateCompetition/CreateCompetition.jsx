import styles from './CreateCompetition.module.scss';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BackButton from '../../../components/BackButton/BackButton';
import NextButton from '../../../components/NextButton/NextButton';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import * as competitionApi from '../../../utilities/competition-api';
import * as jeopardyApi from '../../../utilities/jeopardy-api';


export default function CreateCompetition() {
const { jeopardyId: paramId } = useParams();
const location = useLocation();

  const navigate = useNavigate();
  const [competitionId, setCompetitionId] = useState(null);

  const [numTeams, setNumTeams] = useState(2);
  const [identifierType, setIdentifierType] = useState('colors');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [jeopardies, setJeopardies] = useState([]);
  const [selectedJeopardy, setSelectedJeopardy] = useState('');
  const [joinCode, setJoinCode] = useState('');


  const jeopardyId = paramId || location.state?.jeopardyId;


  // Predefined colors
const availableColors = [
  '#ef4444', // soft red
  '#3b82f6', // soft blue
  '#16a34a', // medium green (darker than cyan)
  '#f59e0b', // amber/orange
  '#8b5cf6', // soft violet (distinct from purple/pink)
  '#f472b6', // pink (distinct from red & violet)
  '#ea580c', // tangerine (darker than amber)
  '#06b6d4', // teal/cyan (clear and different from green & blue)
];




const handleGenerateTeams = () => {
  if (!selectedJeopardy) {
    setMessage("❌ Please select a Jeopardy game first");
    return;
  }

  if (numTeams <= 0) {
    setMessage("❌ Please enter a valid number of teams");
    return;
  }

  const generatedTeams = [];
  for (let i = 0; i < numTeams; i++) {
    generatedTeams.push({
      name: `Team ${i + 1}`,
      color: availableColors[i % availableColors.length],
      number: identifierType === "numbers" ? i + 1 : null,
      members: [], // initialize members
    });
  }

  setTeams(generatedTeams);
  setMessage(`✅ Teams generated. Click Next to save.`);
};

  const handleSaveTeams = async () => {
  if (!selectedJeopardy) {
    setMessage("❌ Please select a Jeopardy game first");
    return;
  }

  try {
    setLoading(true);

    let id = competitionId;
    if (!id) {
      const competition = await competitionApi.create({ jeopardyId: selectedJeopardy });
      id = competition._id;
      setCompetitionId(id);
    }

    for (const team of teams) {
      await competitionApi.addTeam(id, team);
    }

    setMessage("✅ Teams saved successfully");
    navigate(`/competition/${id}/setup`);
  } catch (err) {
    console.error(err);
    setMessage("❌ Failed to save teams");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  async function fetchJeopardies() {
    try {
      const data = await jeopardyApi.getAll();
      setJeopardies(data);
    } catch (err) {
      console.error("Failed to load Jeopardies", err);
    }
  }
  fetchJeopardies();
}, []);



  return (
    <>
  <Navbar />
  <div className={styles.gamePage}>
    <div className={styles.card}>
      <main>
        <h1>Setup Competition</h1>
        {message && <p className={styles.message}>{message}</p>}

        <label>Select Jeopardy Game</label>
        <select value={selectedJeopardy} onChange={(e) => setSelectedJeopardy(e.target.value)}>
          <option value="">-- Choose a Jeopardy --</option>
          {jeopardies.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
        </select>

        <div className={styles.controls}>
          <div className={styles.controlItem}>
          <label>How many teams?</label>
          <input type="number" min="1" value={numTeams} onChange={(e) => setNumTeams(Number(e.target.value))} />
          </div>

          <div className={styles.controlItem}>
          <label>Identify the team by</label>
          <select value={identifierType} onChange={(e) => setIdentifierType(e.target.value)}>
            <option value="colors">Colors</option>
            <option value="numbers">Numbers</option>
          </select>
          </div>

        </div>
          <button className={styles.generateButton} onClick={handleGenerateTeams}>Generate Teams</button>

        {teams.length > 0 && (
          <div className={styles.teamsPreview}>
            <h2>Teams Preview</h2>
            <ul>
              {teams.map((team, idx) => (
                <li key={idx} style={{ color: team.color }}>
                  {team.name}
                </li>
              ))}
            </ul>
          </div>
        )}


        <div className={styles.actions}>
          <BackButton />
          <NextButton onClick={handleSaveTeams} to={null} />
        </div>

        {loading && <p>⏳ Saving...</p>}
      </main>
    </div>
  </div>
  <Footer />
</>

  );
}
