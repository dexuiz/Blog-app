var express   =require("express"),
    mongoose  =require("mongoose"),
    bodyParser=require("body-parser"),
    app       =express();

var methodOverride  = require("method-override");
var sanitizer =require("express-sanitizer");

mongoose.connect("mongodb://dexuiz:deval1997@ds137090.mlab.com:37090/blog-app");
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(sanitizer());
var blogSchema = new mongoose.Schema({
  name:String,
  image:String,
  body:String,
  created:{type:Date,default:Date.now}
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
  res.redirect("/blogs");
})


app.get("/blogs",function(req,res){
   blog.find({},function(err,blogs){
      if(err){
        console.log("error took place",err);
      }else {

        res.render("index",{blogs:blogs});
      }
  })
});

app.get("/blogs/new",function(req,res){
  res.render("new");
})

app.post("/blogs",function(req,res){
  req.body.blog.body=req.sanitize(req.body.blog.body);
  blog.create(req.body.blog ,function(err,post){
    if(err){
      console.log("error has taken place",err);
    }else {
      console.log(post);
      res.redirect("/blogs");
    }
  });
});

app.get("/blogs/:id",function(req,res){
  blog.findById(req.params.id,function(err,blog){
    if(err)
      console.log("error has occured",err);
    else {
      //console.log(blog);
      res.render("show",{blog:blog});
    }
  });
});

app.get("/blogs/:id/edit",function(req,res){
  blog.findById(req.params.id,function(err,blog){
    if(err)
      console.log("error has occured",err);
    else {
      //console.log(blog);
      res.render("edit",{blog:blog});
    }
  });
});

app.put("/blogs/:id",function(req,res){
  req.body.blog.body = req.sanitize(req.body.blog);
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
      res.redirect("/blogs")
    }
  })
})


app.listen(port,function(){
  console.log("server is running on port 3000")
})
