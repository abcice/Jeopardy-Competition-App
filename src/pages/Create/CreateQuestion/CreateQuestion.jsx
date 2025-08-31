import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import BackButton from "../../../components/BackButton/BackButton";
import SaveButton from "../../../components/SaveButton/SaveButton";
import * as jeopardyApi from "../../../utilities/jeopardy";
import styles from "./CreateQuestion.module.scss";

export default function CreateQuestion() {
  const navigate = useNavigate();
  const { jeopardyId } = useParams();
  const location = useLocation();

  // ✅ Grab data passed from CreateGame
  const { totalCategories = 0, questionsPerCategory = 0 } = location.state || {};

  if (!totalCategories || !questionsPerCategory) {
    navigate("/create-game");
    return null;
  }
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [categoryName, setCategoryName] = useState("");
  const [questions, setQuestions] = useState(
    Array.from({ length: questionsPerCategory }, () => ({
      text: "",
      answer: "",
      score: "",
      dailyDouble: false,
    }))
  );
  const [message, setMessage] = useState("");

  // Update question input
  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSaveCategory = async () => {
    try {
      // 1. Add category
      const category = await jeopardyApi.addCategory(jeopardyId, categoryName);

      // 2. Add all questions under this category
      for (const q of questions) {
        await jeopardyApi.addQuestion(jeopardyId, category._id, {
          text: q.text,
          answer: q.answer,
          points: Number(q.score),
          dailyDouble: q.dailyDouble,
        });
      }

      // Reset for next category
      if (currentCategoryIndex + 1 < totalCategories) {
        setCurrentCategoryIndex((prev) => prev + 1);
        setCategoryName("");
        setQuestions(
          Array.from({ length: questionsPerCategory }, () => ({
            text: "",
            answer: "",
            score: "",
            dailyDouble: false,
          }))
        );
        setMessage("✅ Category saved, continue with next one");
      } else {
        setMessage("🎉 All categories & questions created!");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to save category/questions");
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.createQuestion}>
        <h1>
          {message
            ? message
            : `Create Category ${currentCategoryIndex + 1} of ${totalCategories}`}
        </h1>

        {!message && (
          <>
            <label>Category Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />

            {questions.map((q, index) => (
              <div key={index} className={styles.questionBlock}>
                <h3>Question {index + 1}</h3>
                <label>Text</label>
                <textarea
                  value={q.text}
                  onChange={(e) =>
                    handleQuestionChange(index, "text", e.target.value)
                  }
                />
                <label>Answer</label>
                <textarea
                  value={q.answer}
                  onChange={(e) =>
                    handleQuestionChange(index, "answer", e.target.value)
                  }
                />
                <label>Score</label>
                <input
                  type="number"
                  value={q.score}
                  onChange={(e) =>
                    handleQuestionChange(index, "score", e.target.value)
                  }
                />
                <label>
                  Daily Double
                  <input
                    type="checkbox"
                    checked={q.dailyDouble}
                    onChange={(e) =>
                      handleQuestionChange(index, "dailyDouble", e.target.checked)
                    }
                  />
                </label>
              </div>
            ))}

            <div className={styles.actions}>
              <BackButton />
              <SaveButton onClick={handleSaveCategory} />
            </div>
          </>
        )}

        {message && (
          <div className={styles.finished}>
            <button onClick={() => navigate(`/jeopardy/${jeopardyId}/edit`)}>
              ✏️ Edit Questions
            </button>
            <button onClick={() => navigate("/dashboard")}>🏠 Go to Dashboard</button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
