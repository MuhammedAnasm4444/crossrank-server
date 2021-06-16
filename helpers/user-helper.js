const db  = require('../config/connection')
const collection = require('../config/collection')
const bcrypt = require('bcrypt');
const objectId = require('mongodb').ObjectID

module.exports = {
    signup:(data) => {
        return new Promise(async(resolve, reject) => {
            var userExist =  await db.get().collection(collection.USER).findOne({email:data.email})
            if(userExist) {
                resolve({emailErr:"Email already exists"})
            }
            else {
                data.password =  await bcrypt.hash(data.password, 10)
                delete data.password2
                db.get().collection(collection.USER).insertOne(data).then((data) => {
                    resolve(data.ops[0])
                })
            }
           
         })
    },
    login:(data) => {
        return new Promise(async(resolve, reject) => {
           var user = await db.get().collection(collection.USER).findOne({email:data.email})
           if(!user) resolve({emailNotFound:"email not found"})
           bcrypt.compare(data.password, user.password).then(isMatch => {
             if(isMatch) {
                 const payload = {
                     id:user._id,
                     name:user.name
                 };
                 resolve(payload)
             }
             else resolve({passwordInCorrect:"Password Incorrect"})
           })
           
        })
    },
    getUserProfile:(id) => {
        return new Promise(async(resolve, reject) => {
            var user = await db.get().collection(collection.USER).findOne({_id:objectId(id)})
            var submissions = await db.get().collection(collection.SUBMISSIONS).find({userId:id}).toArray()
            resolve({user,submissions})
        })

    },
    getLeaderboard:()=> {
        return new Promise(async(resolve, reject) => {
            var data = await db.get().collection(collection.LEADERBOARD).find({}).toArray()
            data.sort((a, b ) =>{ 
                return b.points - a.points
            })
            console.log(data)
            resolve(data)
        })
    },
    getBlog:(id) => {
        return new Promise(async(resolve, reject) => {
            var blog = await db.get().collection(collection.BLOGS).findOne({_id:objectId(id)})
            resolve(blog)

        })
    },
    addBlog:(data) => {
        return new Promise((resolve, reject ) => {
            data.likes = 0
            data.comments = 0
            db.get().collection(collection.BLOGS).insertOne(data).then(() => {
                resolve()
            })
        })

    },
    checkBlog:(data) => {
        return new Promise(async(resolve, reject) => {
            var likedBlog = await db.get().collection(collection.LIKES).findOne({blog:data.blog, user:data.user})
            if(likedBlog) resolve(true)
            else resolve(false)
        })

    },
    likeBlog:(data) => {
        return new Promise ((resolve, reject) => {
            db.get().collection(collection.LIKES).insertOne(data).then(() => {
                db.get().collection(collection.BLOGS).updateOne({_id:objectId(data.blog)}, {
                    $inc:{
                        likes:1
                    }
                }).then(() => {
                    resolve()
                })
                
               
            })
        })
    },
    dislikeBlog:(data)=> {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.LIKES).removeOne({blog:data.blog,user:data.user}).then(() => {
                db.get().collection(collection.BLOGS).updateOne({_id:objectId(data.blog)}, {
                    $inc:{
                        likes:-1
                    }
                }).then(() => {
                    resolve()
                })
            })
        })
    },
    addSubmission:(data) => {
        return new Promise(async(resolve, reject) => {
            db.get().collection(collection.SUBMISSIONS).insertOne(data).then(async()=> {
                if(data.status=== true) {
                    let leaderboard = await db.get().collection(collection.LEADERBOARD).findOne({userId:data.userId})
                    if(leaderboard) {
                        db.get().collection(collection.LEADERBOARD).updateOne({userId:data.userId}, {
                            $inc:{
                               points:parseInt(data.point),
                               submissions:data.attempts, 
                            }
                        })

                    }
                    else {
                        console.log(data)
                        console.log(data.userId)
                        let user = await db.get().collection(collection.USER).findOne({_id:objectId(data.userId)})
                        console.log(user)
                        let obj = {
                            user:user.name,
                            userId:data.userId,
                            points:parseInt(data.point),
                            submissions:data.attempts,

                        }
                       await db.get().collection(collection.LEADERBOARD).insertOne(obj)
                    }
                }
                resolve()
            })
        })

    },
    postComment:(data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COMMENTS).insertOne(data).then(() => {
                db.get().collection(collection.BLOGS).updateOne({_id:objectId(data.blog)}, {
                    $inc:{
                        comments:1
                    }
                }).then(() => {
                    resolve()
                })
            })
        })
    },
    createChatRoom:(data) =>{ 
        return new Promise(async(resolve, reject) => {
            var chatExist = await  db.get().collection('rooms').findOne({name:data.name})
            if(chatExist){

            }
            else{
                db.get().collection('rooms').insertOne(data).then(() => {
                 resolve()
                } )
            }
           
        })
    }
}