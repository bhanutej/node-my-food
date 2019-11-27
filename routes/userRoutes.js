const checkAuth = require('../middleware/checkAuth');
const UsersController = require('../controllers/users');

module.exports = (app) => {
  app.get('/api/users', UsersController.get_users);
};
