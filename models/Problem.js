const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: String,
  flag: String,
  description: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  solvers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

/**
 * Flag hash middleware.
 */
problemSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('flag')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.flag, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.flag = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
problemSchema.methods.compareFlag = function compareFlag(candidateFlag, cb) {
  bcrypt.compare(candidateFlag, this.flag, (err, isMatch) => {
    cb(err, isMatch);
  });
};

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
