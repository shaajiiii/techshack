const express = require('express');
const router = express.Router();
const userHelpers=require('../helpers/user-helpers')

router.get('/',(req,res)=>{
    if(req.session.userLoggedIn){
        res.redirect('/');
        return;//this solved the error of setting headers again?
        
    }
    let signUpError = req.session.emailExists;
    req.session.emailExists = false;
    res.render('users/user-sign-up',{signUpError})

})


router.post('/signup',(req,res)=>{// signup form post route

    userHelpers.checkUserEmailExists(req.body).then((resp)=>{
        
        if(resp.value){
            req.session.emailExists = true;
            res.redirect('/user-sign-up')

        }else{
            req.session.emailExists = false;
            userHelpers.addUser(req.body,(result)=>{ // inserting sign up form data to db
                res.redirect('/user-login')
            });

        }
    })
  
    

})

//======================================================= above things are okeyy



// referral sign-up


router.get('/ref/:refName', async (req,res)=>{

    if(req.session.userLoggedIn){
        res.redirect('/');
        return;//this solved the error of setting headers again?
        
    }

    let refName = req.params.refName;
  

    let signUpError = req.session.emailExists;
    req.session.emailExists = false;

 
    await userHelpers.refNameExists(refName).then((resp)=>{

        if(resp.status==true){
           
            res.render('users/user-sign-up-ref',{signUpError,refName})
        }else{
            res.render('500')
        }
       
       
      

    })

    

})




router.post('/signup/ref',(req,res)=>{// signup form post route set aayiii

 

    userHelpers.checkUserEmailExists(req.body).then((resp)=>{
        
        if(resp.value){
            req.session.emailExists = true;
            res.redirect('/user-sign-up/ref/'+req.body.refName)

        }else{ // login lek redirect aavanam ellaam kainjit
           

            req.session.emailExists = false;
            
            userHelpers.addUserWithCoins(req.body).then(()=>{

                userHelpers.creditCoins(req.body.refName).then(()=>{
                    res.redirect('/user-login')
                })
                
              
            })
            

        }
    })
   
  
    

})




module.exports = router;


