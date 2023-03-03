/* 
    This is a model function
    containing models to main components
    of the nptr payment system
*/

//Import the mongoose module
const mongoose = require('mongoose');
const schema = mongoose.Schema
const crypto = require('crypto')

//Set up default mongoose connection
const mongoDB = 'mongodb+srv://Indo:Loveesther567.@cluster0.1o3kiu8.mongodb.net/test';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
console.log("Connected")

//Get the default connection
const db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//creating Wallet database class
class _Wallet{
    /*
        This class controls the wallet
        model database connection
    */
    model = null;
    constructor(){
        //initialize database schema
        this.model = mongoose.model('wallet4', (new schema({
            id:String, pass:String, address:String, key:String,
            currency:String, name:String, username:String, print:String,
            verify:String, data:Object
        })))
    }

    create(func, params){
      /*
        This functions create a new wallet
        data and store in the database
        It returns the wallet Id
      */
       //create id
       let mData = {id:params.email, print:"", address:params.address, key:params.key, name: params.name, username: params.username,
       pass: crypto.createHash('sha1').update(params.pass).digest('hex'), currency: params.currency || "naira:",
       verify:'', data:null
       }
       new this.model(mData)
       .save((err) =>{
           if(err) func({status:'error',msg:'Internal database error'})
           func({status:true}, params.username) 
       })
     }
    get(id, func){
      /*
        This functions get a wallet
        data and store in the database
        It returns the wallet Json data
      */
          if(id){
           //find the request dat
            this.model.find({'username':id},(err, res) =>{
                if(err) func({status:'error',msg:'Internal database error'})
                if(res != null){  
                     if(res.length > 0){
                        res = res[0]
                        let p = {
                            id:res.id,address:res.address, key:res.key, name:res.name, verify:res.verify || "", data:res.data,
                            currency:res.currency || 'naira', username: res.username, print: res.print, pass: res.pass
                        }
                        func({status:true}, p)
                     }
                    else{func({status:'error',msg:'No wallet id found'})}
                }
                else{func({status:'error',msg:'No wallet id found'})}
           })
           
       }
       else{
           //no request id found
           func({status:'error',msg:'No wallet id found'})
       }
    }
    getWithPrint(id, func){
      /*
        This functions get a wallet
        data and store in the database
        It returns the wallet Json data
      */
          if(id){
           //find the request dat
            this.model.find({'print':id},(err, res) =>{
                if(err) func({status:'error',msg:'Internal database error'})
                if(res != null){ 
                     if(res.length > 0){
                        res = res[0]
                        let p = {
                            id:res.id,address:res.address, key:res.key, name:res.name, verify: res.verify || "", data:res.data,
                            currency:res.currency || 'naira', username: res.username, print:res.print, pass: res.pass
                        }
                        func({status:true}, p)
                     }
                    else{func({status:'error',msg:'No wallet id found'})}
                }
                else{func({status:'error',msg:'No wallet id found'})}
           })
           
       }
       else{
           //no request id found
           func({status:'error',msg:'No wallet id found'})
       }
    }
    getNumOfUsers(id,func) {
        /*
            This function returns the number of registered users
        */
        this.model.find({}, (err, res) =>{
                if(err) func({status:'error',msg:'Internal database error'})
                if(res != null){   
                     if(res.length > 0){
                        func({status:true, num:res.findIndex((x) => {return x.username === id})})
                     }
                    else{func({status:'error',msg:'No wallet id found'})}
                }
                else{func({status:'error',msg:'No wallet id found'})}
        })
    }
    getAll(num,func){
        /*
          This functions get list of wallet taht have not been airdrop
          data and store in the database
          It returns the wallet Json data
        */
        this.model.find({'status':'empty'}, (err, res) =>{
                  if(err) func({status:'error',msg:'Internal database error'})
                  if(res != null){  
                       if(res.length > 0){
                          func({status:true, data:res})
                       }
                      else{func({status:'error',msg:'No wallet id found'})}
                  }
                  else{func({status:'error',msg:'No wallet id found'})}
        }).limit(num)
      }
    save(func, params){
        /*
         This functions saves or modify a proposal
         data and store in the database
         It returns either true|false|null
       */ 
        //get the specified request from database
        if(params.id != undefined && params.id != null){
             //first find the proposal
            this.model.find({'username':params.id},(err, res) =>{
                if(err) func({status:'error',msg:'Internal database error'})
                if(res != null){//console.log(res)
                     if(res.length > 0){ 
                        res = res[0]
                        if(params.print || res.print){
                            res.print = params.print 
                        }
                        if(params.name || res.name){
                            res.name = params.name 
                        }
                        if(params.email || res.email){
                            res.email = params.email 
                        }
                        if(params.currency || res.currency){
                            res.currency = params.currency 
                        }
                        if(params.pass || res.pass){
                            res.pass = params.pass 
                        }
                        if(params.verify || res.verify){
                            res.verify = params.verify 
                        }
                        const p = res; //console.log(params)
                        this.model.findOneAndUpdate({'username':params.id}, p,{new:true}, (err, res) =>{
                            if(err) func({status:'error',msg:'Internal database error'})
                            if(res != null){
                                func({status:true})
                            }                         
                       })
                     }
                    else{func({status:'error',msg:'No wallet with id found'})}
                }
                else{func({status:'error',msg:'No wallet with id found'})}
           })
            
        }
        else{
            //no request id found
            func({status:'error',msg:'No wallet id found'})
        }
     }
    
}
class _Wallet_Data{
    /*
        This class controls the wallet
        model database connection
    */
    model = null;
    constructor(){
        //initialize database schema
        this.model = mongoose.model('wallet_data', (new schema({
            id:String, fiat:Number
        })))
    }

    create(func, params){
      /*
        This functions create a new wallet
        data and store in the database
        It returns the wallet Id
      */
       //create id
       let mData = {id:params.id, fiat:0}
       new this.model(mData)
       .save((err) =>{
           if(err) func({status:'error',msg:'Internal database error'})
           func({status:true}, params.username) 
       })
     }
    get(id, func){
      /*
        This functions get a wallet
        data and store in the database
        It returns the wallet Json data
      */
          if(id){
           //find the request dat
            this.model.find({'id':id},(err, res) =>{
                if(err) func({status:'error',msg:'Internal database error'})
                if(res != null){  
                     if(res.length > 0){
                        res = res[0]
                        let p = {
                            id:res.id,fiat:res.fiat
                        }
                        func({status:true}, p)
                     }
                    else{func({status:'error',msg:'No wallet id found'})}
                }
                else{func({status:'error',msg:'No wallet id found'})}
           })
           
       }
       else{
           //no request id found
           func({status:'error',msg:'No wallet id found'})
       }
    }
    
    getAll(num,func){
        /*
          This functions get list of wallet taht have not been airdrop
          data and store in the database
          It returns the wallet Json data
        */
        this.model.find({'status':'empty'}, (err, res) =>{
                  if(err) func({status:'error',msg:'Internal database error'})
                  if(res != null){  
                       if(res.length > 0){
                          func({status:true, data:res})
                       }
                      else{func({status:'error',msg:'No wallet id found'})}
                  }
                  else{func({status:'error',msg:'No wallet id found'})}
        }).limit(num)
      }
    save(func, params){
        /*
         This functions saves or modify a proposal
         data and store in the database
         It returns either true|false|null
       */ 
        //get the specified request from database
        if(params.id != undefined && params.id != null){
             //first find the proposal
            this.model.find({'id':params.id},(err, res) =>{
                if(err) func({status:'error',msg:'Internal database error'})
                if(res != null){//console.log(res)
                     if(res.length > 0){ 
                        res = res[0]
                        if(params.fiat || res.fiat){
                            res.fiat = params.fiat 
                        }
                        const p = res; //console.log(params)
                        this.model.findOneAndUpdate({'id':params.id}, p,{new:true}, (err, res) =>{
                            if(err) func({status:'error',msg:'Internal database error'})
                            if(res != null){
                                func({status:true})
                            }                         
                       })
                     }
                    else{func({status:'error',msg:'No wallet with id found'})}
                }
                else{func({status:'error',msg:'No wallet with id found'})}
           })
            
        }
        else{
            //no request id found
            func({status:'error',msg:'No wallet id found'})
        }
     }
    
}
class Transactions{
    /*
        This class controls the wallet
        model database connection
    */
    model = null;
    constructor(){
        //initialize database schema
        this.model = mongoose.model('tx01', (new schema({
            id:String, sender:String, receiver:String, data:Object
        })))
    }

    create(func, params){
      /*
        This functions create a new Transaction
        data and store in the database
        It returns the wallet Id
      */
       //create id
       let mData = {id:params.id, sender:params.sender, receiver:params.receiver, data:params.data}
       new this.model(mData)
       .save((err) =>{
           if(err) func({status:'error',msg:'Internal database error'})
           func({status:true}, params.username) 
       })
     }
    get(id, func){
      /*
        This functions get a transaction
        data and store in the database
        It returns the transaction Json data
      */
          if(id){
           //find the request dat
            this.model.find({'id':id},(err, res) =>{
                if(err) func({status:'error',msg:'Internal database error'})
                if(res != null){  
                     if(res.length > 0){
                        res = res[0]
                        let p = {
                            id:res.id,sender:res.sender, receiver:res.receiver, data:res.data
                        }
                        func({status:true}, p)
                     }
                    else{func({status:'error',msg:'Nothing found'})}
                }
                else{func({status:'error',msg:'Nothing found'})}
           })
           
       }
       else{
           //no request id found
           func({status:'error',msg:'No wallet id found'})
       }
    }
    find(id, func){
        /*
          This functions get a transaction
          data base on a user and store in the database
          It returns the transaction Json data
        */
            if(id){
             //find the request dat
              this.model.find({$or: [{'sender':id}, {'receiver': id}]},(err, res) =>{
                  if(err) func({status:'error',msg:'Internal database error'})
                  if(res != null){  
                       if(res.length > 0){
                          res = res[0]
                          let p = {
                              id:res.id,sender:res.sender, receiver:res.receiver, data:res.data
                          }
                          func({status:true}, p)
                       }
                      else{func({status:'error',msg:'Nothing found'})}
                  }
                  else{func({status:'error',msg:'Nothing found'})}
             }).sort({_id:-1}).limit(1)
             
         }
         else{
             //no request id found
             func({status:'error',msg:'No wallet id found'})
         }
    }
    findAll(id,num, func){
        /*
          This functions get a transaction
          data base on a user and store in the database
          It returns the transaction Json data
        */
            if(id){
             //find the request dat
              this.model.find({$or: [{'sender':id}, {'receiver': id}]},(err, res) =>{
                  if(err) func({status:'error',msg:'Internal database error'})
                  if(res != null){  
                       if(res.length > 0){
                          func({status:true, data:res})
                       }
                      else{func({status:'error',msg:'Nothing found'})}
                  }
                  else{func({status:'error',msg:'Nothing found'})}
             }).sort({_id:-1}).limit(num)
             
         }
         else{
             //no request id found
             func({status:'error',msg:'No wallet id found'})
         }
    }
    findAllNoLimit(id, func){
        /*
          This functions get a transaction
          data base on a user and store in the database
          It returns the transaction Json data
        */
            if(id){
             //find the request dat
              this.model.find({$or: [{'sender':id}, {'receiver': id}]},(err, res) =>{
                  if(err) func({status:'error',msg:'Internal database error'})
                  if(res != null){  
                       if(res.length > 0){
                          func({status:true, data:res})
                       }
                      else{func({status:'error',msg:'Nothing found'})}
                  }
                  else{func({status:'error',msg:'Nothing found'})}
             }).sort({_id:-1})
             
         }
         else{
             //no request id found
             func({status:'error',msg:'No wallet id found'})
         }
      }
    getAll(num,func){
        /*
          This functions get list of transaction
          data and store in the database
          It returns the transaction Json data
        */
        this.model.find({}, (err, res) =>{
                  if(err) func({status:'error',msg:'Internal database error'})
                  if(res != null){  
                       if(res.length > 0){
                          func({status:true, data:res})
                       }
                      else{func({status:'error',msg:'Nothing found'})}
                  }
                  else{func({status:'error',msg:'Nothing found'})}
        }).limit(num)
      }
     
    
}
class Fund{
    /*
        This class controls the wallet
        model database connection
    */
    model = null;
    constructor(){
        //initialize database schema
        this.model = mongoose.model('maximpay_fund01', (new schema({
            id:String, username:String, data:Object
        })))
    }

    create(func, params){
      /*
        This functions create a new Transaction
        data and store in the database
        It returns the wallet Id
      */
       //create id
       let mData = {id:params.id, username:params.username, data:params.data}
       new this.model(mData)
       .save((err) =>{
           if(err) func({status:'error',msg:'Internal database error'})
           func({status:true}, params.id) 
       })
     }
    get(id, func){
      /*
        This functions get a transaction
        data and store in the database
        It returns the transaction Json data
      */
          if(id){
           //find the request dat
            this.model.find({'id':id},(err, res) =>{
                if(err) func({status:'error',msg:'Internal database error'})
                if(res != null){  
                     if(res.length > 0){
                        res = res[0]
                        let p = {
                            id:res.id, username: res.username, data:res.data
                        }
                        func({status:true}, p)
                     }
                    else{func({status:'error',msg:'Nothing found'})}
                }
                else{func({status:'error',msg:'Nothing found'})}
           })
           
       }
       else{
           //no request id found
           func({status:'error',msg:'No tx found'})
       }
    }
    find(id, func){
        /*
          This functions get a transaction
          data base on a user and store in the database
          It returns the transaction Json data
        */
            if(id){
             //find the request dat
              this.model.find({'username':id},(err, res) =>{
                  if(err) func({status:'error',msg:'Internal database error'})
                  if(res != null){  
                       if(res.length > 0){
                         func({status:true, data:res})
                       }
                      else{func({status:'error',msg:'Nothing found'})}
                  }
                  else{func({status:'error',msg:'Nothing found'})}
             }).sort({_id:-1})
             
         }
         else{
             //no request id found
             func({status:'error',msg:'No tx found'})
         }
    }
    
    getAll(num,func){
        /*
          This functions get list of transaction
          data and store in the database
          It returns the transaction Json data
        */
        this.model.find({}, (err, res) =>{
                  if(err) func({status:'error',msg:'Internal database error'})
                  if(res != null){  
                       if(res.length > 0){
                          func({status:true, data:res})
                       }
                      else{func({status:'error',msg:'Nothing found'})}
                  }
                  else{func({status:'error',msg:'Nothing found'})}
        }).limit(num)
      }
      delete(id, func){
        /*
          This functions get a transaction
          data and store in the database
          It returns the transaction Json data
        */
            if(id){
             //find the request dat
              this.model.deleteOne({'id':id},(err, ) =>{
                  if(err){
                     func({status:'error',msg:'Internal database error'})
                  }
                  else {func({status: true})}
                  
            })
             
         }
         else{
             //no request id found
             func({status:'error',msg:'No tx found'})
         }
      }
    
}
//exports modules
exports.walletDb =  new _Wallet();
exports.walletData = new _Wallet_Data();
exports.tx = new Transactions();
exports.fundDb = new Fund();