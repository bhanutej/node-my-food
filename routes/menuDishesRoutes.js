const checkAuth = require('../middleware/checkAuth');
const MenuDishesController = require('../controllers/menuDishes');

module.exports = (app) => {
  app.get('/api/near_locations', checkAuth, MenuDishesController.near_locations);
  app.get('/api/menu_dishes', checkAuth, MenuDishesController.menu_dishes);
  app.post('/api/create_menu_dish', checkAuth, MenuDishesController.create_menu_dish);
  app.patch('/api/update_menu_dish/:menu_dish_id', checkAuth, MenuDishesController.update_menu_dish);
  app.delete('/api/delete_menu_dish/:menu_dish_id', checkAuth, MenuDishesController.delete_menu_dish);
  app.get('/api/ingredients', MenuDishesController.ingredients);
  app.post('/api/add_ingredient', MenuDishesController.add_ingredient);
  app.patch('/api/update_ingredient/:ingredient_id', MenuDishesController.update_ingredient);
  app.delete('/api/delete_ingredient/:ingredient_id', MenuDishesController.delete_ingredient);
};
