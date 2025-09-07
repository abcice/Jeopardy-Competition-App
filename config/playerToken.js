import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function createPlayerToken({ teamId, competitionId }) {
  const payload = {
    teamId,
    competitionId,
  };
  return jwt.sign(payload, process.env.PLAYER_SECRET, { expiresIn: '12h' });
}

export function verifyPlayerToken(token) {
  try {
    return jwt.verify(token, process.env.PLAYER_SECRET);
  } catch (err) {
    return null;
  }
}
