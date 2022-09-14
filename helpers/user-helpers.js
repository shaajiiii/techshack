const db = require('../config/connection')
const bcrypt = require('bcrypt');
const { getProductDetails } = require('./product-helpers');
const ObjectId = require('mongodb').ObjectId

const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: process.env.razor_key_id,
    key_secret: process.env.razor_key_secret,
  });





module.exports = {
    // function to add to "users"
    addUser: async (user, callback) => {
        user.status = true; //variable for blocking
        user.password = await bcrypt.hash(user.password, 10)
       
        db.get().collection('users').insertOne(user).then((data) => {
            callback(true)
        })
    },


    ///================================== new final week updation here


    verifyLoginWithUsernameAndPass: (username,password) => {// mobile only login
       
        return new Promise(async (resolve, reject) => {// change it

            let loginError = false
            let response = {}
            let user = await db.get().collection('users').findOne({ username: username})
            if (user) {

                if (!user.status) { //modification for blocked users
                    loginError = "userBlocked"
                    reject(loginError)

                }// modification

                else {

                    
                        let passwordHash = user.password;
                        const verified = bcrypt.compareSync(password, passwordHash);
                        if(verified){
                            resolve(user)
                        }else{
                            loginError="wrongPassWord";
                            reject(loginError)
                        }

                 
                    
                }

            } else { // user found aayilla. login failed error ok aan
                
                loginError = "notFound"
                reject(loginError)

            }


        })
    },

    
    changePasswordOfUser: (password,userId)=>{

        return new Promise( async (resolve, reject) => {

            //console.log(password)
             let hashPassword = await bcrypt.hash(password, 10)
            //  console.log(hashPassword)
            //  console.log(userId)

            db.get().collection('users').updateOne({_id:ObjectId(userId) }, {
                $set: {
                    password:hashPassword
                }
            }).then((response) => {
                
                resolve();
            })
        })

    },







    //=============================================================







    // function to check in users and cross check values
    findAndCrossCheck: (formData) => {
        return new Promise(async (resolve, reject) => {// change it/////////// this method is not used now. U took it away

            let loginError = false
            let response = {}
            let user = await db.get().collection('users').findOne({ username: formData.username })
            if (user) {

                if (!user.status) { //modification for blocked users
                    loginError = true
                    resolve(loginError)

                }// modification

                else if (formData.password == user.password && formData.mobile == user.mobile) {

                    resolve(loginError)
                } else {
                    //console.log('login failed');
                    loginError = true
                    resolve(loginError)


                }
            } else {
                // console.log('login failed');
                loginError = true
                resolve(loginError)

            }


        })
    },
    mobileLogin: (formData) => {// mobile only login
        return new Promise(async (resolve, reject) => {// change it

            let loginError = false
            let response = {}
            let user = await db.get().collection('users').findOne({ mobile: formData.mobile })
            if (user) {

                if (!user.status) { //modification for blocked users
                    loginError = "userBlocked"
                    resolve(loginError)

                }// modification

                else {

                    resolve(loginError)
                }

            } else {
                // console.log('login failed');
                loginError = "notFound"
                resolve(loginError)

            }


        })
    },


    getAllUsers: () => {

        return new Promise(async (resolve, reject) => {

            let allUsers = await db.get().collection('users').find().toArray();

            resolve(allUsers)
        })
    },

    blockUser: (username) => {

        return new Promise((resolve, reject) => {
            db.get().collection('users').updateOne({ username: username }, {
                $set: {
                    status: false
                }
            }).then((response) => {
                resolve();
            })
        })

    },
    unblockUser: (username) => {

        return new Promise((resolve, reject) => {
            db.get().collection('users').updateOne({ username: username }, {
                $set: {
                    status: true
                }
            }).then((response) => {
                resolve();
            })
        })

    },
    checkUserEmailExists: (formData) => {
        return new Promise(async (resolve, reject) => {
            let exists = await db.get().collection('users').findOne({ email: formData.email });
            let value = false;


            if (exists) {
                value = true;
                resolve({ value })
            } else {
                value = false;
                resolve({ value })
            }



        })
    },
    getSingleUser: (mobile) => { // retrive single user to store im session

        return new Promise(async (resolve, reject) => {// change it


            let user = await db.get().collection('users').findOne({ mobile: mobile })
            resolve(user);


        })

    },

    addToCart: (proId, userId) => {

        let productObject = {
            item: ObjectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {// change it

            let userCart = await db.get().collection('cart').findOne({ user: ObjectId(userId) })
            if (userCart) {// increase quantity or add a new product

                let proExists = userCart.products.findIndex(proObj => proObj.item == proId)

                if (proExists != -1) {// implies got an index. the product is there..
                    db.get().collection('cart').updateOne({ user: ObjectId(userId), 'products.item': ObjectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve();
                    })


                } else {


                    db.get().collection('cart').updateOne({ user: ObjectId(userId) },
                        {
                            $push: { products: productObject }
                        }
                    ).then(() => {
                        resolve();
                    })


                }




            } else {//create a cart
                let cartObj = {
                    user: ObjectId(userId),
                    products: [productObject]
                }
                db.get().collection('cart').insertOne(cartObj).then(() => {
                    resolve();
                })
            }
        })
    },

    getCartProducts: (userId) => { /// waaaawwwwww
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection('cart').aggregate([

                {
                    $match: { user: ObjectId(userId) }
                },

                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }




            ]).toArray()

            resolve(cartItems)

        })
    },

    removeCartItem: (proId, userId) => {
        return new Promise(async (resolve, reject) => {

            await db.get().collection('cart').updateOne({ user: ObjectId(userId) }, {
                $pull: { products: { item: ObjectId(proId) } }
            })
            resolve();
        })
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection('cart').findOne({ user: ObjectId(userId) })
            if (cart) {

                count = cart.products.length;

            }

            resolve(count);
        })
    },
    changeProductQuantity: (dataObj) => {

        let proId = dataObj.proId;
        let cartId = dataObj.cartId;
        let count = parseInt(dataObj.count)

        return new Promise((resolve, reject) => {

            db.get().collection('cart').updateOne({ _id: ObjectId(cartId), 'products.item': ObjectId(proId) },
                {
                    $inc: { 'products.$.quantity': count }
                }
            ).then(() => {
                resolve(); // status true koodthilla
            })


        })


    },
    getTotalAmountCart: (userId) => {


        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection('cart').aggregate([

                {
                    $match: { user: ObjectId(userId) }
                },

                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }
                }



            ]).toArray()

            resolve(total)



        })





    },

    getProductListInCart: (userId) => {

        return new Promise(async (resolve, reject) => {

            let cart = await db.get().collection('cart').findOne({ user: ObjectId(userId) });


            resolve(cart.products) //its an array of products

        })


    },



    placeOrder: (body, productsList, orderAmt) => {
        return new Promise((resolve, reject) => {  
            let status = body['payment-method']=='COD'|| body['payment-method'] =='PAYPAL'?"placed":"pending";
            let orderObject = {
                userId: ObjectId(body.userId),
                deliveryDetails: {

                    username: body.username,
                    mobile: body.mobile,
                    pincode: body.pincode,
                    address: body.address

                },

                paymentMethod:body['payment-method'], 
                productsDetails: productsList,
                totalAmt: orderAmt,
                status: status, 
                date: new Date(),

            }
            db.get().collection('orders').insertOne(orderObject).then((resp) => {
                db.get().collection('cart').deleteOne({ user: ObjectId(body.userId) })
                resolve(resp.insertedId);// need the new order's id for some things
            })


        })


    },

    getOrderProducts: (userId) => { /// waaaawwwwww
        return new Promise(async (resolve, reject) => {
            let orderListProducts = await db.get().collection('orders').aggregate([

                {
                    $match: { userId: ObjectId(userId) }
                },

                {
                    $unwind: '$productsDetails'
                },
                {
                    $project: {
                        item: '$productsDetails.item',
                        quantity: '$productsDetails.quantity',
                        totalAmt:'$totalAmt',
                        status:'$status',
                        date:'$date'



                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }




            ]).toArray()
           

            resolve(orderListProducts)

        })
    },

    getOrderDetails:(userId)=>{  // this will fetch order details and diplay it on primary table



        return new Promise(async (resolve, reject) => {
            let ordersList = await db.get().collection('orders').aggregate([

                {
                    $match: { userId: ObjectId(userId) }
                }

            

            ]).toArray();

           
           ordersList = ordersList.reverse()
           

            resolve(ordersList)

        })

    },
    cancelOrder:(orderId)=>{

        return new Promise((resolve, reject) => {
            db.get().collection('orders').updateOne({_id:ObjectId(orderId) }, {
                $set: {
                    status:"cancelled"
                }
            }).then((response) => {
               
                resolve();
            })
        })

    },

    changeStatusToShipped:(orderId)=>{

        return new Promise((resolve, reject) => {
            db.get().collection('orders').updateOne({_id:ObjectId(orderId) }, {
                $set: {
                    status:"shipped"
                }
            }).then((response) => {
                
                resolve();
            })
        })

    },
    changeStatusToDelivered:(orderId)=>{

        return new Promise((resolve, reject) => {
            db.get().collection('orders').updateOne({_id:ObjectId(orderId) }, {
                $set: {
                    status:"delivered"
                }
            }).then((response) => {
                
                resolve();
            })
        })

    },
    deleteOrder:(orderId)=>{

        return new Promise((resolve, reject) => {
            db.get().collection('orders').deleteOne({_id:ObjectId(orderId) }).then(() => {
                
                resolve();
            })
        })


    },


    getSingleOrderDetails:(orderId)=>{

        return new Promise((resolve, reject) => {
         db.get().collection('orders').findOne({_id:ObjectId(orderId) }).then((resp)=>{

           
            resp.date = resp.date.toDateString()
            
            resolve(resp);

         })

                
                
                
           
        })

    },

    getProductsDetailsOfOrder: (orderId) => { /// nokkk
        return new Promise(async (resolve, reject) => {
            let orderListProducts = await db.get().collection('orders').aggregate([

                {
                    $match: { _id:ObjectId(orderId) }
                },

                {
                    $unwind: '$productsDetails'
                },
                {
                    $project: {
                        item: '$productsDetails.item',
                        quantity: '$productsDetails.quantity'
                        // totalAmt:'$totalAmt',
                        // status:'$status',
                        // date:'$date'



                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }




            ]).toArray()
          
            resolve(orderListProducts)

        })
    },

    setDeliveryDate:(orderId,deliverydate)=>{
        return new Promise((resolve, reject) => {
            db.get().collection('orders').updateOne({_id:ObjectId(orderId) }, {
                $set: {
                    deliverydate:deliverydate
                }
            }).then((response) => {
                
                resolve();
            })
        })




    },
    getUserDetailsWithUserId:(userId)=>{

        return new Promise(async (resolve, reject) => {// change it


            let user = await db.get().collection('users').findOne({ _id:ObjectId(userId) })
            resolve(user);


        })



    },


    editUserDetails:(newUserDetails,userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('users').updateOne({_id:ObjectId(userId)},{
               $set:{
                   username:newUserDetails.username,
                   email:newUserDetails.email,
                   mobile:newUserDetails.mobile,
                   image:true
                
               } 
            }).then((response)=>{
                resolve();
            })
        })
    },


    // Wish list functions

    addToWishList: (proId, userId) => { // adds only non existing products to the wishlist

        let productObject = {
            item: ObjectId(proId),
       
            
        }
        return new Promise(async (resolve, reject) => {// change it

            let wishlist = await db.get().collection('wishlist').findOne({ user: ObjectId(userId) }) // true if there is a wishlist for user
            if (wishlist) {// resolve if exists(do nothing) or else add a new product to the list
                
                let proExists = wishlist.products.findIndex(proObj => proObj.item == proId)

                if (proExists != -1) {// implies got an index. the product is there..
                   resolve();


                } else {


                    db.get().collection('wishlist').updateOne({ user: ObjectId(userId) },
                        {
                            $push: { products: productObject }
                        }
                    ).then(() => {
                        resolve();
                    })


                }




            } else {//creating a wishlist
                let wishlistDoc = {
                    user: ObjectId(userId),
                    products: [productObject]
                }
                db.get().collection('wishlist').insertOne(wishlistDoc).then(() => {
                    resolve();
                })
            }
        })
    },

    removeFromWishlist: (proId, userId) => {
        return new Promise(async (resolve, reject) => {

            await db.get().collection('wishlist').updateOne({ user: ObjectId(userId) }, {
                $pull: { products: { item: ObjectId(proId) } }
            })
            resolve();
        })
    },
    getWishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let wishlist = await db.get().collection('wishlist').findOne({ user: ObjectId(userId) })
            if (wishlist) {

                count = wishlist.products.length;

            }

            resolve(count);
        })
    },

    // getWishlistProductsIdArray: (userId) => {   failed
    //     return new Promise(async (resolve, reject) => {
    //         let  productsArr= [];
    //         let wishlist = await db.get().collection('wishlist').findOne({ user: ObjectId(userId) })
    //         if (wishlist) {

    //             productsArr = wishlist.products;

    //         }
    //         let Ids=[];
    //        productsArr.forEach(element => {
    //         element.item.slice(13,37)

            
            
    //        });


    //         resolve(productsArr);
    //     })
    // },

    
    getWishlistProducts: (userId) => { /// waaaawwwwww
        return new Promise(async (resolve, reject) => {
            let wishlistItems = await db.get().collection('wishlist').aggregate([

                {
                    $match: { user: ObjectId(userId) }
                },

                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                     
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }




            ]).toArray()

            resolve(wishlistItems)

        })
    },
   // ============ payment functions =========================//

    // razor pay functions
    generateRazorpay: (orderId,amount) => {
        return new Promise(async (resolve, reject) => {
            var options = {
                amount: amount*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+orderId
              };

              instance.orders.create(options, function(err, order) {
                if(err){
                    console.log("err_ y point _",err)
                }
                console.log("razorinte order",order);
                resolve(order);
              });
           
        })
    },

    verifyPaymentRazor:(details)=>{
        return new Promise(async (resolve, reject) => {

            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256','tktc0uIIEa5IALJeVAZcXgDb')

            hmac.update(details['payment[razorpay_order_id]']+ '|' +details['payment[razorpay_payment_id]'])
            let genKey = hmac.digest('hex')
            if(genKey == details['payment[razorpay_signature]'] ){
                resolve()
            }else{
                reject()
            }

        })




    },

    changeStatusToPlaced:(orderId)=>{

        return new Promise((resolve, reject) => {
            db.get().collection('orders').updateOne({_id:ObjectId(orderId) }, {
                $set: {
                    status:"placed"
                }
            }).then(() => {
                
                resolve();
            })
        })

    },




    // ------------------------------------------ user profile address functions --------------------//
    



   

    addAddressToUserId :(body,userId)=>{

        return new Promise(async (resolve, reject) => {

            let userDoc = await db.get().collection('users').findOne({_id:ObjectId(userId) })
            let AddressArr = [];
            AddressArr.push(body)
            
           
            
            if(!userDoc.addresses){ //address field illa

               
                db.get().collection('users').updateOne({_id:ObjectId(userId) }, {
                    $set: {
                        addresses:AddressArr
                    }
                }).then(() => {
                    
                    resolve();
                })
                
            


            }else{  // address files array olla case
                
                db.get().collection('users').updateOne({_id:ObjectId(userId) }, {
                    $push: {
                        addresses:body
                    }
                }).then(() => {
                    
                    resolve();
                })
            }

        


        })

    },





    deleteAddressToUserId :(address,userId)=>{

        return new Promise(async (resolve, reject) => {

          
               
                db.get().collection('users').updateOne({_id:ObjectId(userId) }, {
                    $pull: {
                        addresses:{ address: address}
                    }
                }).then(() => {
                    console.log("pull aayy")
                    resolve();
                })
                
        

        


        })

    },


    getSingleUserWithId: (userId) => { // retrive single user to store im session

        return new Promise(async (resolve, reject) => {// change it


            let user = await db.get().collection('users').findOne({_id:ObjectId(userId) })
            resolve(user);


        })

    },




    // referal methods ==================================

    refNameExists: (refName) => {

        return new Promise(async (resolve, reject) => {
            let status = true

            let user = await db.get().collection('users').find({username:refName}).toArray();

           

            if(user.length != 0){
                resolve({status})
            }else{
                status=false
                resolve({status})
            }
            
            
        })
    },

    addUserWithCoins: (user) => {
       

        return new Promise(async (resolve, reject) => {
            
            user.status = true; //variable for blocking
            user.password = await bcrypt.hash(user.password, 10)
            user.supercoins = 10

          
           
            db.get().collection('users').insertOne(user).then((data) => {
                resolve()
            })
            
            
        })
    },

    creditCoins: (refName) => {
       

        return new Promise(async (resolve, reject) => {
            


            let refuser= await db.get().collection('users').findOne({username:refName})
           

            if(refuser.supercoins){
                
                db.get().collection('users').updateOne({username:refName},{$inc:{supercoins:10}})
                resolve()

            }else{
                // coins illaatha case
                db.get().collection('users').updateOne({username:refName},{$set:{supercoins:10}})
                resolve()
            }
           
           
            
            
        })
    },

    fetchSuperCoinsAndUpdate: (userId) => {
       

        return new Promise(async (resolve, reject) => {
            

            let coins = null
            let userObj= await db.get().collection('users').findOne({_id:ObjectId(userId)})
            
           

            if(userObj){
                coins = userObj.supercoins
                
                db.get().collection('users').updateOne({_id:ObjectId(userId)},{$inc:{supercoins:-coins}})
               //uncomment this at last
               resolve(coins)
            }else{
                reject()
            }
           
           
            
            
        })
    },
    







    










}