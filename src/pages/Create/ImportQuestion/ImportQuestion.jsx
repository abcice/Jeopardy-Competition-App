import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import * as jeopardyApi from "../../../utilities/jeopardy";
import styles from "./ImportQuestion.module.scss";

export default function ImportQuestion() {
  const navigate = useNavigate();
  const { jeopardyId } = useParams();
  const location = useLocation();

  const { currentCategoryIndex, questionsPerCategory } = location.state || {};
  if (currentCategoryIndex == null || questionsPerCategory == null) {
  navigate(`/create-game`);
  return null;
}

  const [oldJeopardies, setOldJeopardies] = useState([]);
  const [selectedJeopardy, setSelectedJeopardy] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Fetch all old jeopardies
  useEffect(() => {
    async function fetchOldJeopardies() {
      const data = await jeopardyApi.getAll();
      setOldJeopardies(data);
    }
    fetchOldJeopardies();
  }, []);

  // Fetch categories when jeopardy selected
  useEffect(() => {
    if (!selectedJeopardy) return;
    async function fetchCategories() {
      const cats = await jeopardyApi.getCategories(selectedJeopardy._id);
      setCategories(cats);
    }
    fetchCategories();
  }, [selectedJeopardy]);

  // Fetch questions when category selected
  useEffect(() => {
    if (!selectedCategory) return;
    async function fetchQuestions() {
      const qs = await jeopardyApi.getQuestions(selectedJeopardy._id, selectedCategory._id);
      setQuestions(qs);
    }
    fetchQuestions();
  }, [selectedCategory]);

  const handleImport = () => {
    if (!selectedQuestion) return;
    // Navigate back to CreateQuestion with the imported question data
    navigate(`/jeopardy/${jeopardyId}/create-question`, {
      state: {
        currentCategoryIndex,
        questionsPerCategory,
        importedQuestion: {
          ...selectedQuestion,
          score: selectedQuestion.points, // map points
        },
      },
    });
  };

  return (
    <>
      <Navbar />
      <div className={styles.importQuestion}>
        <h1>Import Question from Old Jeopardies</h1>

        <label>Select Jeopardy</label>
        <select
        value={selectedJeopardy?._id || ""}
        onChange={(e) => {
            const j = oldJeopardies.find(j => j._id === e.target.value);
            setSelectedJeopardy(j || null);
            setSelectedCategory(null); // reset dependent state
            setQuestions([]);
            setSelectedQuestion(null);
        }}
        >
        <option value="">-- Select --</option>
        {oldJeopardies.map((j) => (
            <option key={j._id} value={j._id}>{j.title}</option>
        ))}
        </select>


        {categories.length > 0 && (
          <>
            <label>Select Category</label>
            <select
            value={selectedCategory?._id || ""}
            onChange={(e) => {
                const c = categories.find(c => c._id === e.target.value);
                setSelectedCategory(c || null);
                setQuestions([]);
                setSelectedQuestion(null);
            }}
            >
            <option value="">-- Select --</option>
            {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
            ))}
            </select>

          </>
        )}

        {questions.length > 0 && (
          <>
            <label>Select Question</label>
            <select
            value={selectedQuestion?._id || ""}
            onChange={(e) => {
                const q = questions.find(q => q._id === e.target.value);
                setSelectedQuestion(q || null);
            }}
            >
            <option value="">-- Select --</option>
            {questions.map((q) => (
                <option key={q._id} value={q._id}>{q.text}</option>
            ))}
            </select>

                        {selectedQuestion && (
            <div className={styles.preview}>
                <h4>Preview</h4>
                <p><strong>Text:</strong> {selectedQuestion.text}</p>
                <p><strong>Answer:</strong> {selectedQuestion.answer}</p>
                <p><strong>Score:</strong> {selectedQuestion.points}</p>
                <p><strong>Daily Double:</strong> {selectedQuestion.dailyDouble ? "Yes" : "No"}</p>
            </div>
            )}

          </>
        )}

        <button onClick={handleImport} disabled={!selectedQuestion}>
          Import Selected Question
        </button>
        <button onClick={() => navigate(-1)}>Cancel</button>
      </div>
      <Footer />
    </>
  );
}
