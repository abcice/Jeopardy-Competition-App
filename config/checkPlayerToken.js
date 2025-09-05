import { verifyPlayerToken } from '../src/utilities/playerToken.js';

export default (req, res, next) => {
  let token = req.get('Authorization');
  if (!token) return res.status(401).json({ msg: 'Player token required' });

  token = token.split(' ')[1];
  const decoded = verifyPlayerToken(token);
  if (!decoded) return res.status(401).json({ msg: 'Invalid or expired player token' });

  req.player = decoded; // contains teamId & competitionId
  next();
};
