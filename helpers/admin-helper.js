const db  = require('../config/connection')
const collection = require('../config/collection')
const bcrypt = require('bcrypt');

const objectId = require('mongodb').ObjectID
module.exports = {
    login:(data) => {
        return new Promise(async(resolve, reject) => {
            var admin = await db.get().collection(collection.ADMIN).findOne({email:data.email})
            if(!admin) resolve({emailError:"wrong email"})
            else {
                if(data.password === admin.password){
                    resolve({message:"admin successfully logged"})
                }
                else resolve({passwordError:"Incorrect Password"})
            }
        })
    },
    addChallenge:(data) => {
        return new Promise((resolve, reject) => {
            data.key = 0;
            db.get().collection(collection.CHALLENGES).insertOne(data).then(()=>{
                resolve()
            })
        })
    },
    getChallenge:(id) => {
        return new Promise(async(resolve, reject) => {
            console.log(id)
            var tasks = await db.get().collection(collection.TASKS).find({challengeId:id}).toArray()
            console.log(tasks)
            db.get().collection(collection.CHALLENGES).findOne({_id:objectId(id)}).then((challenge) => {
                resolve({challenge:challenge, tasks: tasks})
            })
        })  
    },
    getChallenges:() => {
        return new Promise(async(resolve, reject) => {
          var challenges = await  db.get().collection(collection.CHALLENGES).find().toArray()
          resolve(challenges)
        })
    },
    editChallenge:(data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CHALLENGES).updateOne({_id:objectId(data._id)},{
                $set:{
                    title:data.title,
                    language:data.language,
                    description:data.description, 
                }
            })
                resolve()
        
            

        })
    },
    removeChallenge:(id) =>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CHALLENGES).removeOne({_id:objectId(id)})
            resolve()
        })
    },
    getUsers:() => {
        return new Promise(async(resolve, reject) => {
            var users = await  db.get().collection(collection.USER).find().toArray()
            resolve(users)
          })  
    },
    addTask:(data) => {
        return new Promise(async(resolve, reject) => {
            var challenge = await db.get().collection(collection.CHALLENGES).findOneAndUpdate({_id:objectId(data.challengeId)},{
                 $inc: { key: 1 } 
            })
            
            data.level =  challenge.value.key
            console.log("jdfjjjjjjjjjjjjjjjjjjjjjjjjjj")
            console.log(challenge)
            console.log("***************************8")
            db.get().collection(collection.TASKS).insertOne(data).then((response) => {
                const task = response.ops[0]
                 resolve({title:challenge.value.title,task:task})
            })
        })
    },
    getTask:(id, cId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TASKS).findOne({_id:objectId(id)}).then((task) => {
                db.get().collection(collection.CHALLENGES).findOne({_id:objectId(cId)}).then((challenge)=>{
                    resolve({task:task, challenge:challenge})
                })
                
            })
        })
    },
    getTest:(taskId) => {
        return new Promise(async(resolve, reject) => {
           var tests = await db.get().collection(collection.TESTS).find({taskId:taskId}).toArray()
           resolve(tests)
        })

    },
    addTestCase:(data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TESTS).insertOne(data).then(()=>{
                resolve()
            })
        })
    }
}