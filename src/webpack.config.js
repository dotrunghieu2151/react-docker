const { commonModule } = require('./webpack.common');

module.exports = (env, { mode }) => {
  return commonModule(env, { mode })
};
