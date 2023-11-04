module.exports = (theFu) => (req, res, next) => {
  Promise.resolve(theFu(req, res, next)).catch(next);
};


