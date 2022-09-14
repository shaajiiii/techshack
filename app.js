const express = require('express');
const app = express();
const port = 7000 // LANDING PAGE PORT

// env config

const dotenv = require('dotenv');
dotenv.config();

//db connection file importing
const db = require('./config/connection')

const session = require('express-session')// session module

//file upload module
const fileUpload = require('express-fileupload')



// requiring route modules
const indexRouter = require('./routes/index');
const userloginRouter = require('./routes/user-login');
const userSignUpRouter = require('./routes/user-sign-up');
const adminRouter = require('./routes/adminRouter')
const userLogoutRouter = require('./routes/user-logout')
const testRouter = require('./routes/test')
const userProfileRouter = require('./routes/user-profile')


 // session middleware
app.use(session({
    secret: "key used",
    resave: false,
    saveUninitialized:false,
    
  }))

//db connection
db.connect((err)=>{
    if(err) console.log("there is an error in db connection"+ err)
    else console.log("Database connection Successful")
})






//setting the view engine
app.set('view engine','ejs');



// middlewares
app.use(express.static('public'));// setting up static files
app.use(express.urlencoded({ extended: false }));//parsing url -  body object
app.use(fileUpload())// fileupload module









// routers
app.use('/',indexRouter);
app.use('/user-login',userloginRouter);
app.use('/user-sign-up',userSignUpRouter);
app.use('/admin',adminRouter);
app.use('/user-logout',userLogoutRouter);
app.use('/test',testRouter);
app.use('/user-profile',userProfileRouter); 



//404 not found
app.use((req, res,next) =>{
    res.render('404')
 });




app.listen(port,()=>{
    console.log("the app is running and listening!")
});