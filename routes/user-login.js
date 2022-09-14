const express = require('express');
const userHelpers = require('../helpers/user-helpers')

const router = express.Router();


//otp
const serviceSID = process.env.twilio_serviceSID;
const accountSID = process.env.twilio_accountSID;
const authToken = process.env.twilio_authToken;

const client = require('twilio')(accountSID,authToken);



router.get('/',(req,res)=>{
    if(req.session.userLoggedIn){
        res.redirect('/');
        return;//this solved the error of setting headers again?
        
    }

  
    
    let loginError = req.session.loginError; //  refresh il ith engane false aakkum?
    req.session.loginError = false;//  it was so easy..
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render('users/user-login',{loginError})
    

})


router.post('/login',async (req,res)=>{// login form route

    if(req.session.userLoggedIn){
        res.redirect('/');
        return;//this solved the error of setting headers again?
        
    }

    if(req.body.mobile=="123"){//this is developer backdoor to a logged in user interface

       await userHelpers.getSingleUser('7994818547').then((userDetails)=>{ // poi details fetch cheyth idth // 123 il ente acc idkum
            req.session.activeUser = userDetails;// ith log out il thalkaalam clear cheyyenda!


     })
        
        req.session.userLoggedIn = true; // __ login aayi kazhinj execute this two lines!!!
        res.redirect('/') 
        return;


    }
    
   
    let err= await userHelpers.mobileLogin(req.body).then((loginError,user) => {// login error has "false" if user exists aND "TRUE IF there is an error 
        
        return loginError
        
    })
    
 

    if(err){
        
        req.session.loginError = err;
        res.redirect('/user-login')
    }else{

   // mod edit

       await userHelpers.getSingleUser(req.body.mobile).then((userDetails)=>{ // poi details fetch cheyth idth 
                req.session.activeUser = userDetails;// ith log out il thalkaalam clear cheyyenda!
               

         })
// mod edit end


        req.session.mobile = req.body.mobile
        // login db condition ok aayi \/ so req.mobile lek otp ayachit redirect to otp form
        client.verify
        .services(serviceSID)
        .verifications.create({
            to: `+91${req.body.mobile}` ,
            channel: "sms"
        }).then((resp)=>{
            // console.log(resp)
            res.redirect('/user-login/otp')
        })







        // res.redirect("/user-login/otp")

      


        
        //  req.session.userLoggedIn = true; // __ login aayi kazhinj execute this two lines!!!
        //  res.redirect('/') 

    }

   

})


router.get('/otp',(req,res)=>{

    if(req.session.userLoggedIn){
        res.redirect('/')
        return;
    }

    // let loginError = req.session.loginError; //  refresh il ith engane false aakkum?
    // req.session.loginError = false;//  it was so easy..
    // res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    // res.render('user-login',{loginError})

    let otpError =req.session.otpError;
    req.session.otpError = false;

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render('users/user-otp',{otpError})





})


router.post('/otp',(req,res)=>{ // ivde otp chechk cheyth login kodukkanam

    if(req.session.userLoggedIn){
        res.redirect('/')
        return;
    }
    const otp = req.body.otpNumber

    client.verify
    .services(serviceSID)
    .verificationChecks.create({
        to: `+91${req.session.mobile}` ,
        code: otp 

    }).then((resp)=>{
        if(resp.valid){

            // userHelpers.getSingleUser(req.session.mobile).then((userDetails)=>{ // poi details fetch cheyth idth 
            //     req.session.userDetails = userDetails;// ith log out il thalkaalam clear cheyyenda!
            //     // console.log("otp de inside")
                
                
            // })// ith undefined aavunn vere route il access cheyymbo

            req.session.userLoggedIn = true; // __ login aayi kazhinj execute this two lines!!!
            res.redirect('/') 
            return;

        }else{
            req.session.otpError = true;

            res.redirect('/user-login/otp')
            return;
        }
        
    })

})




router.get('/password-login',(req,res)=>{
    if(req.session.userLoggedIn){
        res.redirect('/');
        return;//this solved the error of setting headers again?
        
    }

  
    
    let loginError = req.session.loginError; //  refresh il ith engane false aakkum?
    req.session.loginError = false;//  it was so easy..
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render('users/user-login2',{loginError})
    

})


router.post('/password-login',(req,res)=>{
    if(req.session.userLoggedIn){
        res.redirect('/');
        return;//this solved the error of setting headers again?
        
    }

    
    
    userHelpers.verifyLoginWithUsernameAndPass(req.body.username,req.body.password).then((user)=>{
        req.session.userLoggedIn = true;
        req.session.activeUser = user;
       
        res.redirect('/') 
        return;
        
       

    }).catch((err)=>{
        
        req.session.loginError = err
        res.redirect('/user-login/password-login')
      
        
    })

   

    // res.send('response of login postt')
    

})








module.exports = router;


