const db = require('../config/connection');

const ObjectId = require('mongodb').ObjectId


module.exports = {
    addProduct: (productData, callback) => {
        console.log('console inside add product-----\n')
        productData.price = parseInt(productData.price);
        productData.offer = false;
        productData.mrp = productData.price;

        console.log(productData)

        db.get().collection('products').insertOne(productData).then((data) => {

            callback(data.insertedId)
        })

    },
    getAllProducts: () => {

        return new Promise(async (resolve, reject) => {

            let allProducts = await db.get().collection('products').find().toArray()

            resolve(allProducts)
        })
    },

    deleteProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection('products').deleteOne({ _id: ObjectId(productId) }).then((response => {
                resolve(response);
            }))

        })

    },

    getProductDetails: (productId) => {



        return new Promise((resolve, reject) => {

            if(! ObjectId.isValid(productId)){
                resolve(false)

            }

            db.get().collection('products').findOne({ _id: ObjectId(productId) }, (err, result) => {
                if (!result) {
                    resolve(false)

                }
               
                resolve(result)

            })


        })





    },
    updateProduct: (productId, productDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection('products').updateOne({ _id: ObjectId(productId) }, {
                $set: {
                    name: productDetails.name,
                    brand: productDetails.brand,
                    category: productDetails.category,
                    price: productDetails.price,
                    description: productDetails.description,
                }
            }).then((response) => {
                resolve();
            })
        })
    }
    ,
    getAllOrders: () => {


        return new Promise(async (resolve, reject) => {

            let allOrders = await db.get().collection('orders').find().toArray()

            allOrders = allOrders.reverse()
            resolve(allOrders)
        })

    },

    doSearchInProducts: (key) => { 

        return new Promise(async (resolve, reject) => {


            let searchResults = await db.get().collection('products').find({
                $or: [
                    { name: { $regex: key, $options: 'i' } },
                    { category: { $regex: key, $options: 'i' } },
                    { brand: { $regex: key, $options: 'i' } }


                ]
            }).toArray()




            resolve(searchResults)
        })
    },


    doSearchInProductsAndFilter: (key, filterArg) => {

        return new Promise(async (resolve, reject) => {

            let arg;
            if (filterArg == 'ascending') {
                arg = 1;

            } else {
                arg = -1;
            }


            let searchResults = await db.get().collection('products').find({
                $or: [
                    { name: { $regex: key, $options: 'i' } },
                    { category: { $regex: key, $options: 'i' } },
                    { brand: { $regex: key, $options: 'i' } }


                ]
            }).sort({ price: arg }).toArray()




            resolve(searchResults)
        })
    },





}