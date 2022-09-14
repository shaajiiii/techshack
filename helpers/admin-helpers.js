const db = require('../config/connection')
const ObjectId = require('mongodb').ObjectId


module.exports = {

    //banner functions

    addNewBanner: (bannerName)=>{

        return new Promise ((resolve,reject)=>{

            db.get().collection('banners').insertOne(bannerName).then((resp)=>{
                
                resolve(resp.insertedId);  
            })
           


        })
    },
    getAllBanners: ()=>{

        return new Promise (async(resolve,reject)=>{

            let banners = await db.get().collection('banners').find().toArray();

            resolve(banners)
                
               
                 
           
           


        })
    },

    deleteBanner:(bannerId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection('banners').deleteOne({_id:ObjectId(bannerId)}).then((response=>{
                resolve(response);
            }))

        })

    },


    // banner functions end


    // offer functions


    applyOfferOnProduct:(proDetails,offerPercent)=>{

        return new Promise((resolve,reject)=>{

            let amount = proDetails.mrp;
            let offValue = Math.round(amount * (offerPercent/100) ) ;// this is the percentage amount

            let newPrice = amount - offValue ; // the new price in effect




            db.get().collection('products').updateOne({_id:ObjectId(proDetails._id)},{
               $set:{
                  
                   price: newPrice,
                   offer:true,
                   offerPercent: offerPercent,
                   offValue:offValue

                   
               } 
            }).then((response)=>{
                resolve();
            })
        })
        //console.log("aplly offer function")
       
    },


    deleteOffer:(proDetails)=>{ /// set aakk,, change it completely

        return new Promise((resolve,reject)=>{


            
            db.get().collection('products').updateOne({_id:ObjectId(proDetails._id)},{
               $set:{
                  
                   price: proDetails.mrp,
                   offer:false
                   
                   
               },
               $unset:{
                   offerPercent: "",
                   offValue:""
               }
            }).then((response)=>{
                resolve();
            })
        })
        
       
    },


    //----------------------- category functions -------------------//

    getAllCategory:()=>{
        return new Promise (async(resolve,reject)=>{

            let categories = await db.get().collection('category').find().toArray();

            resolve(categories)
                           


        })

    },


    
    addNewCategory: (categoryName)=>{

        return new Promise ((resolve,reject)=>{
            

            db.get().collection('category').insertOne({name:categoryName}).then((resp)=>{
                
                
            })
           


        })
    },


    deleteCategory: (categoryName)=>{

        return new Promise ((resolve,reject)=>{
            

            db.get().collection('category').deleteOne({name:categoryName}).then((resp)=>{
                
                resolve()
                
            })
           


        })
    },

    getTotalUserCount: ()=>{


        return new Promise (async(resolve,reject)=>{

            let userCount = await db.get().collection('users').countDocuments({})

            resolve(userCount)
                           


        })

        
        

    },

    getPendingOrderCount: ()=>{


        return new Promise (async(resolve,reject)=>{

            let pendingOrderCount = await db.get().collection('orders').countDocuments({deliverydate:{$exists:false}})

            resolve(pendingOrderCount)
                           


        })

        
        

    },


    getDeliveredOrderCount: ()=>{


        return new Promise (async(resolve,reject)=>{

            let deliveredOrderCount = await db.get().collection('orders').countDocuments({status:"delivered"})

            resolve(deliveredOrderCount)
                           


        })

        
        

    },


    
    getCancelledOrderCount: ()=>{


        return new Promise (async(resolve,reject)=>{

            let cancelledOrderCount = await db.get().collection('orders').countDocuments({status:"cancelled"})

            resolve(cancelledOrderCount)
                           


        })

    

    },


    getTotalProductsCount: ()=>{


        return new Promise (async(resolve,reject)=>{

            let productsCount = await db.get().collection('products').countDocuments({})

            resolve(productsCount)
                           


        })

        
        

    },


    getTotalSales: ()=>{ // status delivered aayathinte amount maathram sales lek idukolu


        return new Promise (async(resolve,reject)=>{

            let sales = await db.get().collection('orders').aggregate([
                {
                    $match:{status:"delivered"}
                },
                {

                    $group:{_id: "1", amount:{ $sum: "$totalAmt" }}
                }
            ]).toArray()

           resolve(sales[0].amount)                 


        })

        
        

    },


    getCodAmt: ()=>{


        return new Promise (async(resolve,reject)=>{

            let sales = await db.get().collection('orders').aggregate([
                {
                    $match:{
                        $and:[
                            {paymentMethod:"COD"},
                            {status:{$ne:"cancelled"}}
                        ]
                    }       
                    
                },
                {

                    $group:{_id: "1", amount:{ $sum: "$totalAmt" }}
                }
            ]).toArray()

           resolve(sales[0].amount)                 


        })

        
        

    },


    getPaypalAmt: ()=>{


        return new Promise (async(resolve,reject)=>{

            let sales = await db.get().collection('orders').aggregate([
                {
                    $match:{
                        $and:[
                            {paymentMethod:"PAYPAL"},
                            {status:{$ne:"cancelled"}}
                        ]
                    }       
                    
                },
                {

                    $group:{_id: "1", amount:{ $sum: "$totalAmt" }}
                }
            ]).toArray()

           resolve(sales[0].amount)                 


        })

        
        

    },


    getRazorPayAmt: ()=>{


        return new Promise (async(resolve,reject)=>{

            let sales = await db.get().collection('orders').aggregate([
                {
                    $match:{
                        $and:[
                            {paymentMethod:"RAZORPAY"},
                            {status:{$ne:"cancelled"}}
                        ]
                    }       
                    
                },
                {

                    $group:{_id: "1", amount:{ $sum: "$totalAmt" }}
                }
            ]).toArray()

           resolve(sales[0].amount)                 


        })

        
        

    },



    getday1sales: (startPoint)=>{ // status delivered aayathinte amount maathram sales lek idukolu

        
        return new Promise (async(resolve,reject)=>{
            let begindate = new Date(startPoint)
            let value = 0;
            let docs = await db.get().collection('orders').find({$and:[{date:{$gte:begindate}},{status:"delivered"}]}).toArray()
            if (docs.length === 0){    
                resolve(value)
            }else{   
                let sales = await db.get().collection('orders').aggregate([
                            {
                                $match:{
                                    $and:[
                                        {status:"delivered"},
                                        {date:{$gte:begindate}}
                                    ]
                                }                  
                            },
                            {
            
                                $group:{_id: "1", amount:{ $sum: "$totalAmt" }}
                            }
                        ]).toArray()
                        value = sales[0].amount
                        resolve(value)                 
            }


        })

        
        

    },

    getdayNsales: (currentDate,dayInSec,dayNo)=>{ // status delivered aayathinte amount maathram sales lek idukolu

        
        return new Promise (async(resolve,reject)=>{

            let startPoint = currentDate - (dayNo*dayInSec) // starting time
            let endPoint = startPoint + dayInSec // 24 hours forward of staring time
            
            
            let begindate = new Date(startPoint)
            let endDate = new Date(endPoint)
            let value = 0;
            let docs = await db.get().collection('orders').find({$and:[{date:{$gte:begindate,$lt:endDate}},{status:"delivered"}]}).toArray()
            if (docs.length === 0){    
                resolve(value)
            }else{   
                let sales = await db.get().collection('orders').aggregate([
                            {
                                $match:{
                                    $and:[
                                        {status:"delivered"},
                                        {date:{$gte:begindate,$lt:endDate}}
                                    ]
                                }                  
                            },
                            {
            
                                $group:{_id: "1", amount:{ $sum: "$totalAmt" }}
                            }
                        ]).toArray()
                        value = sales[0].amount
                        resolve(value)                 
            }


        })

        
        

    },



    // coupon functions


    addNewCoupon: (code,percent)=>{

        return new Promise ((resolve,reject)=>{
            
            console.log(code,percent)

            let obj = {
                code:code,
                percent:percent
            }

            db.get().collection('coupons').insertOne(obj).then((resp)=>{
                
                resolve()
            })
           


        })
    },


    getAllCoupons:()=>{
        return new Promise (async(resolve,reject)=>{

            let coupons = await db.get().collection('coupons').find().toArray();

            resolve(coupons)
                           


        })

    },


    deleteCoupon: (code)=>{

        return new Promise ((resolve,reject)=>{
            

            db.get().collection('coupons').deleteOne({code:code}).then((resp)=>{
                
                resolve()
                
            })
           


        })
    },

    fetchCoupon:(code)=>{
        return new Promise (async(resolve,reject)=>{

            let coupons = await db.get().collection('coupons').findOne({code:code})

            if(coupons ==null){
                reject()
                return
            }

            resolve(coupons)
                           


        })

    },
    



    




    
}