const router = require("express").Router();
const bcryptjs = require('bcryptjs');
const User=require("../models/User.model")
const saltRounds = 10;
/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

module.exports = router;
router.get('/login', (req, res, next) => {
   
  res.render("./login.hbs");
  })

  // POST route ==> to process form data
  
  router.post('/login', (req, res, next) => {
  
    // console.log("The form data: ", req.body);
      const { username,  password } = req.body;
      

      const saltRounds = 10;
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
      })
      .catch(error => next(error));
  });