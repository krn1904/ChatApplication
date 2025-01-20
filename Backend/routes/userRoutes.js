const express = require('express');
const router = express.Router();
const { CreateUser, LoginUser, AllUsers, UpdateUser } = require('../UserController/Users');

router.post('/register', CreateUser);
router.post('/login', LoginUser);
router.get('/all', AllUsers);
router.put('/:userId', UpdateUser);

module.exports = router; 