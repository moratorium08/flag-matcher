const Problem = require('../models/Problem');

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  Problem.find().sort({ _id: -1 }).limit(10).populate('author')
  .exec((err, problems) => {
    res.render('home', {
      title: 'Problems',
      problems,
    });
  });
};

/**
 * POST /problem
 */
exports.postProblem = (req, res, next) => {
  console.log(req.user);
  req.assert('flag', 'Flag must be at least 4 characters long').len(4);
  req.assert('title', 'Title must be at least 4 characters long').len(4);

  const problem = new Problem({
    flag: req.body.flag,
    title: req.body.title,
    author: req.user._id,
  });

  problem.save((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
};
