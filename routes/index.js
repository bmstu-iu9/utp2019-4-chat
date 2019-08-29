const express = require('express');
const router = express.Router();
const path = require('path');
const { ensureAuthenticated, forwardAuthenticated } = require('../../../../Desktop/utp2019-4-chat-master-2/config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req,res)=>{
  res.sendFile(path.join(__dirname, '../pages/login.html'));
})

// Dashboard
router.get('/pages/chat.html', ensureAuthenticated, (req, res) =>
  res.sendFile(path.join(__dirname, '../pages/chat.html'), {user: req.user})
);

module.exports = router;
