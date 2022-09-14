const express = require('express');
const session = require('express-session');

const router = express.Router();

const productHelpers = require ('../helpers/product-helpers')

const userHelpers = require('../helpers/user-helpers')

const adminHelpers = require('../helpers/admin-helpers')

router.get('/',async (req,res)=>{

    let userLoggedIn = req.session.userLoggedIn;// this will be set to true at login inside session
    let cartCount=null; // turn this into a middleware
    let wishlistCount=null;
    let wishlistProducts= null;

    // cartCount
    if(req.session.activeUser){

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);

    }
    
    if(!userLoggedIn){  // clears the cart number bug (showing cart number after log out)
        cartCount = null;
    }

    // wishlist count
    if(req.session.activeUser){

        wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id);

    }
    
    if(!userLoggedIn){  // clears the cart number bug (showing cart number after log out)
        wishlistCount = null;
    }
    let ArrOfIDs=[];

    if(req.session.activeUser){

        wishlistProducts = await userHelpers.getWishlistProducts(req.session.activeUser._id)
            // tests

        // console.log(wishlistProducts)
        // console.log("=======")
        
        // wishlistProducts.forEach(element => {
        //     let temp = element.product[0]._id;
            
        //     ArrOfIDs.push(temp);

            
        // });
    //     let temp =wishlistProducts[0].product[0]._id
    //     let arrTemp = JSON.stringify(temp)
    // // console.log(wishlistProducts[0].product[0]._id.slice(6))
    // console.log(typeof(arrTemp))

    // console.log("here hrrer\n"+ArrOfIDs)

    //  console.log("===++++++++++++=======")
    //  if(wishlistProducts){
    //     console.log(wishlistProducts[0].product[0].wlstatus)

    //  }
     

    



    }



    // do furthe mods in this================================
    // banner tests

    let banners = await adminHelpers.getAllBanners();



   

    


    //=========================


    let searchKey = false;



    productHelpers.getAllProducts().then((products)=>{

        res.render('index',{userLoggedIn,products,cartCount,wishlistCount,wishlistProducts,ArrOfIDs,banners,searchKey})

    })

    

})

router.get('/cart',async (req,res)=>{
    
    let userLoggedIn = req.session.userLoggedIn;// this will be set to true at login inside session 


    if(!userLoggedIn){
        res.redirect('/user-login')
        return;
    }



    let cartCount=null; // turn this into a middleware
    if(req.session.activeUser){

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);

    }

    let products = await userHelpers.getCartProducts(req.session.activeUser._id)


    /// gettong total cart amount
    let totalAmountCart = await userHelpers.getTotalAmountCart(req.session.activeUser._id)

    let wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 

   


    let activeUserId= req.session.activeUser._id; // check if its working. aavishyam vannillaa total update cheyyaaan
    
    let searchKey = false;
  
    res.render('users/user-cart',{userLoggedIn,products,cartCount,totalAmountCart,activeUserId,wishlistCount,searchKey})
    
    

})


router.get('/add-to-cart/:proId',async (req,res)=>{  // the ajax request route to add ot cart
   
   
    let userDetails= req.session.activeUser; ///oke.. ivde user object ind
    

    await userHelpers.addToCart(req.params.proId, req.session.activeUser._id);

    let cartCount = await userHelpers.getCartCount(req.session.activeUser._id);



    
    
    res.json({status:true,cartCount})

    

})



router.get('/remove-cart-item/:proId',async (req,res)=>{
   
    await userHelpers.removeCartItem(req.params.proId, req.session.activeUser._id);

   
    let cartCount = await userHelpers.getCartCount(req.session.activeUser._id);

    res.json({status:true,cartCount})
     

})


router.post('/change-product-quantity', (req,res)=>{
    userHelpers.changeProductQuantity(req.body);
    res.json({status:true})
})




// cart end




// check out and place order --------------<


router.get('/checkout',async (req,res)=>{ // the delivery details and summary form page


    //---------- mods for address


    let userDoc = await userHelpers.getSingleUserWithId(req.session.activeUser._id)
   

    //================


//    these code below were working fine

    let userLoggedIn = req.session.userLoggedIn;
    let cartCount = await userHelpers.getCartCount(req.session.activeUser._id);
    let wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 
    let totalAmountCart = await userHelpers.getTotalAmountCart(req.session.activeUser._id)
    totalAmountCart = totalAmountCart[0].total ;// made a change
    let activeUser= req.session.activeUser;


    let products = await userHelpers.getCartProducts(req.session.activeUser._id)
    
    let searchKey = false;

    let offer= false


    let supercoinOffer = false
    // == coupon code

    if( req.session.couponPercent ){
        let off = parseInt(req.session.couponPercent) 
        let offAmt = (totalAmountCart*off)/100;
        // mods
        offAmt = Math.round(offAmt)

        totalAmountCart = totalAmountCart - offAmt
        offer = {
            amt:offAmt,
            off:off
        }
        console.log(offAmt,off)

    }

    // == coupon code end


   // == supercoin code

    if( req.session.supercoins ){
        let coins = req.session.supercoins 
    
        totalAmountCart = totalAmountCart - coins
        supercoinOffer = {
            coins:coins,
            
        }
        

    }


    
    res.render("users/user-checkout",{userLoggedIn,cartCount,totalAmountCart,activeUser,products,wishlistCount,userDoc,searchKey,offer,supercoinOffer});
})



// buy now route which directly renders checkout


router.get('/buy-now/:proId',async (req,res)=>{ // takes the proId in params and creates a hidden cart

  
    
    await userHelpers.addToCart(req.params.proId, req.session.activeUser._id);


    res.json({status:true})

    // let cartCount = await userHelpers.getCartCount(req.session.activeUser._id);



    // let userLoggedIn = req.session.userLoggedIn;
    // // let cartCount = await userHelpers.getCartCount(req.session.activeUser._id);
    // let wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 
    // let totalAmountCart = await userHelpers.getTotalAmountCart(req.session.activeUser._id)
    // let activeUser= req.session.activeUser;

    // let products = await userHelpers.getCartProducts(req.session.activeUser._id)
    
  
    
    // res.render("users/user-checkout",{userLoggedIn,cartCount,totalAmountCart,activeUser,products,wishlistCount});
})







///

router.post('/place-order', async (req,res)=>{ // post of place order, res is redirect to order history
    
    req.body.userId= req.session.activeUser._id;
    req.body.username= req.session.activeUser.username;


    if(req.body.addressObj){ // execute only if there is no address in body
        
        var addressDAta = await JSON.parse(req.body.addressObj);

        req.body.address = addressDAta.address;
        req.body.pincode = addressDAta.pincode;
        req.body.mobile = addressDAta.mobile;

    }

    let productsList = await userHelpers.getProductListInCart(req.session.activeUser._id)// array of products its quantity
    let totalAmountCart = await userHelpers.getTotalAmountCart(req.session.activeUser._id)
    let totalOrderAmount =  totalAmountCart[0].total;

    

    // ============ coupon mods
    console.log("|C|: ", totalOrderAmount)


    if( req.session.couponPercent ){
       
        let off = parseInt(req.session.couponPercent) 
        let offAmt = (totalOrderAmount*off)/100;
        offAmt = Math.round(offAmt)
        totalOrderAmount = totalOrderAmount - offAmt
       
        

        console.log("|amount after the coupon |: ",totalOrderAmount)

        req.session.couponPercent = false; // might want to delete this line if there is a bug
    
    }


    if( req.session.supercoins ){
        let coins = req.session.supercoins 
    
        totalOrderAmount = totalOrderAmount - coins
        req.session.supercoins = false;

    }
    
    // =======\
    

    userHelpers.placeOrder(req.body,productsList,totalOrderAmount).then((orderId)=>{
        
        if( req.body['payment-method']=='COD'){
            res.json({paymentMethod:"COD"})
            return;

        }


        else if(req.body['payment-method']=='PAYPAL' ){
            res.json({paymentMethod:"DIRECT"})
            return;

        } else {
           
            
           
            // razor pay function here....
            userHelpers.generateRazorpay(orderId,totalOrderAmount).then((razorOrderObj)=>{
                res.json(razorOrderObj)

            })
            

        }

        
    });
  
    

// =======

  

    
})


router.post('/verifyRazorpay',(req,res)=>{


    userHelpers.verifyPaymentRazor(req.body).then(()=>{
        userHelpers.changeStatusToPlaced(req.body['order[receipt]']).then(()=>{

            res.json({status:true})

        })
    })

})


// check out and order end ------------>






// single product view page 

router.get('/single-product-view/:proId', async(req,res)=>{


    let userLoggedIn = req.session.userLoggedIn;
    let cartCount=null; 
    let wishlistCount=null
    let userId = null
    if(req.session.activeUser){

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);
        wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 
        userId = req.session.activeUser._id;

    }
    
    if(!userLoggedIn){  // clears the cart number bug (showing cart number after log out)
        cartCount = null;
    }
    let proId=req.params.proId;




    if(proId.length != 24) {
        res.render('500')
        return

    }
   

    let productDetails= await productHelpers.getProductDetails(proId)


    if(!productDetails){
        res.render('500')
        return
    }

    
    
    let searchKey = false
  
    
    res.render('users/user-single-product',{userLoggedIn,cartCount,productDetails,wishlistCount,userId,searchKey})




})



// wishlist 


router.get('/wishlist',async (req,res)=>{
    
    let userLoggedIn = req.session.userLoggedIn;// this will be set to true at login inside session 


    if(!userLoggedIn){
        res.redirect('/user-login')
        return;
    }



    let cartCount=null; // turn this into a middleware
    if(req.session.activeUser){

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);

    }

    let wishlistProducts = await userHelpers.getWishlistProducts(req.session.activeUser._id)



   

    let wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 

   


    let activeUserId= req.session.activeUser._id; // check if its working. aavishyam vannillaa total update cheyyaaan

    let searchKey = false;

  
    res.render('users/user-wishlist',{userLoggedIn,cartCount,activeUserId,wishlistCount,wishlistProducts,searchKey})
    
    

})






router.get('/add-to-wishlist/:proId',async (req,res)=>{  // the ajax request route to add ot cart
   
   
   
    

    await userHelpers.addToWishList(req.params.proId, req.session.activeUser._id); 

    let wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 



    
    
    res.json({status:true,wishlistCount})
    
    

})


router.get('/remove-from-wishlist/:proId',async (req,res)=>{
   
    await userHelpers.removeFromWishlist(req.params.proId, req.session.activeUser._id); // replace the function

   
    let wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id); 

    res.json({status:true,wishlistCount})
     

})



// wishlistt end



// searchh ==========================================================================


router.post('/search',async (req,res)=>{

    let userLoggedIn = req.session.userLoggedIn;// this will be set to true at login inside session
    let cartCount=null; // turn this into a middleware
    let wishlistCount=null;
    let wishlistProducts= null;
    

    // cartCount
    if(req.session.activeUser){

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);

    }
    
    if(!userLoggedIn){  // clears the cart number bug (showing cart number after log out)
        cartCount = null;
    }

    // wishlist count
    if(req.session.activeUser){

        wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id);

    }
    
    if(!userLoggedIn){  // clears the wishlit number bug (showing cart number after log out)
        wishlistCount = null;
    }
    let ArrOfIDs=[];

    if(req.session.activeUser){

        wishlistProducts = await userHelpers.getWishlistProducts(req.session.activeUser._id)
            

    }



    let banners = false

    let searchKey= req.body.key;



    productHelpers.doSearchInProducts(req.body.key).then((products)=>{

        res.render('index',{userLoggedIn,products,cartCount,wishlistCount,wishlistProducts,ArrOfIDs,banners,searchKey})

    })

    

})



//============ the search and filter route ==========//

router.get('/search/:searchKey/:filterArg',async (req,res)=>{

    let userLoggedIn = req.session.userLoggedIn;// this will be set to true at login inside session
    let cartCount=null; // turn this into a middleware
    let wishlistCount=null;
    let wishlistProducts= null;
    

    // cartCount
    if(req.session.activeUser){

        cartCount = await userHelpers.getCartCount(req.session.activeUser._id);

    }
    
    if(!userLoggedIn){  // clears the cart number bug (showing cart number after log out)
        cartCount = null;
    }

    // wishlist count
    if(req.session.activeUser){

        wishlistCount = await userHelpers.getWishlistCount(req.session.activeUser._id);

    }
    
    if(!userLoggedIn){  // clears the wishlit number bug (showing cart number after log out)
        wishlistCount = null;
    }
    let ArrOfIDs=[];

    if(req.session.activeUser){

        wishlistProducts = await userHelpers.getWishlistProducts(req.session.activeUser._id)
            

    }



    let banners = false

    let searchKey= req.params.searchKey;
    
   



    productHelpers.doSearchInProductsAndFilter(searchKey,req.params.filterArg).then((products)=>{



        res.render('index',{userLoggedIn,products,cartCount,wishlistCount,wishlistProducts,ArrOfIDs,banners,searchKey})

    })

    

})




router.post('/apply-coupon', async(req,res)=>{

    console.log(req.body.code)

    let couponObj = null;
    
    await adminHelpers.fetchCoupon(req.body.code).then((coupon)=>{
    
        couponObj = coupon;

    }).catch(()=>{
        console.log("catch work aayy")
        res.json({status:false, msg: "you entered an invalid code.."})
        return
    })


    if(couponObj!=null){
       req.session.couponCode = couponObj.code;
       req.session.couponPercent = couponObj.percent;
       // ee session variables il coupon data ind
      
       
       res.json({status:true})

    }

   
})



router.post('/apply-supercoin', async(req,res)=>{

    // coins idht session il vekkum ivda

    userHelpers.fetchSuperCoinsAndUpdate(req.session.activeUser._id).then((coins)=>{
       
        if(coins>0){
            req.session.supercoins = coins
            console.log("kiitya coins: ")
            console.log(req.session.supercoins)
            res.json({status:true})
            return
        }else{
            res.json({status:false})
            return
        }

    }).catch(()=>{
        res.json({status:false})
        return
    })

   

   
})



module.exports = router;



