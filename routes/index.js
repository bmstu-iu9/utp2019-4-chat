const express = require('express');
const router = express.Router();
const path = require('path');
const { ensureAuthenticated, forwardAuthenticated } = require(__dirname + '/../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req,res)=>{
  res.sendFile(path.join(__dirname, '../pages/login.html'));
})

// Dashboard
router.get('/pages/chat.html', ensureAuthenticated, (req, res) =>
  res.sendFile(path.join(__dirname, '../pages/chat.html'), {user: req.user})
);

module.exports = router;
