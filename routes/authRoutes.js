const passport = require('passport');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/users/profilePics/');
  },
  filename: function(req, file, cb) {
    const fileName = (new Date().toISOString() + file.originalname).split(':').join('');
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
} 

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 //1MB File accespts if you need 2MB Max file  multply with 2 (1024 * 1024 * 2)
  },
  fileFilter: fileFilter
});

const UsersController = require('../controllers/users');

module.exports = (app) => {
  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));
  
  app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
    res.send(req.user);
  });

  app.post('/auth/jwt', passport.authenticate('jwt', { session: false }),
    function(req, res) {
      res.send(req.user);
    }
  );
    
  app.post('/api/signup', upload.single('profilePic'), UsersController.user_jwt_signup);

  app.post('/api/signin', UsersController.user_jwt_signin);

  app.get('/api/current_user', (req, res) => {
    res.send(req.user);
  });
  
  app.get('/api/logout', (req, res) => {
    req.logout();
    res.send(req.user);
  });  
};
