export default (req, res, next) => {
  if (req.path.startsWith('/code/') || req.path.startsWith('/:id/join')) return next();
  if (req.user) return next();
  res.status(401).json({ msg: 'Unauthorized You Shall Not Pass' });
};
