import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import BackButton from "../../../components/BackButton/BackButton";
import SaveButton from "../../../components/SaveButton/SaveButton";
import * as jeopardyApi from "../../../utilities/jeopardy-api";
import styles from "./EditCompetition.module.scss";
import MarkdownRenderer from "../../../components/MarkdownRenderer/MarkdownRenderer";

export default function EditCompetition() {
  const { jeopardyId } = useParams();
  const navigate = useNavigate();

  const [jeopardy, setJeopardy] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [message, setMessage] = useState("");

  // Fetch jeopardy game on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await jeopardyApi.getById(jeopardyId);
        setJeopardy(data);
        setCategories(data.categories || []);
        if ((data.categories || []).length > 0) {
          setSelectedCategoryId(data.categories[0]._id);
          setQuestions(data.categories[0].questions?.map(q => ({
            ...q,
            points: q.points || 0,
            dailyDouble: !!q.dailyDouble
          })) || []);
        }
      } catch (err) {
        console.error(err);
        setMessage("❌ Failed to load competition");
      }
    }
    fetchData();
  }, [jeopardyId]);

  // Handle category selection change
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);
    const category = categories.find((c) => c._id === categoryId);
    setQuestions(category?.questions.map(q => ({
      ...q,
      points: q.points || 0,
      dailyDouble: !!q.dailyDouble
    })) || []);
  };

  // Handle question field changes
  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // Save all questions in the current category
  const handleSaveQuestions = async () => {
    try {
      const savedQuestions = [];

      for (const q of questions) {
  const payload = {
    text: q.text?.trim() || "Untitled Question",
    answer: q.answer?.trim() || "No answer provided",
    points: Number(q.points) || 0,
    dailyDouble: !!q.dailyDouble
  };

  let savedQuestion;
  if (q._id) {
    const res = await jeopardyApi.updateQuestion(
      jeopardyId,
      selectedCategoryId,
      q._id,
      payload
    );
    savedQuestion = res.question || q;
  } else {
    const res = await jeopardyApi.addQuestion(
      jeopardyId,
      selectedCategoryId,
      payload
    );
    savedQuestion = res[res.length - 1];
  }
  savedQuestions.push(savedQuestion);
}


      setQuestions(savedQuestions);
      setMessage("✅ Questions saved successfully");
      await refreshData(selectedCategoryId);

    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to save questions");
    }
  };

  // Save updated category name
  const handleUpdateCategoryName = async (categoryId, name) => {
    if (!name.trim()) return;
    try {
      await jeopardyApi.updateCategory(jeopardyId, categoryId, name.trim());
      setMessage("✅ Category name updated");
      await refreshData(categoryId);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update category name");
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await jeopardyApi.deleteCategory(jeopardyId, categoryId);
      setMessage("✅ Category deleted");
      await refreshData();
      setSelectedCategoryId("");
      setQuestions([]);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to delete category");
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await jeopardyApi.deleteQuestion(jeopardyId, selectedCategoryId, questionId);
      setMessage("✅ Question deleted");
      await refreshData(selectedCategoryId);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to delete question");
    }
  };

  // Refresh jeopardy data
  const refreshData = async (keepCategoryId) => {
    try {
      const updatedData = await jeopardyApi.getById(jeopardyId);
      setJeopardy(updatedData);
      setCategories(updatedData.categories);
      const categoryToSelect = keepCategoryId
      ? updatedData.categories?.find(c => c._id === keepCategoryId)
      : updatedData.categories?.[0];

    if (categoryToSelect) {
    setSelectedCategoryId(categoryToSelect._id);
    setQuestions(categoryToSelect.questions?.map(q => ({
      ...q,
      points: q.points || 0,
      dailyDouble: !!q.dailyDouble
    })) || []);
  } else {
    setSelectedCategoryId("");
    setQuestions([]);
  }} catch (err) {
      console.error(err);
      setMessage("❌ Failed to refresh data");
    }
  };

  // Add new question row locally
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { text: "", answer: "", points: 0, dailyDouble: false }
    ]);
  };

  // Add new category + select it immediately
  const handleAddCategory = async () => {
  const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    console.log("Adding category:", trimmedName);
  try {
    const jeopardyData = await jeopardyApi.addCategory(jeopardyId, newCategoryName.trim());
    console.log("API Response:", jeopardyData);
    const newCategory = jeopardyData.categories[jeopardyData.categories.length - 1];
    setCategories(jeopardyData.categories);
    setNewCategoryName("");
    setSelectedCategoryId(newCategory._id);
    setQuestions([]);
    setMessage("✅ New category added, now add questions!");
  } catch (err) {
    console.error(err);
    setMessage("❌ Failed to add category");
  }
};


  if (!jeopardy) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <div className={styles.editCompetition}>
        <h1>Edit Competition: {jeopardy.title}</h1>

        {message && <p className={styles.message}>{message}</p>}

        {/* Add new category */}
        <div className={styles.newCategory}>
          <input
            type="text"
            placeholder="New Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button onClick={handleAddCategory}>➕ Add Category</button>
        </div>

        {/* Select category */}
        {categories.length > 0 && (
          <div className={styles.selectCategory}>
            <label>Select Category:</label>
            <select value={selectedCategoryId} onChange={handleCategoryChange}>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {selectedCategoryId && (
              <div className={styles.editCategory}>
                <input
                  type="text"
                  value={categories.find(c => c._id === selectedCategoryId)?.name || ""}
                  onChange={(e) =>
                    setCategories(prev =>
                      prev.map(cat =>
                        cat._id === selectedCategoryId ? { ...cat, name: e.target.value } : cat
                      )
                    )
                  }
                />
                <button onClick={() =>
                  handleUpdateCategoryName(
                    selectedCategoryId,
                    categories.find(c => c._id === selectedCategoryId)?.name
                  )
                }>💾 Save Name</button>
                <button onClick={() => handleDeleteCategory(selectedCategoryId)}>🗑 Delete Category</button>
              </div>
            )}
          </div>
        )}

        {/* Questions */}
        {questions.length > 0 && (
          <div className={styles.questions}>
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
                  value={q.points}
                  onChange={(e) => handleQuestionChange(index, "points", e.target.value)}
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
                {q._id && (
                  <button
                    className={styles.deleteQuestion}
                    onClick={() => handleDeleteQuestion(q._id)}
                  >
                    🗑 Delete Question
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <BackButton />
          <button onClick={handleAddQuestion}>➕ Add Question</button>
          <SaveButton onSave={handleSaveQuestions} />
        </div>
      </div>
      <Footer />
    </>
  );
}
