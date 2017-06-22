
const Problem = require('../models/Problem');

// if solvers count is more or equal to N, then the score of this
// problem is lowerbound.
calculatePointLinear = (solversCount, N, lowerbound, upperbound) => {
    if (solversCount <= 1) {
        return upperbound;
    }
    if (solversCount >= N) {
        return lowerbound;
    }
    const R = Math.floor((upperbound - lowerbound) / (N - 1));
    return lowerbound + (N - solversCount) * R;
};

exports.ranking = (req, res) => {
    users = {};

    Problem.find().sort({ _id: -1 }).limit(100).populate('author').populate('solvers')
        .exec((err, problems) => {
            for (let i = 0; i < problems.length; i++ ) {
                const problem = problems[i];
                for (let j = 0; j < problem.solvers.length; j++) {
                    const solver = problem.solvers[j];
                    const name = solver.name();
                    if (users.hasOwnProperty(name)) {
                        users[name] += calculatePointLinear(
                            problem.solvers.length,
                            5,
                            50,
                            200);
                    } else {
                        users[name] = calculatePointLinear(
                            problem.solvers.length,
                            5,
                            50,
                            200);
                    }
                }
            }
            const userarray = Object.keys(users).map((key) => ({count: users[key], name: key}));
            userarray.sort((a, b) => {
                        if( a.count > b.count ) return -1;
                        if( a.count < b.count ) return 1;
                        return 0;
            });
            console.log(userarray);
            res.render('ranking', {
                title: 'Ranking',
                users: userarray,
            });
        });
};
