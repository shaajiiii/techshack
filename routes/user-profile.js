const express = require('express');

const router = express.Router();

const userHelpers = require('../helpers/user-helpers')

router.get('/', async (req, res) => { // user "My profile page"

    if (!req.session.userLoggedIn) {
        res.redirect('/user-login')
        return;

    }

    let userLoggedIn = req.session.userLoggedIn;
    let cartCount = null;
    let wishlistCount = null;
    if (req.session.activeUser) {

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);
        wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 

    }

    if (!userLoggedIn) {  // clears the cart number bug (showing cart number after log out)
        cartCount = null;
    }

    let searchKey = false;

    res.render('users/user-profile', { userLoggedIn, cartCount, wishlistCount , searchKey})

})

router.get('/user-orders', async (req, res) => {  // order histroy page


    if (!req.session.userLoggedIn) {
        res.redirect('/user-login')
        return;

    }

    let userLoggedIn = req.session.userLoggedIn;
    let cartCount = null;
    let wishlistCount = null
    if (req.session.activeUser) {

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);
        wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 

    }

    if (!userLoggedIn) {  // clears the cart number bug (showing cart number after log out)
        cartCount = null;
    }

    // let orderListProducts= await userHelpers.getOrderProducts(req.session.activeUser._id);


    // console.log(orderListProducts)

    let ordersList = await userHelpers.getOrderDetails(req.session.activeUser._id);

    let searchKey = false;



    res.render('users/user-order-history', { userLoggedIn, cartCount, ordersList, wishlistCount , searchKey })


})

router.get('/cancel-order/:orderId', (req, res) => {

    userHelpers.cancelOrder(req.params.orderId)
    res.redirect('/user-profile/user-orders')
})


router.get("/view-order-details/:orderId", async (req, res) => {  // route that fetches single order details( detailed view of order)

    if (!req.session.userLoggedIn) {
        res.redirect('/user-login')
        return;

    }

    let userLoggedIn = req.session.userLoggedIn;
    let cartCount = null;
    let wishlistCount = null;
    if (req.session.activeUser) {

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);
        wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 

    }

    if (!userLoggedIn) {  // clears the cart number bug (showing cart number after log out)
        cartCount = null;
    }



    let orderDetails = await userHelpers.getSingleOrderDetails(req.params.orderId);
    let products = await userHelpers.getProductsDetailsOfOrder(req.params.orderId);

    let searchKey = false;

    res.render('users/user-single-order-details', { orderDetails, products, userLoggedIn, cartCount , wishlistCount,searchKey})




})



router.get('/edit-user-profile', async (req, res) => { // profile edit page for user

    if (!req.session.userLoggedIn) {
        res.redirect('/user-login')
        return;

    }

    let userLoggedIn = req.session.userLoggedIn;
    let cartCount = null;
    let wishlistCount= null;
    if (req.session.activeUser) {

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);
        wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 

    }

    if (!userLoggedIn) {  // clears the cart number bug (showing cart number after log out)
        cartCount = null;
    }


    let userDetails = await userHelpers.getUserDetailsWithUserId(req.session.activeUser._id);
    

    let searchKey = false;




    res.render('users/user-edit-profile', { userLoggedIn, cartCount, userDetails, wishlistCount , searchKey})

})


router.post('/edit-user-profile', (req, res) => {


    let Id = req.session.activeUser._id;
    userHelpers.editUserDetails(req.body, req.session.activeUser._id).then(() => {

        if(req.files==null){
            res.redirect('/user-profile');
            return;
        }

        
            let image = req.files.image;
            image.mv('./public/user-images/'+ Id +'.png', (err, done) => {
                if (!err) {
                    res.redirect('/user-profile');
                    return;
                } else {
                    console.log(err)
                }
            })


     
        
    })






})


// address section     addresses





router.get('/addresses', async (req, res) => { // address list page

    if (!req.session.userLoggedIn) {
        res.redirect('/user-login')
        return;

    }

    let userLoggedIn = req.session.userLoggedIn;
    let cartCount = null;
    let wishlistCount= null;
    if (req.session.activeUser) {

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);
        wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 

    }

    if (!userLoggedIn) {  // clears the cart number bug (showing cart number after log out)
        cartCount = null;
    }


    let userDetails = await userHelpers.getUserDetailsWithUserId(req.session.activeUser._id);
    

    let searchKey = false;




    res.render('users/user-addresses', { userLoggedIn, cartCount, userDetails, wishlistCount ,searchKey })

})




router.get('/user-add-address', async (req, res) => { // add new address form

    if (!req.session.userLoggedIn) {
        res.redirect('/user-login')
        return;

    }

    let userLoggedIn = req.session.userLoggedIn;
    let cartCount = null;
    let wishlistCount= null;
    if (req.session.activeUser) {

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);
        wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 

    }

    if (!userLoggedIn) {  // clears the cart number bug (showing cart number after log out)
        cartCount = null;
    }


    let userDetails = await userHelpers.getUserDetailsWithUserId(req.session.activeUser._id);
    



    let searchKey = false;


    res.render('users/user-add-address', { userLoggedIn, cartCount, userDetails, wishlistCount, searchKey })

})


// setting new address


router.post('/user-add-address',(req,res)=>{

    

    let Id = req.session.activeUser._id;

    

    userHelpers.addAddressToUserId(req.body,Id).then(()=>{

        res.redirect("/user-profile/addresses")
    })

   
})

router.get("/delete-address/:address",(req,res)=>{

    
    let Id = req.session.activeUser._id;

  

    userHelpers.deleteAddressToUserId(req.params.address,Id).then(()=>{

        res.redirect("/user-profile/addresses")
    })
    

})


router.get("/change-password", async(req,res)=>{

    if (!req.session.userLoggedIn) {
        res.redirect('/user-login')
        return;

    }

    let userLoggedIn = req.session.userLoggedIn;
    let cartCount = null;
    let wishlistCount= null;
    if (req.session.activeUser) {

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);
        wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 

    }

    if (!userLoggedIn) {  // clears the cart number bug (showing cart number after log out)
        cartCount = null;
    }


    let userDetails = await userHelpers.getUserDetailsWithUserId(req.session.activeUser._id);
    



    let searchKey = false;


    res.render('users/user-change-password', { userLoggedIn, cartCount, userDetails, wishlistCount, searchKey })

   
    
    

})


router.post("/change-password",(req,res)=>{

    
    userHelpers.changePasswordOfUser(req.body.password,req.session.activeUser._id).then(()=>{
        res.redirect('/user-profile')
    })
   
    

})




// user add address form check out 


router.get('/add-user-address-checkout', async (req, res) => { // add new address form


   
    if (!req.session.userLoggedIn) {
        res.redirect('/user-login')
        return;

    }

    let userLoggedIn = req.session.userLoggedIn;
    let cartCount = null;
    let wishlistCount= null;
    if (req.session.activeUser) {

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);
        wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 

    }

    if (!userLoggedIn) {  // clears the cart number bug (showing cart number after log out)
        cartCount = null;
    }


    let userDetails = await userHelpers.getUserDetailsWithUserId(req.session.activeUser._id);
    



    let searchKey = false;


    res.render('users/user-add-address-checkout', { userLoggedIn, cartCount, userDetails, wishlistCount, searchKey })

})


router.post('/user-add-address-checkout',(req,res)=>{

    

    let Id = req.session.activeUser._id;

    

    userHelpers.addAddressToUserId(req.body,Id).then(()=>{

        res.redirect("/checkout")
    })

   
})



router.get('/supercoins',async (req,res)=>{
    

    if (!req.session.userLoggedIn) {
        res.redirect('/user-login')
        return;

    }

    let userLoggedIn = req.session.userLoggedIn;
    let cartCount = null;
    let wishlistCount= null;
    if (req.session.activeUser) {

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);
        wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 

    }

    if (!userLoggedIn) {  // clears the cart number bug (showing cart number after log out)
        cartCount = null;
    }


    let userDetails = await userHelpers.getUserDetailsWithUserId(req.session.activeUser._id);
    



    let searchKey = false;


    res.render('users/user-supercoins-page', { userLoggedIn, cartCount, userDetails, wishlistCount, searchKey })


})

module.exports = router;
