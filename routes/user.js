const router = require('express').Router()
const io = require('../app');


const jwt = require('jsonwebtoken');
const {requireAuth, checkAdmin ,checkUser} = require('../middlewares/jwtMiddleware')
const userController = require('../controllers/user-controller')

const maxAge = 3 * 34 * 60 * 60;
require('dotenv').config();

const createToken = (id) => {
    return jwt.sign({id}, process.env.SECRET, {
        expiresIn:maxAge
    })
}



router.get('/user-profile/:id', userController.get_user_profile)

router.post('/signup',userController.signup)
router.post('/login',userController.login)
router.post('/signup/google', userController.google_auth)

router.get('/leaderboard', userController.get_leaderboard)

router.get('/get-blog/:id',userController.get_blog)
router.post('/check-blog', userController.check_blog)
router.post('/add-blog', userController.add_blog)
router.post('/add-submission', userController.add_submission)

router.post('/blog-like' ,userController.like_the_blog)
router.post('/blog-dislike', userController.dislike_the_blog)

router.post('/post-comment',userController.post_comment)
module.exports = router;