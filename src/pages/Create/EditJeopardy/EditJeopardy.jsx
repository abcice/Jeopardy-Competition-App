import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import BackButton from "../../../components/BackButton/BackButton";
import * as jeopardyApi from "../../../utilities/jeopardy-api";
import styles from "./EditJeopardy.module.scss";

export default function EditJeopardy() {
  const [jeopardies, setJeopardies] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch all jeopardy games
  const fetchJeopardies = async () => {
    try {
      const data = await jeopardyApi.getAll();
      setJeopardies(data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load jeopardy games");
    }
  };

  useEffect(() => {
    fetchJeopardies();
  }, []);

  const handleEdit = (id) => {
    navigate(`/jeopardy/edit/${id}`);
  };

  // New: handle delete
const handleDelete = async (id, title) => {
  if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

  try {
    await jeopardyApi.deleteJeopardy(id);
    await fetchJeopardies(); // refresh list first
setMessage(`✅ "${title}" has been deleted successfully`);
setTimeout(() => setMessage(""), 3000); // clears after 3 seconds
  } catch (err) {
    console.error(err);
    setMessage(`❌ Failed to delete "${title}"`);
  }
};


  if (!jeopardies.length) {
    return (
      <>
        <Navbar />
        <main className={styles.editJeopardy}>
          <BackButton />
          <h2>Edit Jeopardy</h2>
          {message && <p className={styles.message}>{message}</p>}
          <p>Loading jeopardy games...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.editJeopardy}>
        <div className={styles.header}>
          <div className={styles.backWrapper}>
        <BackButton />
        </div>
        <h2>Edit Jeopardy</h2>
        </div>
        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.jeopardyList}>
          {jeopardies.map((j) => (
            <div key={j._id} className={styles.jeopardyCard}>
              <div className={styles.jeopardyInfo}>
              <h3>{j.title}</h3>
              <p>Categories: {j.categories.length}</p>
              </div>
              <div className={styles.actions}>
                <button
                 className={styles.editButton} onClick={() => handleEdit(j._id)}>
                  Edit →</button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(j._id, j.title)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
