const router = require("express").Router();
const bcryptjs = require('bcryptjs');
const User=require("../models/User.model")
const saltRounds = 10;
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');
/* GET home page */
router.get("/", (req, res, next) => {
  res.render("./index");
});

module.exports = router;


  // POST route ==> to process form data
  
  router.post('/signup', (req, res, next) => {
  
    // console.log("The form data: ", req.body);
      const { username,  password } = req.body;
      const saltRounds = 10;
      const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;

    /*  if (!regex.test(password)) {
    
        res
    
          .status(500)
    
          .render('./signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
    
        return;
    
      }
*/
      bcryptjs
      .genSalt(saltRounds)
      .then(salt => bcryptjs.hash(password, salt))
      .then(hashedPassword => {
        return User.create({
          // username: username
          username,
                 // passwordHash => this is the key from the User model
          //     ^
          //     |            |--> this is placeholder (how we named returning value from the previous method (.hash()))
          passwordHash: hashedPassword
        });
      })
      .then(userFromDB => {
        console.log('Newly created user is: ', userFromDB);
        res.render("./user-profile");
      })
      .catch(error => next(error));
  });
  
  
  router.get('/signup', (req, res, next) => {
   
    res.render("./signup.hbs");
    })
  
  
  
    router.get('/login', (req, res, next) => {
   
      res.render("./login.hbs");
      })
  
  
    router.post('/login', (req, res, next) => {
    const { username, email, password } = req.body;
   
    // make sure users fill all mandatory fields:
    if (!username || !password) {
      res.render('./login', { errorMessage: 'All fields are mandatory. Please provide your username, email and password.' });
      return;
      } 
      User.findOne({ "username":username })
      .then(user => {


        console.log('SESSION =====> ', req.session);
        if (!user) {
          res.render('./login.hbs', { errorMessage: 'Email is not registered. Try with other email.' });
          return;
        } else if (bcryptjs.compareSync(password, user.passwordHash)) {
          
          req.session.currentUser = user;
          res.render('./user-profile',{ userInSession: req.session.currentUser });
        } else {
          res.render('./login', { errorMessage: 'Incorrect password.' });
        }
      })  
    .catch(error => {debugger
     if (error instanceof mongoose.Error.ValidationError) {

        res.status(500).render('./signup', { errorMessage: error.message });

      } else if (error.code === 11000) {

        res.status(500).render('./signup', {

           errorMessage: 'Username and email need to be unique. Either username or email is already used.'

        });

      } else {

        next(error);

      }

    });

  })

  router.get('/user-profile',isLoggedIn, (req, res) => {
    res.render('./user-profile', { userInSession: req.session.currentUser });
  });

  router.post('/logout', (req, res, next) => {
    req.session.destroy(err => {
      if (err) next(err);
      res.redirect('/');
    });
  });
 // ... the rest of the code stays unchanged
 router.get('/private',isLoggedIn, (req, res) => {
  res.render('./private', { userInSession: req.session.currentUser });
});
router.get('/main',isLoggedIn, (req, res) => {
  res.render('./main', { userInSession: req.session.currentUser });
});