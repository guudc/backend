//controllers functions
const abi = require('../Abi/abi.js')
const web3 = require('web3') 
const config = require('../../data.js')
const https = require('https')
const wallet = require('../models/models.js').walletDb;
const tx = require('../models/models.js').tx;
const fundtx = require('../models/models.js').fundDb;
const _eth = require('ethereumjs-wallet')
const crypto = require('crypto')
const uuid = require('uuid');
const email = require('./email.js').email
let bigNonce = 0;

let _web3 = new web3(new web3.providers.HttpProvider(config.rpc))
let SESSIONS = [] //stores user session
let PAYMENT = [] //to keep flag of payment validation
let USERTX = [] //to keep tab of user wallet values

//to save user
exports.newuser = (req, res) => {
    //create new wallet address
    try{    
        req = req.body;
        if(req.name && req.email && req.username && req.pass && req.b){  
            //checking if its using system name
            if((req.username + "").toLowerCase() != "maxim") {
                const _wal = _eth.default.generate()
                wallet.get(req.username, (_stat, dat) => {  
                    if(_stat.status === true) {  
                        //check if it has register print already
                        res.send({status:false, msg:'Username already registered'})
                    }
                    else {
                        //does not exists, create one
                        wallet.create((stat, id)=>{
                            if(stat) {  
                                //successfull
                                res.send({status:true, id:id})
                                SESSIONS[req.b] = req.username //login automatically
                            }
                            else {
                                res.send({status:false, msg:'Something went wrong'})
                            }
                        }, {currency:req.currency || 'naira',pass: req.pass, email:req.email, username: req.username, name:req.name, address: _wal.getAddressString(), key: _wal.getPrivateKeyString()})
                
                    }
                })
            }
            else {
                res.send({status:'error', msg:'Cannot use maxim as username'})   
            }
        }
        else{res.send({status:'error', msg:'Name, username, password, session id, or email address not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    
}  
//to reg user print
exports.reguserprint = (req, res) => {
    //create new wallet address
    try{   
        req = req.body;
        if(req.b){   
            isLogin(res,req.b, (username) => {
                wallet.get(username, (_stat) => {
                    if(_stat.status === true) {  
                        //get fingerprint number
                        wallet.getNumOfUsers(username,(stat) => {
                            if(stat.status === true) {
                                const print = generateRandomString(stat.num + 1)
                                const num = stat.num + 1;  
                                wallet.save((stat, id)=>{
                                    if(stat) { 
                                        //successfull
                                        res.send({status:true, id:id, num:num})
                                    }
                                    else {
                                        res.send({status:false, msg:'Something went wrong'})
                                    }
                                }, {id:username, print:print})
                            }
                        })
                    }
                    else {
                        //does not exists,  
                        res.send({status:false, msg:'User does not exists'})
                    }
                })
            })
        }
        else{res.send({status:'error', msg:'session id not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    
}
//to login
exports.login = (req, res) => {
    //create new wallet address
    try{   
        req = req.body;
        if(req.username && req.pass){ 
            wallet.get(req.username, (_stat, dat) => {
                if(_stat.status === true) {  
                    //get password
                     req.pass = crypto.createHash('sha1').update(req.pass).digest('hex')
                     if(dat.pass == req.pass) {
                        //save browser fingerprint in session
                        SESSIONS[req.b] = dat.username
                        //check if user has registered fingerprint
                        res.send({status:true, id:req.b, print: !(dat.print == ""), verify: dat.verify})
                     }
                     else {
                        res.send({status:false, msg:'Password don"t match'})
                     }
                }
                else {
                    //does not exists,  
                    res.send({status:false, msg:'User does not exists'})
                }
            })
        }
        else{res.send({status:'error', msg:'username or password not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    
} 
//to get user wallet data
exports.getuser = (req, res) => {
    try{   
        req = req.body;
        //get username from session data
        if(req.b){ 
            isLogin(res,req.b, (username) => { 
                wallet.get(username, (_stat, dat) => { 
                    if(_stat.status === true) {  
                        //get user wallet data details
                        getUserTx(username,(_dat) => {
                            dat.usda = _dat.usda
                            dat.fiat = _dat.fiat;
                            //hide private key and address
                            dat.key = ""; dat.address = "", dat.key = ""
                            res.send({status: true, data:dat})
                        })
                    }
                    else {
                        //does not exists,  
                        res.send({status:false, msg:'User does not exists'})
                    }
                })
            }) 
        }
        else{res.send({status:'error', msg:'session id not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    

}
//to get user wallet data based on username
exports.userdata = (req, res) => {
    try{   
        req = req.body;
        //get username from session data
        if(req.username){ 
            wallet.get(req.username, (_stat, dat) => { 
                    if(_stat.status === true) {   
                        //get user wallet data details
                        getUserTx(req.username,(_dat) => {
                            dat.usda = _dat.usda
                            dat.fiat = _dat.fiat;
                            //hide private key and address
                            dat.key = ""; dat.address = "", dat.key = ""
                            res.send({status: true, data:dat})
                        })
                    }
                    else {
                        //does not exists,  
                        res.send({status:false, msg:'User does not exists'})
                    }
            })
        }
        else{res.send({status:'error', msg:'username not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    

}
//to generate a verification email code
exports.getverify = (req, res) => {
    try{   
        req = req.body;
        //get username from session data
        if(req.username){ 
            wallet.get(req.username, (_stat, dat) => { 
                    if(_stat.status === true) { 
                        const code = uuid.v4().replace(/a-z0-9A-Z/g, "").substring(0,5)
                        //get user email details
                        let msg = generateVerifyMsg(code)
                        email(dat.id, msg, "Verification", (flag) => {
                            if(flag) {
                                //save the verification code
                                wallet.save((sFlag) => {
                                    if(sFlag) {
                                        res.send({status:true})   
                                    }
                                    else {
                                        res.send({status:false, msg:'Something went wrong'})
                                    }
                                }, {verify:code, id:req.username})
                            }
                            else {
                                res.send({status:false, msg:'Something went wrong'})
                            }
                        })
                    }
                    else {
                        //does not exists,  
                        res.send({status:false, msg:'User does not exists'})
                    }
            })
        }
        else{res.send({status:'error', msg:'username not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    

}
//to verify the email code
exports.verify = (req, res) => {
    try{   
        req = req.body;
        //get username from session data
        if(req.username && req.code){ 
            wallet.get(req.username, (_stat, dat) => { 
                    if(_stat.status === true) { 
                        const code = dat.verify
                        //get user email details
                        if(code != 'true' && (code == req.code)) {
                            //verified successfuly
                            wallet.save((sFlag) => {
                                if(sFlag) {
                                    res.send({status:true})   
                                }
                                else {
                                    res.send({status:false, msg:'Something went wrong'})
                                }
                            }, {verify:'true', id:req.username})
                        }
                        else {
                            res.send({status:false, msg:'Invalid code'})   
                        }
                    }
                    else {
                        //does not exists,  
                        res.send({status:false, msg:'User does not exists'})
                    }
            })
        }
        else{res.send({status:'error', msg:'username or code not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    

}
//to log out
exports.logout = (req, res) => {
    //create new wallet address
    try{   
        req = req.body;
        if(req.b){ 
            SESSIONS[req.b] = null
            res.send({status:true})
        }
        else{res.send({status:'error', msg:'session id provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    
}
//to modify a user personal data
exports.modifyuser = (req, res) => {
    //create new wallet address
    try{   
        req = req.body;
        if(req.b){ 
            isLogin(res,req.b, (username) => {
                wallet.get(username, (_stat) => {
                    if(_stat.status === true) {  
                        req.data = req.data || {}
                        req.data.id = username
                        wallet.save((stat)=>{
                            if(stat) { 
                                //successfull
                                res.send({status:true})
                            }
                            else {
                                res.send({status:false, msg:'Something went wrong'})
                            }
                        }, req.data)
                    }
                    else {
                        //does not exists,  
                        res.send({status:false, msg:'User does not exists'})
                    }
                })
            })
        }
        else{res.send({status:'error', msg:'session is not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    
}
//to modify a user login data
exports.changepass = (req, res) => {
    //create new wallet address
    try{   
        req = req.body;
        if(req.b && req.old && req.new){ 
            isLogin(res,req.b, (username) => {
                wallet.get(username, (_stat, dat) => {
                    if(_stat.status === true) {  
                        req.old = crypto.createHash('sha1').update(req.old).digest('hex')
                        req.new = crypto.createHash('sha1').update(req.new).digest('hex')
                        if(req.old == dat.pass){
                            wallet.save((stat)=>{
                                if(stat) { 
                                    //successfull
                                    res.send({status:true})
                                }
                                else {
                                    res.send({status:false, msg:'Something went wrong'})
                                }
                            }, {id:username, pass:req.new})
                        }
                        else{
                            res.send({status:false, msg:'Incorect password'})
                        }
                    }
                    else {
                        //does not exists,  
                        res.send({status:false, msg:'User does not exists'})
                    }
                })
            })
        }
        else{res.send({status:'error', msg:'session, old or new password is not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    
}
//to initiate a transfer
exports.transfer = (req, res) => {
    try{   
        req = req.body;
        //get username from session data
        if(req.b && req.username && req.amount){ 
            isLogin(res, req.b, (username) => {
                if(username != req.username){
                    wallet.get(username, (_stat, dat) => {
                        if(_stat.status === true) {  
                            //check if the receiver exists
                            wallet.get(req.username, (_stat, dat) => {
                                if(_stat.status === true) {  
                                    //get sender and receiver latest tx data
                                    getUserTx(username, (tx_sender) => {
                                        getUserTx(req.username, (tx_receiver) => {
                                            //create new tx data
                                            const typ = req.type || 'fiat'
                                            //add the percent value to the transaction
                                            const fee =  (config.txfee * req.amount)
                                            if(typ == 'fiat') {
                                                if(tx_sender.fiat >= ((req.amount * 1) + fee)) {
                                                    tx_sender.fiat -= req.amount
                                                    tx_receiver.fiat += req.amount
                                                    //create TX object
                                                    let tx_data = {
                                                        id:uuid.v4(), sender: username, receiver: req.username,
                                                        data: {
                                                            type:'transfer',
                                                            amount:req.amount,
                                                            date: (new Date(Date())).getTime()
                                                        }
                                                    }
                                                    tx_data.data[username] = {
                                                        fiat: tx_sender.fiat
                                                    }
                                                    tx_data.data[req.username] = {
                                                        fiat: tx_receiver.fiat
                                                    }
                                                    //save Tx data
                                                    tx.create((stat, id) => {
                                                        if(stat.status === true) {
                                                            //create another tx object for the system
                                                            tx.create((stat, ids) => {
                                                                if(stat.status === true) {
                                                                    res.send({status:true, tx_id: id, data: tx_data})
                                                                }
                                                                else {
                                                                    res.send({status:false, msg:'Something went wrong'}) 
                                                                }
                                                            }, {
                                                                id:uuid.v4(), user: username, receiver: 'maxim',
                                                                data: {
                                                                    type:'transfer',
                                                                    amount:fee,
                                                                    date: (new Date(Date())).getTime()
                                                                }
                                                            })
                                                        }
                                                        else {
                                                            res.send({status:false, msg:'Something went wrong'}) 
                                                        }
                                                    }, tx_data)
                                                }
                                                else {res.send({status:false, msg:'Insufficient amount'})}
                                            }
                                        })
                                    })
                                }
                                else {
                                    //does not exists,  
                                    res.send({status:false, msg:'Receiver does not exists'})
                                }
                            })
                        }   
                        else {
                            //does not exists,  
                            res.send({status:false, msg:'User does not exists'})
                        }
                    })
                }
                else{res.send({status:'error', msg:'Cannot send to yourself'})}
            }) 
        }
        else{res.send({status:'error', msg:'session id or username or amount not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    

}
//to get user transfer data
exports.gettx = (req, res) => {
    try{   
        req = req.body;
        //get username from session data
        if(req.username){ 
            tx.findAll(req.username, 50, (stat) => {
                if(stat.status === true) {  
                     res.send({status:true, data: stat.data})
                }
                else {
                    res.send({status:true, data:[]})
                }
            })
        }
        else{res.send({status:'error', msg:'username not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    

}
//to get transaction details
exports.tx = (req, res) => {
    try{   
        req = req.body;
        //get username from session data
        if(req.id){ 
            tx.get(req.id, (stat, data) => {
                if(stat.status === true) {
                    //get the individual user data
                    wallet.get(data.sender, (_stat, dat) => { 
                        if(_stat.status == true) {
                            data.sender_name = dat.name
                        }
                        else {data.sender_name = ""}
                        wallet.get(data.receiver, (_stat, dat) => { 
                            if(_stat.status == true) {
                                data.receiver_name = dat.name
                            }
                            else { data.receiver_name = ""}
                            res.send({status:true, data: data})
                        })  
                    })
                }
                else {
                    res.send({status:true, data:[]})
                }
            })
        }
        else{res.send({status:'error', msg:'Tx id not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    

}
//to create a new deposit link
exports.createpayment = (req, res) => {
    try{   
        req = req.body;
        //get username from session data
        if(req.username && req.amount){ 
             //check if user exists
             wallet.get(req.username, (_stat, dat) => {
                if(_stat.status === true) {  
                    //create the funding tx data
                    const fund_tx = {
                        amount: req.amount,
                        username: req.username,
                        ref: format(uuid.v4().replace(/-/g,"")),
                        time: Date.now()
                    }
                    fundtx.create((stat, id) => {
                        if(stat) {
                            res.send({status:true, id:fund_tx.ref})
                        }
                        else {res.send({status:false, msg:'Unable to create payment data'}) }
                    }, {username:req.username, id:fund_tx.ref, data:fund_tx})
                }
                else {res.send({status:false, msg:'User not found'}) }
            })
        }
        else{res.send({status:'error', msg:'username or amount not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    

} 
//to fund a user after making payment
exports.payment = (req, res) => {
    try{   
        req = req.body;
        //get username from session data
        if(req.ref){ 
             //get payment details
             fundtx.get(req.ref, (stat, data) => {
                if(stat) { data = data.data; 
                    //get user transaction details
                    getUserTx(data.username, (p) => {  
                        //verify payment first
                        verifyPayment(req.ref, (_stat) => {  
                                if(_stat == 'success') {
                                    //send money from system to user
                                    const tx_data = {
                                        id:uuid.v4(), sender: 'system', receiver: data.username,
                                        data: {
                                            type:'transfer',
                                            amount:(data.amount * 1),
                                            date: data.time
                                        }
                                    }
                                    tx_data.data['system'] = {fiat: 0}
                                    tx_data.data[data.username] = {fiat: (data.amount * 1) + (p.fiat)}
                                    
                                    //save Tx data
                                    tx.create((_st, id) => {
                                        if(_st.status === true) {
                                            //delete fund tx
                                            fundtx.delete(req.ref, (_val) => {
                                                if(_val.status == true) {
                                                    res.send({status:true})   
                                                }
                                                else {
                                                    res.send({status:false, msg:'Internal server error'})   
                                                }
                                            })
                                        }
                                        else {
                                            res.send({status:false, msg: 'Internal server error'})
                                        }
                                    }, tx_data)
                                }
                                else if(_stat == 'error' || _stat == 'abandoned' || _stat == 'failed') {
                                    //delete this payment transaction
                                    fundtx.delete(req.ref, (_val) => {
                                        if(_val.status == true) {
                                            res.send({status:false, msg:'Invalid payment'}) 
                                        }
                                    })
                                }
                                else if(_stat == 'network'){
                                    //network error
                                    res.send({status:'error', msg:'Internal server error'}) 
                                }
                                else {
                                    //network error
                                    res.send({status:'error', msg:'Ongoing'}) 
                                }
                        })
                    })
                }
                else {
                    res.send({status:false, msg:'Payment data not found'}) 
                }
             })
             
        }
        else{res.send({status:'error', msg:'payment id not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    

} 
//to validate all outstanding deposit
exports.validatepayment = (req, res) => {
    try{   
        req = req.body;
        //get username from session data
        if(req.username){ 
            //get all payment ref details
            if(PAYMENT[req.username] != true) {
                PAYMENT[req.username] = true
                fundtx.find(req.username, (_vx) => {
                 if(_vx.status === true) {
                     const d = _vx.data;    
                     if(d.length > 0) { 
                        ele = d.pop()  
                           //get payment details
                           const data = ele.data;
                           getUserTx(data.username, (p) => {  
                                        //verify payment first
                                        verifyPayment(ele.id, (_stat) => {  
                                                if(_stat == 'success') {
                                                    //send money from system to user
                                                    //use same id as payment to prevent double Tx
                                                    const tx_data = {
                                                        id:ele.id, sender: 'system', receiver: data.username,
                                                        data: {
                                                            type:'transfer',
                                                            amount:(data.amount * 1),
                                                            date: data.time
                                                        }
                                                    }
                                                    tx_data.data['system'] = {fiat: 0}
                                                    tx_data.data[data.username] = {fiat: (data.amount * 1) + (p.fiat)}
                                                    
                                                    //save Tx data
                                                    tx.create((_st, id) => {
                                                        if(_st.status === true) {
                                                            //delete fund tx
                                                            fundtx.delete(ele.id, (_val) => {
                                                                if(_val.status == true) {
                                                                    PAYMENT[req.username] = false
                                                                    res.send({status:false})
                                                                }
                                                                else {
                                                                    PAYMENT[req.username] = false
                                                                    res.send({status:false})  
                                                                }
                                                            })
                                                        }
                                                        else {
                                                            PAYMENT[req.username] = false
                                                            res.send({status:false})
                                                        }
                                                    }, tx_data)
                                                }
                                                else if(_stat == 'error' || _stat == 'abandoned' || _stat == 'failed' || ele.time > (86400)) {
                                                    //delete this payment transaction if it failed or has passed a day
                                                    fundtx.delete(ele.id, (_val) => {
                                                        if(_val.status == true) {
                                                            res.send({status:false}) 
                                                        }
                                                    })
                                                }
                                                else if(_stat == 'network'){
                                                    res.send({status:false})
                                                }
                                                else {
                                                    res.send({status:false})
                                                }
                                        })
                           })
                     }
                     else {
                        PAYMENT[req.username] = false
                        res.send({status:true})
                    }
                 }
                 else {
                    PAYMENT[req.username] = false
                    res.send({status:true})
                 }
                })
            }
            else {res.send({status:false})}
             
        }
        else{res.send({status:'error', msg:'payment id not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    

} 





function verifyPayment(refId, callback) { 
    fetch('https://api.paystack.co/transaction/verify/' + refId, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + config.paystack_priv_key
        }
        })
        .then(response => response.json())
        .then(data => { 
            if(data.status) {
                //check the status of transfer
                if(data.data) {
                    callback(data.data.status)
                }
                else {callback('error')}
            }
            else {
                callback('error')
            }
        })
        .catch(error => {   
            callback('network')
    });
        
}
function generateRandomString(length) {
    let result = '';
    const characters = 'aaaaaaaaaaaaaaaaaaaaaaa';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function isLogin(res, session_id, callback) {
    const username = SESSIONS[session_id];
    if(username == undefined || username == null){
        //this id has not login
        res.send({status:false, msg: 'invalid session'})
        return;
    }
    else callback(username)
}
function getUserTx(username, callback) {
    //to return users Transaction data
   
        tx.findAllNoLimit(username, (stat) => { 
            if(stat.status === true) {
                //loop through data
                let fiat = 0; let usda = 0;
                if(stat.data.length > 0){
                    for(let i=0;i<stat.data.length;i++) {
                        //check if its a debit or credit
                        if(stat.data[i].sender != username) {
                            //credit
                            fiat += (stat.data[i].data.amount * 1)
                        }
                        else {
                            //debit
                            fiat -= (stat.data[i].data.amount * 1)
                        }
                    }
                }
                USERTX[username] = [true, {
                    fiat: fiat,
                    usda:usda
                }]
                callback( {
                    fiat: fiat,
                    usda:usda
                })
            }
            else {
                USERTX[username] = [true, {
                    fiat: 0,
                    usda:0
                }]
                callback({
                    fiat:0,
                    usda:0
                })
            }
        })
  
}
function generateVerifyMsg(code) {
    return `<div style='font-size:20px;width:100%;padding:20px 0px; background:dodgerblue;color:white'>
<center>Welcome to MaximPay</center></div><center> <h2>Verification Code</h2><br><br><h3>${code}</h3></b></center>`

}
function format(str) {
    // convert the string to uppercase to simplify the conversion
    str = str.toUpperCase();
    let result = "";
  
    for (let i = 0; i < str.length; i++) {
      const char = str.charAt(i);
  
      // check if the character is an alphabet
      if (/^[A-Z]$/.test(char)) {
        // convert the character to its ASCII code and subtract the ASCII code of 'A' to get the character's number value
        const numberValue = char.charCodeAt(0) - 64;
        result += numberValue;
      } else {
        // if the character is not an alphabet, add it to the result as is
        result += char;
      }
    }
  
    return result;
  }
  

