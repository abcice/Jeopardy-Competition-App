import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import BackButton from "../../../components/BackButton/BackButton";
import SaveButton from "../../../components/SaveButton/SaveButton";
import * as jeopardyApi from "../../../utilities/jeopardy";
import * as competitionApi from "../../../utilities/competition-api";
import { getUser } from "../../../utilities/users-service";
import styles from "./CreateGame.module.scss";

export default function CreateGame() {
  const [formData, setFormData] = useState({
    name: "",
    categories: 0,
    questions: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    try {
      setLoading(true);
      setMessage("");

      const user = getUser();
      if (!user) {
        setMessage("You must be logged in to create a competition.");
        return;
      }

      // Step 1: Create Jeopardy game
      const jeopardy = await jeopardyApi.create({
        title: formData.name,
        categories: [],
        author: user._id,
      });

      // Step 2: Create Competition linked to Jeopardy
      await competitionApi.create(jeopardy._id);

      // ✅ Redirect to CreateQuestion page
      navigate(`/create-questions/${jeopardy._id}`, {
        state: {
          totalCategories: Number(formData.categories),
          questionsPerCategory: Number(formData.questions),
        },
      });
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to create competition.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className={styles.createGame}>
        <h1>Create a competition</h1>

        <label>Name the competition</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />

        <label>Number of categories</label>
        <input
          type="number"
          name="categories"
          value={formData.categories}
          onChange={handleChange}
        />

        <label>Number of questions</label>
        <input
          type="number"
          name="questions"
          value={formData.questions}
          onChange={handleChange}
        />

        <div className={styles.actions}>
          <BackButton />
          <SaveButton onClick={handleSave} disabled={loading} />
        </div>

        {message && <p>{message}</p>}
      </div>
      <Footer />
    </>
  );
}
