const router = require('express').Router()
const adminController = require("../controllers/admin-controller");

// admin auth routes
router.post('/login', adminController.login)

// challenges routes
router.get('/challenges', adminController.get_challenges)
router.get('/get-challenge/:id', adminController.get_challenge)
router.post('/add-challenge', adminController.add_challenge)
router.post('/edit-challenge', adminController.edit_challenge)
router.get('/remove-challenge/:id', adminController.remove_challenge)

// task routes
router.post('/add-task', adminController.add_task)
router.get('/get-task/', adminController.get_task)

// add test case 
router.post('/add-testCase', adminController.add_test_case)
// code sumbit 
router.post('/submit-code' ,adminController.submit_code)

// user list routes
router.get('/get-users',adminController.get_users)


module.exports = router; 