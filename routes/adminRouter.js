const express = require('express');
const router = express.Router();
const productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')
const adminHelpers = require('../helpers/admin-helpers');

const fs = require('fs');


// delete them if u want to

const puppeteer =require('puppeteer')

// const pdf = require('html-pdf'); // delete this later




router.get('/', async (req, res) => {


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }





    // ivde sakala data yum poi fetch cheythond varendi varum...
    let totalUsers = await adminHelpers.getTotalUserCount();
    let pendingOrderCount = await adminHelpers.getPendingOrderCount();
    let deliveredOrderCount = await adminHelpers.getDeliveredOrderCount();
    let cancelledOrderCount = await adminHelpers.getCancelledOrderCount();
    let productsCount = await adminHelpers.getTotalProductsCount();
    let totalSales = await adminHelpers.getTotalSales();
    let CODAmt = await adminHelpers.getCodAmt() // cancelled allaatha cod orders sum kittum
    let payPalAmt = await adminHelpers.getPaypalAmt()
    let razorPayAmt = await adminHelpers.getRazorPayAmt()

    //console.log(razorPayAmt);  // a tmep line

    let cards = {
        users: totalUsers,
        pendingOrders: pendingOrderCount,
        deliveredOrders: deliveredOrderCount,
        cancelledOrders: cancelledOrderCount,
        products: productsCount,
        sales: totalSales

    }

    //===
    let paymentsData = {
        COD: CODAmt,
        PAYPAL: payPalAmt,
        RAZOR: razorPayAmt
    }

    // date wise data

    const ONE_DAY_IN_SECONDS = 24 * 60 * 60 * 1000;
    let currentDate = new Date();



    // days are back words.. day one is one day before
    // please note, delivered aaya orders maathram sales aayit koottunnollu
    let day1sales = await adminHelpers.getday1sales(currentDate - (1 * ONE_DAY_IN_SECONDS))
    let day2sales = await adminHelpers.getdayNsales(currentDate, ONE_DAY_IN_SECONDS, 2)
    let day3sales = await adminHelpers.getdayNsales(currentDate, ONE_DAY_IN_SECONDS, 3)
    let day4sales = await adminHelpers.getdayNsales(currentDate, ONE_DAY_IN_SECONDS, 4)
    let day5sales = await adminHelpers.getdayNsales(currentDate, ONE_DAY_IN_SECONDS, 5)
    let day6sales = await adminHelpers.getdayNsales(currentDate, ONE_DAY_IN_SECONDS, 6)
    let day7sales = await adminHelpers.getdayNsales(currentDate, ONE_DAY_IN_SECONDS, 7)



    let weekData = {
        day1: day7sales,//7 days ago
        day2: day6sales,
        day3: day5sales,
        day4: day4sales,
        day5: day3sales,
        day6: day2sales,
        day7: day1sales // today
    }


    res.render('admin/admin-dashboard', { cards, paymentsData, weekData })
})







router.get('/users', (req, res) => {// /admin home get-  users list

    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    //made the dash board as landing...


    userHelpers.getAllUsers().then((users) => {
        res.render('admin/admin-home', { users })
    })



})


router.get('/admin-login', (req, res) => {// it gives login page for aadmin - get
    if (req.session.adminLoggedIn) {
        res.redirect('/admin');
        return;

    }




    let adminLoginError = req.session.adminLoginError; // refresh il ith engane false aakkum?
    req.session.adminLoginError = false;// it was so easy..
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render('admin/admin-login', { adminLoginError })

})



router.post('/admin-login', (req, res) => {

    if (req.session.adminLoggedIn) {
        res.redirect('/admin')
        return;
    }



    if (req.body.username == process.env.adminUsername && req.body.password == process.env.adminPassword ) {// preset values for now. should i create a collection for it ? does it need multiple admins?
        req.session.adminLoggedIn = true;
        res.redirect('/admin')
        return;
    } else {

        req.session.adminLoginError = true;
        res.redirect('/admin/admin-login')

    }



})


router.get('/products-list', (req, res) => {


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }


    productHelpers.getAllProducts().then((products) => {

        res.render('admin/admin-products-list', { products })

    })




})


router.get('/add-product', async (req, res) => {// add product - form

    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    let categories = await adminHelpers.getAllCategory()


    res.render('admin/admin-add-product', { categories })


})


router.post('/add-product', (req, res) => {// add product - form


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }


    productHelpers.addProduct(req.body, (id) => {// new object id( _id)
        let image = req.files.image;
        image.mv('./public/product-images/' + id + '.png', (err, done) => {
            if (!err) {
                res.redirect('/admin/products-list')
            } else {
                console.log(err)
            }
        })
    })



})


// DELETE PRODUCT
router.get('/delete-product/:id', (req, res) => {// /admin - delete product


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    let ProductId = req.params.id;/// working on this now

    productHelpers.deleteProduct(ProductId).then(() => {
        res.redirect('/admin/products-list')

    })



})

//edit product

router.get('/edit-product/:id', async (req, res, next) => {


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }


    let productData = await productHelpers.getProductDetails(req.params.id)

    res.render('admin/admin-edit-product', { productData })


})




router.post('/edit-product/:id', async (req, res, next) => {



    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }



    productHelpers.updateProduct(req.params.id, req.body).then(() => {
        res.redirect('/admin/products-list')
    })

})


// block and unblock user

router.get('/block-user/:username', (req, res) => {



    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    userHelpers.blockUser(req.params.username).then(() => {

        res.redirect('/admin/users')
    })


})

router.get('/unblock-user/:username', (req, res) => {


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    userHelpers.unblockUser(req.params.username).then(() => {

        res.redirect('/admin/users')

    })


})


router.get('/orders-list', async (req, res) => {


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    let ordersList = await productHelpers.getAllOrders();
    
    
    res.render('admin/admin-orders-list', { ordersList })



})

router.get("/change-status-shipped/:orderId", async (req, res) => {


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    await userHelpers.changeStatusToShipped(req.params.orderId)
    res.redirect("/admin/orders-list")


})

router.get("/change-status-delivered/:orderId", async (req, res) => {


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    await userHelpers.changeStatusToDelivered(req.params.orderId)
    res.redirect("/admin/orders-list")


})

router.get("/delete-order/:orderId", async (req, res) => {



    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }


    await userHelpers.deleteOrder(req.params.orderId)
    res.redirect("/admin/orders-list")


})

router.get("/view-order-details/:orderId", async (req, res) => {  // route that fetches single order details( detailed view of order)



    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }



    let orderDetails = await userHelpers.getSingleOrderDetails(req.params.orderId);
    let products = await userHelpers.getProductsDetailsOfOrder(req.params.orderId);

    res.render('admin/admin-single-order-details', { orderDetails, products })




})


router.post('/set-delivery-date/:orderId', async (req, res) => {  // setting the delivery date by admin



    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }


    let orderId = req.params.orderId;
    await userHelpers.setDeliveryDate(req.params.orderId, req.body.deliverydate)
    res.redirect("/admin/view-order-details/" + orderId)


})


// banner routes ==========================================

//banners default page

router.get('/banners', async (req, res) => {




    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    let banners = await adminHelpers.getAllBanners();


    res.render('admin/banner-management', { banners })



})


// add banner page

router.get('/add-banner', async (req, res) => {




    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }


    res.render('admin/admin-add-banner')



})

router.post('/add-banner', async (req, res) => {



    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    adminHelpers.addNewBanner(req.body).then(((Id) => {
        let image = req.files.image;
        image.mv('./public/images/banners/' + Id + '.jpg', (err, done) => {
            if (!err) {
                res.redirect('/admin/banners')
            } else {
                console.log(err)
            }
        })

    }))


})

router.get('/delete-banner/:id', async (req, res) => {



    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }



    let id = req.params.id;

    if (fs.existsSync('./public/images/banners/' + id + '.jpg')) {

        fs.unlink('./public/images/banners/' + id + '.jpg', (err) => {
            if (err) {
                console.log(err)
            } else {
                adminHelpers.deleteBanner(id).then((resp) => {

                    res.redirect('/admin/banners')
                    return;
                })
            }
        })
    } else {
        console.log('somethiing went wroong')
    }



})



//offer routes





router.get('/offer/:id', async (req, res) => {



    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }



    let productId = req.params.id;
    let product = null;
    await productHelpers.getProductDetails(productId).then((productDetails) => {


        product = productDetails;
    })



    res.render('admin/admin-offer', { product })



})



router.post('/apply-offer', async (req, res) => {



    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    let productId = req.body.proId;
    // let product = null;
    await productHelpers.getProductDetails(productId).then((productDetails) => {
        adminHelpers.applyOfferOnProduct(productDetails, req.body.offerpercent).then(() => {
            res.redirect('/admin/products-list')
        })
    })


    // console.log(product)
    // console.log(req.params.id)
    // console.log(req.body)





})


router.get('/delete-offer/:proId', async (req, res) => {   // mm complete the delete after tution


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    let productId = req.params.proId // product id kitti, fetch whole doc, mrp ith price lek vechit venam baaki fiels change cheyyaan



    await productHelpers.getProductDetails(productId).then((productDetails) => {
        adminHelpers.deleteOffer(productDetails).then(() => {
            res.redirect('/admin/products-list')
        })
    })



})


//====================== category routes ============//



router.get('/category-management', async (req, res) => { // renders all category


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    let category = await adminHelpers.getAllCategory()


    res.render('admin/category-management', { category })



})



router.get('/add-category', (req, res) => { // renders the form



    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }


    res.render('admin/admin-add-category')



})

router.post('/add-category', (req, res) => {


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }


    adminHelpers.addNewCategory(req.body.category)
    res.redirect('/admin/category-management')

})


router.get('/delete-category/:categoryName', (req, res) => {


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }


    adminHelpers.deleteCategory(req.params.categoryName).then(() => {

        res.redirect('/admin/category-management')

    })


})

// ============sales  report test
// trying with puppeteer

router.get('/sales-report', async (req, res) => {

    let totalSales = await adminHelpers.getTotalSales();
    let CODAmt = await adminHelpers.getCodAmt() // cancelled allaatha cod orders sum kittum
    let payPalAmt = await adminHelpers.getPaypalAmt()
    let razorPayAmt = await adminHelpers.getRazorPayAmt()
    let ReportData = {
        Total: totalSales,
        cod: CODAmt,
        paypal: payPalAmt,
        razorpay: razorPayAmt,
        date: new Date()
    }

    // ========== new code - puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // ====

   
    var fileName = new Date().toISOString().replace(/[-:.]/g,"");  
    var pathAndName = './public/files/'+fileName +'.pdf';

    res.render('admin/pdf',{ReportData}, async (err, html) => {

            await page.setContent(html);
            await page.pdf({
                path: pathAndName,
                format:'A4',
                printBackground:true

            })

            fs.readFile(pathAndName,(err,data)=>{
                fs.unlink(pathAndName,(err)=>{
                    if(err) console.log(err)
                })
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=Sales_Report.pdf');
                res.end(data)


            }); 
           
           

        // html-pdf module - it didn't work ( no support of phantom js in arch) 
        // pdf.create(html, options).toFile(pathAndName, function (err, result) {
        //     if (err) {
        //         return console.log(err);
        //     } else {

        //         var file = fs.createReadStream(pathAndName);
        //         var stat = fs.statSync(pathAndName);
        //         fs.unlink(pathAndName,(err)=>{
        //             if(err) console.log(err)
        //         })
        //         res.setHeader('Content-Length', stat.size);
        //         res.setHeader('Content-Type', 'application/pdf');
        //         res.setHeader('Content-Disposition', 'attachment; filename=Sales_Report.pdf');
        //         file.pipe(res);
        //     }

        // });

    })
})







// coupons===============================================


router.get('/coupons', async (req, res) => { // renders all category


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    
     let coupons = await adminHelpers.getAllCoupons()
   

     res.render('admin/coupons', { coupons })
   


})



router.get('/add-coupon', (req, res) => { // renders the form



    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }


    res.render('admin/admin-add-coupon')



})


router.post('/add-coupon', (req, res) => {


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    console.log(req.body)


    adminHelpers.addNewCoupon(req.body.code, req.body.percent).then(()=>{
        res.redirect('/admin/coupons')
    })
    

})


router.get('/delete-coupon/:code', (req, res) => {


    if (!req.session.adminLoggedIn) {
        res.redirect('/admin/admin-login')
        return;
    }

    
    adminHelpers.deleteCoupon(req.params.code).then(() => {

        res.redirect('/admin/coupons')

    })


})




module.exports = router;


