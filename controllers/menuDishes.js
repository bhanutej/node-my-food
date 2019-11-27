const mongoose = require('mongoose');
const User = mongoose.model('users');
const Address = mongoose.model('addresses');
const MenuDish = mongoose.model('menudishes');
const Ingredient = mongoose.model('ingredients');

const { 
  handleErrors,
  handleUnauthorizedException
} = require('../utilities/handlePromise');

module.exports = {

  near_locations: async (req, res, next) => {
    try {
      if(isValidLatLongs(req.query.longitude, req.query.latitude)){
        const locations = await Address.aggregate([
          { $geoNear: 
            {
              near: 
              { 
                type: "Point", 
                coordinates: [parseFloat(req.query.longitude), parseFloat(req.query.latitude)]
              }, 
              distanceField: "distance", maxDistance: 6000, spherical: true, key: "geometry" 
            } 
          }]);
        res.status(200).json({ locations });
      } else {
        res.status(422).json({ error: "Please provide valid latitude and longitudes" });
      }
    } catch(error) {
      res.status(500).send({ error });
    }
  },

  menu_dishes: async (req, res, next) => {
    try {
      const user = await User.findById({_id: req.userData.userId}).populate('menuDishes');
      res.status(200).json({menuDishes: user.menuDishes});
    } catch(errors) {
      const [handledErrors, statusCode] = handleErrors(errors);
      res.status(statusCode).send(handledErrors);
    }
  },

  delete_menu_dish: async (req, res, next) => {
    try {
      const user = await User.findById({_id: req.userData.userId}).populate('menuDishes');
      await user.update({ $pull: { menuDishes: { $in: [req.params.menu_dish_id] } } } )
      await MenuDish.deleteOne({_id: req.params.menu_dish_id});
      res.status(200).json({menuDishes: user.menuDishes});
    } catch (errors) {
      const [handledErrors, statusCode] = handlePromise(errors);
      res.status(statusCode).send(handledErrors);
    }
  },

  update_menu_dish: async (req, res, next) => {
    try {
      const user = await User.findById({_id: req.userData.userId});
      if(user.menuDishes.includes(req.params.menu_dish_id)){
        let menuDish = await MenuDish.findOneAndUpdate({_id: req.params.menu_dish_id}, {...req.body}, {new: true});
        if(req.body.address_id){
          let address = await Address.findById({_id: req.body.address_id});
          menuDish.address = address;
          menuDish = await menuDish.save();
        }
        res.status(201).json({ message: 'Your updated menu is available now', menuDish });
      } else {
        res.status(401).send({ errors: handleUnauthorizedException("Menu Dish") });
      }
    } catch (errors) {
      const [handledErrors, statusCode] = handlePromise(errors);
      res.status(statusCode).send(handledErrors);
    }
  },

  create_menu_dish: async (req, res, next) => {
    try {
      let user = await User.findById({_id: req.userData.userId});
      const address = await Address.findById({_id: req.body.address_id});
      let menuDish = new MenuDish(getMenuDishObj(req.body));
      menuDish.user = user;
      menuDish.address = address;
      menuDish = await menuDish.save(); // Later implementation send notifications to near users
      user.menuDishes.push(menuDish);
      user = await user.save();
      res.status(201).json({ message: 'Your menu is available now', menuDish });
    } catch (errors) {
      const [handledErrors, statusCode] = handlePromise(errors);
      res.status(statusCode).send(handledErrors);
    }
  },

  ingredients: async (req, res, next) => {
    try {
      const ingredients = await Ingredient.find().select("_id name");
      res.status(201).send({ ingredients });
    } catch (errors) {
      const [handledErrors, statusCode] = handlePromise(errors);
      res.status(statusCode).send(handledErrors);
    }
  },

  add_ingredient: async (req, res, next) => {
    try {
      const ingredientObj = new Ingredient({name: req.body.name});
      const ingredient = await ingredientObj.save();
      res.status(201).send({message: 'Ingredient Added', ingredient});
    } catch (errors) {
      const [handledErrors, statusCode] = handlePromise(errors);
      res.status(statusCode).send(handledErrors);
    }
  },

  update_ingredient: async (req, res, next) => {
    try {
      const ingredient = await Ingredient.findByIdAndUpdate({_id: req.params.ingredient_id}, {name: req.body.name}, {new: true, runValidators: true});
      res.status(200).json({ message: 'Ingredient Updated', ingredient });
    } catch (errors) {
      const [handledErrors, statusCode] = handlePromise(errors);
      res.status(statusCode).send(handledErrors);
    }
  },

  delete_ingredient: async (req, res, next) => {
    try {
      await handlePromise(Ingredient.deleteOne({_id: req.params.ingredient_id}));
      res.status(200).json({ message: 'Ingredient Deleted' });
    } catch (errors) {
      const [handledErrors, statusCode] = handlePromise(errors);
      res.status(statusCode).send(handledErrors);
    }
  }
};

getMenuDishObj = (menu) => {
  return {
    name: menu.name,
    ingredients: menu.ingradients,
    description: menu.description,
    quantity: menu.quantity,
    price: menu.price,
    dishType: menu.dishType
  }
}

updateMenuDish = async (menuDish, menuObj, address) => {
  menuDish.name = menuObj.name;
  menuDish.ingredients = menuObj.ingradients;
  menuDish.description = menuObj.description;
  menuDish.quantity = menuObj.quantity;
  menuDish.price = menuObj.price;
  menuDish.dishType = menuObj.dishType;
  menuDish.address = address;
  await menuDish.save();
  return menuDish;
}

isValidLatLongs = (latitude, longitude) => {
  if (latitude === undefined || longitude === undefined) {
    return false;
  } else if (!isNumber(latitude) || !isNumber(longitude)) {
    return false;
  }
  return true;
}

isNumber = (n) => {
  return Number(n) === parseFloat(n);
}
