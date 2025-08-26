import Jeopardy from '../../models/Jeopardy';

// List all Jeopardy games
export async function index(req, res) {
  try {
    const jeopardies = await Jeopardy.find({}).populate('author');
    res.status(200).json(jeopardies);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

// Create a new Jeopardy game
export async function create(req, res) {
  try {
    const { title, categories, author } = req.body;
    const jeopardy = await Jeopardy.create({ title, categories, author });
    res.status(201).json(jeopardy);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}



// Update Jeopardy game (title, categories)
export async function update(req, res) {
  try {
    const { title, categories } = req.body;
    const jeopardy = await Jeopardy.findByIdAndUpdate(
      req.params.id,
      { title, categories },
      { new: true, runValidators: true }
    );
    if (!jeopardy) return res.status(404).json({ msg: "Jeopardy not found" });
    res.status(200).json(jeopardy);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}


// Delete a Jeopardy game
export async function deleteJeopardy(req, res) {
  try {
    const jeopardy = await Jeopardy.findByIdAndDelete(req.params.id);
    if (!jeopardy) return res.status(404).json({ msg: "Jeopardy not found" });
    res.status(200).json({ msg: "Jeopardy deleted successfully" });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

// List all categories of a specific Jeopardy
export async function showCategories(req, res) {
  try {
    const jeopardy = await Jeopardy.findById(req.params.id).populate('author');
    if (!jeopardy) {
      return res.status(404).json({ msg: "Jeopardy not found" });
    }

    res.status(200).json(jeopardy.categories);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}



//Adding a category
export async function addCategory(req, res) {
  try {
    const jeopardy = await Jeopardy.findById(req.params.id);
    if (!jeopardy) return res.status(404).json({ msg: "Jeopardy not found" });

    jeopardy.categories.push({ name: req.body.name, questions: [] });
    await jeopardy.save();
    res.status(200).json(jeopardy);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

// Update a category name
export async function updateCategory(req, res) {
  try {
    const { categoryId } = req.params; // category ID to update
    const { name } = req.body;         // new name

    const jeopardy = await Jeopardy.findById(req.params.id);
    if (!jeopardy) return res.status(404).json({ msg: "Jeopardy not found" });

    // Find the category inside jeopardy
    const category = jeopardy.categories.id(categoryId);
    if (!category) return res.status(404).json({ msg: "Category not found" });

    // Update the category name
    category.name = name;

    // Save the document
    await jeopardy.save();

    res.status(200).json(jeopardy);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

// Delete a category
export async function deleteCategory(req, res) {
  try {
    const { categoryId } = req.params; // category ID to delete
    const jeopardy = await Jeopardy.findById(req.params.id);
    if (!jeopardy) return res.status(404).json({ msg: "Jeopardy not found" });

    const category = jeopardy.categories.id(categoryId);
    if (!category) return res.status(404).json({ msg: "Category not found" });

    // Remove the category
    category.remove();

    // Save the document
    await jeopardy.save();

    res.status(200).json({ msg: "Category deleted successfully", jeopardy });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

//Adding a question to a category
export async function addQuestion(req, res) {
  try {
    const jeopardy = await Jeopardy.findById(req.params.id);
    if (!jeopardy) return res.status(404).json({ msg: "Jeopardy not found" });

    const category = jeopardy.categories.id(req.body.categoryId);
    if (!category) return res.status(404).json({ msg: "Category not found" });

    category.questions.push({
      text: req.body.text,
      points: req.body.points,
      dailyDouble: req.body.dailyDouble || false
    });

    await jeopardy.save();
    res.status(200).json(jeopardy);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

// Update a question
export async function updateQuestion(req, res) {
  try {
    const { questionId } = req.params;
    const { categoryId, text, points, dailyDouble } = req.body;

    const jeopardy = await Jeopardy.findById(req.params.id);
    if (!jeopardy) return res.status(404).json({ msg: "Jeopardy not found" });

    const category = jeopardy.categories.id(categoryId);
    if (!category) return res.status(404).json({ msg: "Category not found" });

    const question = category.questions.id(questionId);
    if (!question) return res.status(404).json({ msg: "Question not found" });

    // Update the question fields
    if (text !== undefined) question.text = text;
    if (points !== undefined) question.points = points;
    if (dailyDouble !== undefined) question.dailyDouble = dailyDouble;

    await jeopardy.save();

    res.status(200).json({ msg: "Question updated successfully", jeopardy });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}


// Show all questions for a specific category
export async function showQuestions(req, res) {
  try {
    const { id, categoryId } = req.params; // id = Jeopardy id
    const jeopardy = await Jeopardy.findById(id).populate('author');
    if (!jeopardy) {
      return res.status(404).json({ msg: "Jeopardy not found" });
    }

    const category = jeopardy.categories.id(categoryId);
    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }

    res.status(200).json(category.questions);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}


// Delete a question
export async function deleteQuestion(req, res) {
  try {
    const { id, categoryId, questionId } = req.params; // id = Jeopardy id

    const jeopardy = await Jeopardy.findById(id);
    if (!jeopardy) return res.status(404).json({ msg: "Jeopardy not found" });

    const category = jeopardy.categories.id(categoryId);
    if (!category) return res.status(404).json({ msg: "Category not found" });

    const question = category.questions.id(questionId);
    if (!question) return res.status(404).json({ msg: "Question not found" });

    question.remove(); // Remove the question from the category
    await jeopardy.save();

    res.status(200).json({ msg: "Question deleted successfully", jeopardy });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}
