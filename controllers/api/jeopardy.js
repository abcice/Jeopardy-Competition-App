import Jeopardy from '../../models/Jeopardy.js';

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
// Show a single category
export async function showCategory(req, res) {
  try {
    const { id, categoryId } = req.params;
    const jeopardy = await Jeopardy.findById(id).populate('author');
    if (!jeopardy) return res.status(404).json({ msg: "Jeopardy not found" });

    const category = jeopardy.categories.id(categoryId);
    if (!category) return res.status(404).json({ msg: "Category not found" });

    res.status(200).json(category);
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
    const { categoryId } = req.params;
    const jeopardy = await Jeopardy.findById(req.params.id);
    if (!jeopardy) return res.status(404).json({ msg: "Jeopardy not found" });

    const category = jeopardy.categories.id(categoryId);
    if (!category) return res.status(404).json({ msg: "Category not found" });

    // ✅ remove the category manually
    jeopardy.categories = jeopardy.categories.filter(
      (cat) => cat._id.toString() !== categoryId
    );

    await jeopardy.save();

    res.status(200).json({ msg: "Category deleted successfully", jeopardy });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}


//Adding a question to a category
export async function addQuestion(req, res) {
  try {
    const { id, categoryId } = req.params; // ✅ take from URL
    const { text, points, dailyDouble } = req.body;

    const jeopardy = await Jeopardy.findById(id);
    if (!jeopardy) return res.status(404).json({ msg: "Jeopardy not found" });

    const category = jeopardy.categories.id(categoryId);
    if (!category) return res.status(404).json({ msg: "Category not found" });

    category.questions.push({
      text,
      points,
      dailyDouble: dailyDouble || false
    });

    await jeopardy.save();
    res.status(201).json(category.questions);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}


// Update a question
export async function updateQuestion(req, res) {
  try {
    const { id, categoryId, questionId } = req.params;
    const { text, points, dailyDouble } = req.body;

    const jeopardy = await Jeopardy.findById(id);
    if (!jeopardy) return res.status(404).json({ msg: "Jeopardy not found" });

    const category = jeopardy.categories.id(categoryId);
    if (!category) return res.status(404).json({ msg: "Category not found" });

    const question = category.questions.id(questionId);
    if (!question) return res.status(404).json({ msg: "Question not found" });

    // Update only the fields provided
    if (text !== undefined) question.text = text;
    if (points !== undefined) question.points = points;
    if (dailyDouble !== undefined) question.dailyDouble = dailyDouble;

    await jeopardy.save();

    res.status(200).json({ msg: "Question updated successfully", question });
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
    const { id, categoryId, questionId } = req.params;

    const jeopardy = await Jeopardy.findById(id);
    if (!jeopardy) return res.status(404).json({ msg: "Jeopardy not found" });

    const category = jeopardy.categories.id(categoryId);
    if (!category) return res.status(404).json({ msg: "Category not found" });

    const question = category.questions.id(questionId);
    if (!question) return res.status(404).json({ msg: "Question not found" });

    // ✅ remove the question manually
    category.questions = category.questions.filter(
      (q) => q._id.toString() !== questionId
    );

    await jeopardy.save();

    res.status(200).json({ msg: "Question deleted successfully", jeopardy });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}
