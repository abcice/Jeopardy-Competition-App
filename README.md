# 🎯 Jeopardy Competition App

## 📖 Description
This is a **Jeopardy-style multiplayer competition app** designed for classrooms, clubs, or events. Instructors can create and manage competitions with categories, questions, scores, and special rules like **Daily Doubles**.  

Competing teams can join the game remotely (without installing the app) via a shared game link. The app features a real-time question board, live score updates, and team buzzers.  

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

- **Daily Double**
  - Teams bid points for Daily Double questions.
  - Bid cannot exceed the team’s current score.
  - Correct answers → double the bid points.
  - Incorrect answers → lose the bid points.

- **Question Board**
  - Displays categories and questions in a table format.
  - Instructor selects a question → displayed to all competitors.
  - Teams can **buzz in** to answer.

- **Team Management**
  - Teams join via a **shared game link** (no app installation required).
  - Instructor assigns each team a color or number.
  - Teams compete in real-time using the buzzers.

- **Real-Time Gameplay**
  - Socket.IO handles real-time events (buzzing, answers, scores).
  - Instructor sees live updates of team responses.
  - Teams see real-time score updates.

---

## 🌐 Multiplayer Participation

- Teams join via a **unique game link** shared by the instructor.
- Accessible from any computer, phone, or tablet without installing the app.
- Alternative (LAN setup):
  - Instructor runs the app locally.
  - Teams connect using the instructor’s IP address + port.

---

## 👤 User Stories

### ✅ Accounts & Setup
- [ ] As a user, I want to create an account to host competitions.
- [ ] As a user, I want to create a competition with customizable settings.
- [ ] As a user, I want to choose the number of categories.
- [ ] As a user, I want to choose the number of questions per category.
- [ ] As a user, I want to assign scores to each question.
- [ ] As a user, I want to select which question will be a **Daily Double**.

### ✅ Competition Gameplay
- [ ] As a user, I want a question board to view all categories and questions.
- [ ] As a user, I want to select a question from the board to show to all teams.
- [ ] As a team, I want to buzz in when I know the answer.
- [ ] As a team, I want scores to update in real-time based on answers.

### ✅ Daily Double
- [ ] As a team, I want to bid scores for Daily Double questions.
- [ ] As a team, I cannot bid more than my current score.
- [ ] As a team, I want to win double the points if I answer correctly.
- [ ] As a team, I want to lose the points if I answer incorrectly.

### ✅ Multiplayer / Connectivity
- [ ] As an instructor, I want to share a game link so teams can join remotely.
- [ ] As a team, I want to join via a link without installing the app.
- [ ] As a team, I want a simple interface to buzz in, answer questions, and view scores.
- [ ] As an instructor, I want to track which team buzzed first and control answering.

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
- Ability to import/export question sets.

---

## ⚡ Notes

- Instructor can distinguish teams by **color or number**.  
- The question board will show categories, questions, and scores.  
- Teams can join without creating a user account (via shared link).  
- Daily Double bidding ensures teams cannot risk more than they have.  

