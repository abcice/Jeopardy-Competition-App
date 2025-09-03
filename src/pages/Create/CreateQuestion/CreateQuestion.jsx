import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import BackButton from "../../../components/BackButton/BackButton";
import SaveButton from "../../../components/SaveButton/SaveButton";
import * as jeopardyApi from "../../../utilities/jeopardy-api";
import styles from "./CreateQuestion.module.scss";
import MarkdownRenderer from "../../../components/MarkdownRenderer/MarkdownRenderer";

export default function CreateQuestion() {
  const navigate = useNavigate();
  const { jeopardyId } = useParams();
  const location = useLocation();

  const { totalCategories = 0, questionsPerCategory = 0 } = location.state || {};
  const totalCats = Number(totalCategories);


  // Redirect if state is missing
  useEffect(() => {
    if (!totalCategories || !questionsPerCategory) {
      navigate("/jeopardy/create");
    }
  }, [totalCategories, questionsPerCategory, navigate]);

  if (!totalCategories || !questionsPerCategory) return null;

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [categoryName, setCategoryName] = useState(location.state?.categoryName || "");
  const [questions, setQuestions] = useState(
    location.state?.currentQuestions ||
      Array.from({ length: questionsPerCategory }, () => ({
        text: "",
        answer: "",
        score: "",
        dailyDouble: false,
      }))
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [finished, setFinished] = useState(false);

  // Restore state when coming back from "Import Question"
  useEffect(() => {
    if (location.state?.currentQuestions) {
      setQuestions(location.state.currentQuestions);
    }
  }, [location.state?.currentQuestions]);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSaveCategory = async () => {
  try {
    const jeopardy = await jeopardyApi.addCategory(jeopardyId, categoryName);
    const newCategory = jeopardy.categories[jeopardy.categories.length - 1];

    for (const q of questions) {
      const payload = {
        text: q.text?.trim() || "Untitled Question",
        answer: q.answer?.trim() || "No answer provided",
        points: Number.isFinite(Number(q.score)) ? Number(q.score) : 0,
        dailyDouble: !!q.dailyDouble,
      };
      console.log("Saving question:", payload);
      await jeopardyApi.addQuestion(jeopardyId, newCategory._id, payload);
    }

    const totalCats = Number(totalCategories);

    if (currentCategoryIndex + 1 < totalCats) {
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
      setStatusMessage("✅ Category saved, continue with the next one");
    } else {
      setStatusMessage("");  // clear any previous message
      setFinished(true);     // show the finished screen
    }
  } catch (err) {
    console.error(err);
    setStatusMessage("❌ Failed to save category/questions");
  }
};



  return (
    <>
      <Navbar />
      <div className={styles.createQuestion}>
        {!finished ? (
          <>
            <h1>
              Create Category {currentCategoryIndex + 1} of {totalCategories}
            </h1>

            {statusMessage && <p className={styles.status}>{statusMessage}</p>}

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
                  onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
                />
                <div className={styles.preview}>
                  <strong>Preview:</strong>
                  <MarkdownRenderer content={q.text} />
                </div>

                <label>Answer</label>
                <textarea
                  value={q.answer}
                  onChange={(e) => handleQuestionChange(index, "answer", e.target.value)}
                />
                <div className={styles.preview}>
                  <strong>Preview:</strong>
                  <MarkdownRenderer content={q.answer} />
                </div>

                <label>Score</label>
                <input
                  type="number"
                  value={q.score}
                  onChange={(e) =>
                    handleQuestionChange(index, "score", e.target.value ? parseInt(e.target.value, 10) : 0)
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

                <button
                  type="button"
                  className={styles.importButton}
                  onClick={() =>
                    navigate(`/jeopardy/${jeopardyId}/import-question`, {
                      state: {
                        totalCategories,
                        currentCategoryIndex,
                        questionsPerCategory,
                        targetQuestionIndex: index,
                        currentQuestions: questions,
                        categoryName,
                      },
                    })
                  }
                >
                  📥 Import from Old Jeopardies
                </button>
              </div>
            ))}

            <div className={styles.actions}>
              <BackButton />
              <SaveButton onSave={handleSaveCategory} />
            </div>
          </>
        ) : (
          <div className={styles.finished}>
            <h1>🎉 All categories & questions created!</h1>
            <button onClick={() => navigate(`/jeopardy/edit/${jeopardyId}`)}>
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
