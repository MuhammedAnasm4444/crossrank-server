const userHelper = require("../helpers/user-helper");
const validateSignupInput = require("../validation/signup");
const jwt = require("jsonwebtoken");
const validateLoginInput = require("../validation/login");
const maxAge = 3 * 34 * 60 * 60;
const db = require("../config/connection");
const collection = require("../config/collection");

const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

require("dotenv").config();

module.exports = {
  signup: (req, res) => {
    const { errors, isValid } = validateSignupInput(req.body);
    if (!isValid) {
      console.log(errors);
      return res.status(400).json(errors);
    }
    userHelper.signup(req.body).then((response) => {
      console.log(response);
      if (response.emailErr) {
        console.log("hey");
        res.status(400).json({ message: "user already exist" });
      } else res.json({ message: "user Added" });
    });
  },
  login: (req, res) => {
    console.log(req.body);
    const { errors, isValid } = validateLoginInput(req.body);
    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    // Check User
    userHelper.login(req.body).then((response) => {
      console.log(response);
      if (response.emailNotFound) return res.status(404).json(response);
      if (response.passwordInCorrect) return res.status(400).json(response);
      else {
        // creating token
        jwt.sign(
          response,
          process.env.SECRET,
          {
            expiresIn: maxAge,
          },
          (err, token) => {
            res.json({
              success: true,
              token: token,
              message: "user Logged In",
              user: { name: response.name, id: response.id },
            });
          }
        );
      }
    });
  },
  google_auth: async (req, res) => {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    // const { name, email, picture } = ticket.getPayload();
    const userData = ticket.getPayload();
    console.log(userData);
    var user = await db
      .get()
      .collection(collection.USER)
      .findOne({ email: userData.email });
    console.log(user + "dkdkdkdkdkdk");
    if (user) {
      const payload = {
        id: user._id,
        name: user.name,
      };
      jwt.sign(
        payload,
        process.env.SECRET,
        {
          expiresIn: maxAge,
        },
        (err, token) => {
          res.json({
            success: true,
            token: token,
            message: "user Logged In",
            user: user,
          });
        }
      );
    } else {
      db.get()
        .collection(collection.USER)
        .insertOne({ name: userData.name, email: userData.email })
        .then((data) => {
          const user = data.ops[0];
          console.log("user inserted in google");
          const payload = {
            id: user._id,
            name: user.name,
          };
          jwt.sign(
            payload,
            process.env.SECRET,
            {
              expiresIn: maxAge,
            },
            (err, token) => {
              res.json({
                success: true,
                token: token,
                message: "user Logged In",
                user: user,
              });
            }
          );
        });
    }
  },
  get_user_profile:(req, res) => {
    userHelper.getUserProfile(req.params.id).then((userData) => {
      res.json(userData)
    })

  },
  get_leaderboard:(req, res) => {
    userHelper.getLeaderboard().then((data) => {
      res.json(data)
    })
  },
  get_blog:(req, res) => {
    userHelper.getBlog(req.params.id).then((response) =>{
      res.json(response)
    })
  },
  add_blog:(req, res) => {
    userHelper.addBlog(req.body).then(() => {
      res.json({message:"Blog added successfully"})
    })
  },
  add_submission: (req, res) => {
    console.log(req.body)
    userHelper.addSubmission(req.body).then(() => {
      res.json();
    });
  },
  check_blog:(req, res) => {
    userHelper.checkBlog(req.body).then((response) => {
      if(response) res.json({liked:true})
      else res.json({liked:false})

    })
  },

  like_the_blog:(req, res) => {
    console.log(req.body)
    userHelper.likeBlog(req.body).then(() =>  {
      console.log("j")
    })
  },
  dislike_the_blog:(req, res) => {
    userHelper.dislikeBlog(req.body).then(() => {
      res.json("disliked")
    })
  },
  post_comment:(req, res) => {
    userHelper.postComment(req.body).then(() => {
      res.json("comment posted")
    })
  }
 };
