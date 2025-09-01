// src/pages/Jeopardy/EditJeopardy/EditJeopardy.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import BackButton from "../../../components/BackButton/BackButton";
import * as jeopardyApi from "../../../utilities/jeopardy";
import styles from "./EditJeopardy.module.scss";

export default function EditJeopardy() {
  const [jeopardies, setJeopardies] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch all jeopardy games
  useEffect(() => {
    async function fetchJeopardies() {
      try {
        const data = await jeopardyApi.getAll();
        setJeopardies(data);
      } catch (err) {
        console.error(err);
        setMessage("❌ Failed to load jeopardy games");
      }
    }
    fetchJeopardies();
  }, []);

  const handleEdit = (id) => {
    navigate(`/jeopardy/edit/${id}`);
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
        <BackButton />
        <h2>Edit Jeopardy</h2>
        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.jeopardyList}>
          {jeopardies.map((j) => (
            <div key={j._id} className={styles.jeopardyCard}>
              <h3>{j.title}</h3>
              <p>Categories: {j.categories.length}</p>
              <button onClick={() => handleEdit(j._id)}>Edit →</button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
