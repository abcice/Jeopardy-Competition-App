import * as CompetitionController from './controllers/api/competition.js';

export default function initSocket(io) {
  const buzzState = {}; // { competitionId: { locked: false, teamId: null } }

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Join a competition
    socket.on('join-competition', async ({ competitionId, teamId, role }) => {
      try {
        socket.join(competitionId);
        console.log(`${role} joined competition ${competitionId}`);

        // Player joining a team
        if (role === 'player' && teamId) {
          // Use backend controller logic directly
          const req = { params: { id: competitionId }, body: { teamId } };
          const res = {
            status: () => res,
            json: (data) => data
          };
          await CompetitionController.joinTeam(req, res);

          const compReq = { params: { id: competitionId } };
          const compRes = {
            status: () => compRes,
            json: (data) => data
          };
          const updatedCompetition = await CompetitionController.show(compReq, compRes);

          io.to(competitionId).emit('competition-updated', updatedCompetition);
        }

        // Instructor just wants competition data
        if (role === 'instructor') {
          const compReq = { params: { id: competitionId } };
          const compRes = {
            status: () => compRes,
            json: (data) => data
          };
          const updatedCompetition = await CompetitionController.show(compReq, compRes);
          io.to(competitionId).emit('competition-updated', updatedCompetition);
        }

      } catch (err) {
        console.error('Error in join-competition:', err);
        socket.emit('error', { message: 'Failed to join competition' });
      }
    });

    // Choose question
    socket.on('choose-question', ({ competitionId, question }) => {
      io.to(competitionId).emit('question-chosen', question);
    });

    // Start competition
    socket.on('start-competition', ({ competitionId }) => {
      io.to(competitionId).emit('competition-started');
    });

    // Buzz
    socket.on('buzz', ({ competitionId, teamId, questionId }) => {
      if (!buzzState[competitionId]) buzzState[competitionId] = { locked: false, teamId: null };

      if (!buzzState[competitionId].locked) {
        buzzState[competitionId] = { locked: true, teamId };
        io.to(competitionId).emit('buzz-locked', { teamId });
      } else {
        socket.emit('buzz-rejected', { reason: 'Already locked' });
      }
    });

    // Reset buzz (unlock)
    socket.on('reset-buzz', ({ competitionId }) => {
      buzzState[competitionId] = { locked: false, teamId: null };
      io.to(competitionId).emit('buzz-reset');
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
}
