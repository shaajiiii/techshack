const MongoClient=require('mongodb').MongoClient
const state={
    db:null
}

module.exports.connect=(done)=>{
    
   
    const url = process.env.mongoUrl;
    
    const dbname='techshack'
    MongoClient.connect(url,(err,data)=>{
         if(err) return done(err)
         state.db=data.db(dbname)
         done()
    })
   
}
module.exports.get=function(){
    return state.db
}