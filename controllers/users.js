const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = mongoose.model('users');
const Address = mongoose.model('addresses');
const keys = require('../config/keys');
const { 
  handleErrors,
  handleUnauthorizedException
} = require('../utilities/handlePromise');

module.exports = {
  get_users: async (req, res, next) => {
    try{
      const users = await User.find();
      res.status(200).send({ users });
    } catch (error) {
      const [handledErrors, statusCode] = handleErrors(errors);
      res.status(statusCode).send(handledErrors);
    }
  },

  user_jwt_signup: async (req, res, next) => {
    try{
      const passwordHash = await bcrypt.hash(req.body.password, 10);
      const userObj = new User(getJwtUserObj(req.body, req.file, passwordHash));
      const user = await userObj.save();
      res.status(201).send({message: 'User created', user});
    } catch (error) {
      if(error.code === 11000 && error.name === 'MongoError'){
        res.status(422).send({error: "Email already existed"});
      }
      res.status(500).send({ error });
    }
  },

  user_jwt_signin: async (req, res, next) => {
    try{
      const user = await User.findOne({email: req.body.email});
      if(user){
        const checkPassword = await bcrypt.compare(req.body.password, user.password);
        if(checkPassword){
          const token = getSignInJwtToken(user);
          const userData = { email: user.email, id: user._id, token };
          return res.status(200).json({ message: 'Auth Successfull', userData });
        }
      }
      res.status(401).json({error: 'Auth Failed'});
    } catch (error) {
      res.status(500).send({ error });
    }
  },

  create_user_address: async (req, res, next) => {
    try{
      const user = await User.findById({_id: req.userData.userId});
      if(user){
        const address = new Address(getAddressObj(req.body));
        address.user = user;
        await address.save();
        user.addresses.push(address);
        await user.save();
        res.status(201).json({ message: 'Address Created', user });
      } else {
        res.status(404).send({ error: "User Not Found" });
      }
    } catch(error) {
      res.status(500).send({ error })
    }
  },
  
  update_user_address: async (req, res, next) => {
    try {
      const user = await User.findById({_id: req.userData.userId});
      if(user.addresses.includes(req.params.address_id)){
        const address = await Address.findByIdAndUpdate({_id: req.params.address_id}, getAddressObj(req.body), { new: true, runValidators: true })
        res.status(200).json({ message: 'Address Updated', address });
      } else {
        res.status(401).send({ error: "Unauthorized Access" });
      }
    } catch (error) {
      res.status(500).send({ error });
    }
  },
  
  user_addresses: async (req, res, next) => {
    try {
      const user = await User.findById({_id: req.userData.userId}).populate('addresses');
      res.status(200).json({address: user.addresses});
    } catch (error) {
      res.status(500).send({ error });
    }
  },
  
  delete_address: async (req, res, next) => {
    try {
      const user = await User.findById({_id: req.userData.userId}).populate('addresses');
      await user.update({ $pull: { addresses: { $in: [req.params.address_id] } } } )
      await Address.findByIdAndUpdate({_id: req.params.address_id}, {deletedAt: new Date()});
      res.status(200).json({address: user.addresses});
    } catch(error) {
      res.status(500).send({ error });
    }
  }
};

getAddressObj = (address) => {
  return {
    streetOne: address.streetOne,
    streetTwo: address.streetTwo,
    city: address.city,
    state: address.state,
    landmark: address.landmark,
    country: address.country,
    pincode: address.pincode,
    latitude: address.latitude,
    longitude: address.longitude,
    geometry: address.geometry
  }
}

getJwtUserObj = (user, profilePic, hash) => {
  return {
    userType: 'Jwt',
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: hash,
    profilePic: profilePic ? profilePic.path : ""
  };
}

getSignInJwtToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      userId: user._id
    },
    keys.jwtClientSecret,
    {
      expiresIn: '24h'
    }
  );
}
