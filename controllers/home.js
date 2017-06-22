const Problem = require('../models/Problem');

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  Problem.find().sort({ _id: -1 }).limit(100).populate('author')
  .exec((err, problems) => {
    res.render('home', {
      title: 'Problems',
      problems,
    });
  });
};

exports.home2 = (req, res) => {
  Problem.find().sort({ _id: -1 }).limit(100).populate('author')
  .exec((err, problems) => {
    res.render('home2', {
      title: 'Problems',
      problems,
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

/**
 * GET /problem/:id
 */
exports.getProblem = (req, res, next) => {
  const id = req.params.id;

  Problem.findOne({ _id: id }).populate('author').populate('solvers').exec((err, problem) => {
    if (err) { return next(err); }
    if (!problem) { return next(); }
    res.render('problem', {
      title: problem.title,
      problem,
      isSolved: problem.solvers.some(solver => solver.equals(req.user._id)),
    });
  });
};

/**
 * POST /problem/:id
 */
exports.postFlag = (req, res, next) => {
  const id = req.params.id;
  req.assert('flag', 'Flag must be at least 4 characters long').len(4);

  Problem.findOne({ _id: id }).exec((err, problem) => {
    if (err) { return next(err); }
    if (!problem) { return next(); }

    if (problem.solvers.some(solver => solver.equals(req.user._id))) {
      req.flash('errors', { msg: 'You already solved this problem' });
      return res.redirect(`/problem/${id}`);
    }

    problem.compareFlag(req.body.flag, (err, isMatch) => {
      if (err) { return next(err); }

      if (!isMatch) {
        req.flash('errors', { msg: 'Flag not match' });
        res.redirect(`/problem/${id}`);
      } else {
        req.flash('info', { msg: 'Flag matched' });
        problem.solvers.push(req.user._id);
        problem.save((err) => {
          if (err) { return next(err); }
          res.redirect(`/problem/${id}`);
        });
      }
    });
  });
};
