const adminHelper = require("../helpers/admin-helper");
const jwt = require("jsonwebtoken");
const { response } = require("express");
const maxAge = 3 * 34 * 60 * 60;
const axios = require('axios');
const { connect } = require("../config/connection");


module.exports  = {
    login:(req, res) => {
        adminHelper.login(req.body).then((response) =>{
            if(response.emailError) res.status(400).json({message:"Incorrect Email"})
            if(response.passwordError) res.status(400).json({message:"Incorrect Password"})
            
            else {
                // creating token
              jwt.sign(
                response,
                process.env.SECRET,
                {
                  expiresIn:maxAge
                },
                (err, token) => {
                  res.json({
                    success:true,
                    token:token,
                    message:"Admin Logged In"
                  });
                }
              )
              }
        })
    },
    add_challenge:(req, res) => {
      console.log(req.body)
      adminHelper.addChallenge(req.body).then(() => {
        console.log("added")
        res.json({message:"new challenge added"})
      })
    },
    get_challenge:(req, res) => {
     adminHelper.getChallenge(req.params.id).then((data) => {
       console.log(data)
      res.json(data)
     })
    },
    get_challenges:(req, res) => {
   
      adminHelper.getChallenges().then((data) => {
        console.log("data sent")
        res.json(data)
      })
    },
    edit_challenge:(req, res) => {
      adminHelper.editChallenge(req.body).then(() =>{
        console.log("challenge Edited");
       res.json({message:"Challenge Edited"})
      })
    },
    remove_challenge:(req, res) => {
      adminHelper.removeChallenge(req.params.id).then(() => {
        res.json({message:"Challenge Removed"})
      })
    }, 
    get_users:(req, res) => {
      adminHelper.getUsers().then((userList)=>{
        res.json(userList)
      })

    },
    add_task:(req, res) => {
      console.log(req.body)
      adminHelper.addTask(req.body).then((data) => {
        res.json({message:"Task added for the Challenge"+data.challenge,task:data.task})
      })
    },
    get_task:(req, res) => {
      const { taskId, challengeId} = req.query
      adminHelper.getTask(taskId, challengeId).then((task) => {
        res.json(task)
      })
    },
    add_test_case:(req, res) => {
      console.log(req.body)
      adminHelper.addTestCase(req.body).then((data) => {
        res.json()
      })
    }
    
    ,
    submit_code:(req, res) => {
      console.log(req.body)
      const { script, taskId, language} = req.body
      let correct=0;
      
      adminHelper.getTest(taskId).then(async(test) => {
        console.log(test)
 
    //   const testObj = {
    //     "script" : script,
    //     "language": language==="Python"?"python3":language,
    //     "stdin":"1",
    //     "versionIndex": "2",
    //     "clientId": "28a8fcc5c7b11bf6c2a4d1ee70599a09",
    //     "clientSecret": "23f7b339e21eb4993e49c914a085e9c3f01851a14f35701f2b4888b276339015"
    //  }
    //  axios.post("https://api.jdoodle.com/v1/execute",testObj).then((response) => {
    //    console.log(response.data)
    //  }).catch((err) => {
    //    console.log(err)
    //  })
    
     for( t of test) {
     
    
     const testObj = {
      "script" : script,
      "language": language==="Python"?"python3":language,
      "stdin":t.input,
      "versionIndex": "2",
      "clientId": "28a8fcc5c7b11bf6c2a4d1ee70599a09",
      "clientSecret": "23f7b339e21eb4993e49c914a085e9c3f01851a14f35701f2b4888b276339015"
   }
     
     if(correct ===-1 || correct === 3) {
   
       break;
      }
     
         await axios.post('https://api.jdoodle.com/v1/execute ', testObj).then((response)=> {
       
       if(response.data.output == t.output || response.data.output == t.output+"\n") {
         console.log("it is correct")
         correct++
         if(correct===3)res.json({correct:true,message:"Success, You completed It ",output:"all tests are completed"})
        //  res.json({correct:true,message:"Success, You completed It ",output:response.data.output})
       }
       else {
         console.log("its wrong")
         console.log(response.data)
          correct = -1;
          var testFailed = `Input --->${t.input}
Outupt ---->${t.output}
Your Output ---->${response.data.output}`
console.log(response.data.output)
console.log(response.data.output[0])
          res.json({correct:false,message:"Please try again",output:response.data.output,test:testFailed})
       }
       console.log("last")
      //  res.json(response.data.output)
     })
  
     .catch((err) => {
       console.log(err)
       res.json({correct:false,message:"Internal error",output:"internal server try again"})
     })
     } 
    })
    //  axios.post('https://api.jdoodle.com/v1/execute ', obj).then((response)=> {
    //    console.log(response.data)
    //    res.json(response.data.output)
    //  })
    }


}