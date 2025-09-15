# 🎯 Jeopardy Competition App
[Wireframe](https://excalidraw.com/#json=8P05yYj6QJSbCXiCcbAPe,eQhRQan-bNK70FBB4pwwlg)  
🌐 **Live Demo:** [https://jeopardy-competition-app.onrender.com/](https://jeopardy-competition-app.onrender.com/)

## 📖 Description
This is a **Jeopardy-style multiplayer competition app** designed for classrooms, clubs, or events. Instructors can create and manage competitions with categories, questions, scores, and special rules like **Daily Doubles**.  

**Markdown Support:** Questions and answers support **Markdown formatting**. For example, adding `#` before words will make them bigger (like headings), and you can use `**bold**`, `_italic_`, code blocks, lists, etc. This makes questions and answers more expressive and visually clear.  

Competing teams can join the game remotely via a shared link (no installation required). The app features a real-time **question board**, **buzzers**, **live score updates**, and team management.

---

## ✨ Key Features

- **User Accounts & Authentication**
  - Users can register and log in.
  - Each user can create and manage competitions.

- **Competition Setup**
  - Instructor creates a competition.
  - Decide the number of categories and questions per category.
  - Assign scores to each question.
  - Select **Daily Double** questions.
  - Questions can include **Markdown formatting**, **text**, or **code blocks** (rendered like Visual Studio or GitHub style).

- **Question Board**
  - Displays **categories and questions** in a table format.
  - Questions are **crossed out** once answered, so each can be used only once.
  - Instructor selects a question → displayed on the **Question Page**.
  
- **Question Page (for Teams)**
  - Shows the selected question only.
  - Teams can press the **Buzz button**:
    - First team to press → entitled to answer first.
    - Only the team currently entitled can answer.
  - No other buttons available for teams.
  
- **Question Page (for Instructor)**
  - **Correct button:** marks the question as correctly answered; points awarded; answer shown; question crossed off.
  - **Wrong button:** marks the answer as wrong; points not awarded; teams can buzz again (even the same team that answered incorrectly).
  - **Skip button:** skips the question; points not awarded; answer shown; question crossed off.

- **Daily Double**
  - Teams bid points when a Daily Double question appears.
  - Bid cannot exceed current team score.
  - Correct answer → double the bid points.
  - Incorrect answer → lose the bid points.

- **Team Management**
  - Teams join via a **shared game link** (no app installation or account required).
  - Instructor assigns each team a **color or number** for identification.
  - Teams compete in real-time using **buzzers**.
  - Teams see **live score updates**.

- **Real-Time Gameplay**
  - Socket.IO handles real-time events:
    - Team buzzes.
    - Instructor marks correct/wrong/skip.
    - Scores updated in real-time.
    - Question board updates with crossed-out questions.

---

## 🌐 Multiplayer / Connectivity

- Teams can join from **any computer, phone, or tablet** using a shared game link.
- No user account required for competing teams.
- Alternative LAN setup:
  - Instructor runs the app locally.
  - Teams connect using the instructor’s IP + port.

---

## 🖥️ Pages Overview

- **Login Page**: User login form (email & password).  
- **Register Page**: User registration form (name, email, password).  
- **Dashboard**: Instructor view: all created competitions; can select a competition to run or edit.  
- **Create Jeopardy / Create Competition**: Form to create categories and questions; assign scores; select Daily Double questions; supports Markdown, text, and code blocks.  
- **Run Competition**: Display teams, scores, and question board; real-time buzzers for teams; select questions for teams to answer; track first buzz.  
- **Question Page**: Shows the selected question only.  
  - Teams: buzz to answer.  
  - Instructor: mark correct, wrong, or skip.  
- **Scoreboard**: Shows all teams and their scores in descending order.

---

## 👤 User Stories

### ✅ Accounts & Setup
- [ ] As a user, I want to create an account to host competitions.
- [ ] As a user, I want to create a competition with customizable settings.
- [ ] As a user, I want to choose the number of categories and questions.
- [ ] As a user, I want to assign scores to each question.
- [ ] As a user, I want to select which question will be a **Daily Double**.
- [ ] As a user, I want to write questions and answers using **Markdown** for formatting.

### ✅ Competition Gameplay
- [ ] As a user, I want a **question board** showing all categories and questions.
- [ ] As a user, I want answered questions to be **crossed off**.
- [ ] As an instructor, I want to select a question to show to all teams.
- [ ] As a team, I want to **buzz in** to answer questions.
- [ ] As a team, only the first to buzz gets to answer.
- [ ] As an instructor, I want to mark answers as **correct, wrong, or skip**.
- [ ] As a team, I want to be able to buzz again if the previous answer was wrong.
- [ ] As a team, I want scores to update in real-time.

### ✅ Daily Double
- [ ] As a team, I want to bid points for Daily Double questions.
- [ ] As a team, I cannot bid more than my current score.
- [ ] As a team, I want to win double the points if correct.
- [ ] As a team, I want to lose the points if incorrect.

### ✅ Multiplayer / Connectivity
- [ ] As an instructor, I want to share a **game link** so teams can join remotely.
- [ ] As a team, I want to join via a link without creating an account.
- [ ] As a team, I want a simple interface to buzz in and see scores.
- [ ] As an instructor, I want to track which team buzzed first and control the answering.

---

## 🚀 Tech Stack

- **Frontend:** React  
- **Backend:** Node.js + Express  
- **Database:** MongoDB (Mongoose)  
- **Real-time Communication:** Socket.IO  

---

## 🔮 Future Enhancements

- Final Jeopardy round with wagering mechanics.
- Timer for each question.
- Leaderboard across multiple competitions.
- Import/export question sets.

---

## ⚡ Notes

- Instructor can distinguish teams by **color or number**.  
- Daily Double bidding ensures teams cannot risk more than they have.  
- The **question board** dynamically updates as questions are answered.  
- Teams only interact with **buzzing**; all other controls are instructor-only.  
- **Markdown support** allows formatting in questions and answers (headings, bold, italics, lists, code blocks, etc.).
