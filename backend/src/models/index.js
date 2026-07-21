const electionValidator = require('./validators/election.validator');
const userValidator = require('./validators/user.validator');
const votingValidator = require('./validators/voting.validator');

module.exports = {
  electionValidator,
  userValidator,
  votingValidator
};