const checkAuth = require('../middleware/checkAuth');
const UsersController = require('../controllers/users');

module.exports = (app) => {
  app.post('/api/create_address', checkAuth, UsersController.create_user_address);
  app.patch('/api/update_address/:address_id', checkAuth, UsersController.update_user_address);
  app.get('/api/user_addresses', checkAuth, UsersController.user_addresses);
  app.delete('/api/delete_address/:address_id', checkAuth, UsersController.delete_address);
};
