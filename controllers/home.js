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
 * GET /problem/:id
 */
exports.getProblem = (req, res, next) => {
  const id = req.params.id;

  Problem.findOne({ _id: id }).populate('author').exec((err, problem) => {
    if (err) { return next(err); }
    console.log(problem);
    res.render('Problem', {
      title: problem.title,
      problem,
    });
  });
};

/**
 * POST /problem
 */
exports.postProblem = (req, res, next) => {
  req.assert('flag', 'Flag must be at least 4 characters long').len(4);
  req.assert('description', 'Flag must be at least 10 characters long').len(10);
  req.assert('title', 'Title must be at least 4 characters long').len(4);

  const problem = new Problem({
    flag: req.body.flag,
    title: req.body.title,
    description: req.body.description,
    author: req.user._id,
  });

  problem.save((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
};
