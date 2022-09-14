const express = require('express');
const router = express.Router();
const userHelpers = require('../helpers/user-helpers')

router.get('/',async (req,res)=>{
     res.render('test')
   
    
});

module.exports=router;