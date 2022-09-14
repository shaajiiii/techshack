const express = require('express');

const router = express.Router();

router.get('/',(req,res)=>{

    req.session.userLoggedIn = false;
    req.session.activeUser._id =null;
    res.redirect('/')

})

module.exports = router;
