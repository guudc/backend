/* 
    This is a route function
    containing route to main components
    of the payment system
*/
const express = require("express")
const router = express.Router()
const controller = require('../controllers/controllers.js')
const dataParser = require('body-parser')
const fs = require('fs')
router.use(dataParser.json({extended:true}))
const path = __dirname.substring(0, __dirname.indexOf("src")) + "/test/"
router.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', '*');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

router.post('/newuser', controller.newuser)
router.post('/reguserprint', controller.reguserprint)
router.post('/login', controller.login)
router.post('/userdata', controller.getuser)
router.post('/getuser', controller.userdata)
router.post('/modifyuser', controller.modifyuser)
router.post('/transfer', controller.transfer)
router.post('/gettransfer', controller.gettx)
router.post('/gettx', controller.tx)
router.post('/getverify', controller.getverify)
router.post('/verify', controller.verify)
router.post('/changepass', controller.changepass)
router.post('/logout', controller.logout)
router.post('/createpayment', controller.createpayment)
router.post('/payment', controller.payment)
router.post('/validatepayment', controller.validatepayment)
router.post('/contact', controller.contact)
router.post('/adduser', controller.adduser)
router.get('/waitlist', controller.getwaitlist)


//listen to 404 request
router.get("*", (req, res) =>{
    let tm = req.url
    if(fs.existsSync(path + tm)){
        res.sendFile(path + tm)
    }
    else{
        res.status(404).json({
            success: false,
            message: "Page not found",
            error: {
                statusCode: 404,
                message:
                    "You are trying to access a route that is not defined on this server."
            }
        })
    }
})

//exports router
module.exports = router
    
