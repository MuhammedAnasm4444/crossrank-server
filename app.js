const express = require('express');
const db = require('./config/connection');
const http = require("http");
const cors = require('cors')
const app = express();
const passport = require('passport');
const socketIo = require('socket.io')
const path = require("path");

const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const collection = require('./config/collection');
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use(express.json());

app.use(express.urlencoded({extended:true}))
db.connect(() => {
    console.log("database connected hai")
})

app.use(passport.initialize())
require("./config/passport")(passport)



// app.use(express.static(path.join(__dirname, "/client/build")));

app.use("/", userRouter);
app.use("/admin",adminRouter);
// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "/client/build/index.html"));
// });

const server = http.createServer(app);
const io = socketIo(server, {  cors: {    origin: "*",    methods: ["GET", "POST"]  }});
app.get('/', (req, res) => {
  console.log("haijfdsjfj")
  res.send({msg:'hello world'})
})

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("getBlogs",async(h) => {
      var blogs = await db.get().collection(collection.BLOGS).find({}).toArray()
      var rev = blogs.reverse()
      io.sockets.emit("getBlogs", rev)

  })
 
  socket.on('getComments',async(data) => {
    console.log('collecting comments')
    console.log(data+"fj")
    const {blog} = socket.handshake.query
    console.log(blog)
    socket.join(blog)
   
    var comments = await db.get().collection(collection.COMMENTS).find({blog:data.blog}).toArray()
    console.log(comments)
    io.in(blog).emit('getComments',comments)
    // socket.emit("getComments",comments)
  })
  
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    
  });
});


server.listen(8000,()=>{ 
    console.log("server started at 8000 hello" )
})
module.exports = app

// "proxy": "http://localhost:8000",