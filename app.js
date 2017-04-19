var express   =require("express"),
    mongoose  =require("mongoose"),
    bodyParser=require("body-parser"),
    app       =express();

var methodOverride  = require("method-override");
var sanitizer =require("express-sanitizer");
var current;

// mongoose.connect("mongodb://dexuiz:deval1997@ds137090.mlab.com:37090/blog-app");
mongoose.connect("mongodb://localhost/blogapp2");
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(sanitizer());
// app.use(function(req,res,next){
//   res.locals.current=req.user;
//   next();
// });

var userSchema =  new mongoose.Schema({
  username:String,
  password:String,
});
var user = mongoose.model("user",userSchema);

var blogSchema = new mongoose.Schema({
  name:String,
  image:String,
  body:String,
  created:{type:Date,default:Date.now},
  author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  }
});

var blog= mongoose.model("blog",blogSchema);
var port = process.env.PORT || 3000;
// blog.create({
//   name:"test-blog",
//   image:"http://panacheschool.com/wp-content/uploads/2015/04/photography.jpg",
//   body:"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
// },function(err,blog){
//   if(err){
//     console.log("errors took place");
//   }else {
//     console.log(blog);
//   }
// });


app.get("/",function(req,res){
  res.render("home",{curr:null});
});

app.get("/signup",function(req,res){
  res.render("signup",{curr:null});
});

app.post("/signup",function(req,res){
  user.create(req.body.user,function(err,data){
    if (err) {
      console.log("error took place while creation of user");
    }else {
      console.log(data);
      res.redirect("/login");
    }
  });
});

app.get("/login",function(req,res){
  res.render("login",{curr:null});
});


app.post("/login",function(req,res){
  user.find({username:req.body.user.username,password:req.body.user.password},function(err,user){
    if(err || user==[]){
      console.log("credentials wrong/user does not exist");
      res.send("wrong password or user does not exist");
    }else {
      if(user==[] || user.length>=1)
        {console.log(user);
        current=user;
        res.redirect("/blogs");}
        else {
          console.log("credentials wrong/user does not exist");
          res.send("wrong password or user does not exist");
        }
    }
  });
});


app.get("/blogs",isLogged,function(req,res){
   blog.find({},function(err,blogs){
      if(err){
        console.log("error took place",err);
      }else {
        res.render("index",{blogs:blogs,curr:current[0]});
      }
  });
});


app.get("/blogs/new",isLogged,function(req,res){
  res.render("new",{curr:current[0]});
});


app.post("/blogs",function(req,res){
  req.body.blog.body=req.sanitize(req.body.blog.body);
  blog.create({name:req.body.blog.name,image:req.body.blog.image,body:req.body.blog.body,author:current[0]},function(err,post){
    if(err){
      console.log("error has taken place",err);
    }else {
      console.log(post);
      res.redirect("/blogs");
    }
  });
});


app.get("/blogs/:id",isLogged,function(req,res){
  blog.findById(req.params.id,function(err,blog){
    if(err)
      console.log("error has occured",err);
    else {
      //console.log(blog);
      console.log(blog,current[0]);
      res.render("show",{blog:blog,curr:current[0]});
    }
  });
});


app.get("/blogs/:id/edit",function(req,res){
  blog.findById(req.params.id,function(err,blog){
    if(err)
      console.log("error has occured",err);
    else {
      //console.log(blog);
      res.render("edit",{blog:blog,curr:current[0]});
    }
  });
});

app.put("/blogs/:id",function(req,res){
  blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,data){
    if(err){
      console.log("error took place",err);
    }else {
      res.redirect("/blogs/"+req.params.id);
    }
  });
});

app.delete("/blogs/:id",function(req,res){
  blog.findByIdAndRemove(req.params.id,function(err){
    if(err){
      console.log("error took place");
    }else {
      res.redirect("/blogs");
    }
  });
});

app.get("/logout",function(req,res){
  current=null;
  res.redirect("/");
});

function isLogged(req,res,next){
  if(current)
    return next();
  console.log("please login first");
  res.redirect("/login");
}


function isVerified(req,res,next){
  if(current){
    blog.findById(req.params.id,function(err,blog){
      if(err){
        console.log("error took place",err);
      }else {
        if(blog.author.id.equals(current._id))
          next();
        else{
          console.log("you dont have authority to do this");
          res.redirect("back");}
        }
      });
    }else {
      console.log("error took place");
      res.redirect("back");
    }
  }


app.listen(port,function(){
  console.log("server is running on port 3000");
});
