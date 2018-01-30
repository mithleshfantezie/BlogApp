var express = require('express');
var router = express.Router();
var flash = require('connect-flash');
var session = require('express-session');



var multer  = require('multer')

var dust = require('dustjs-helpers');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads')
  },
  filename: function (req, file, cb) {
    var s = file.mimetype;
    var i = s.indexOf('/');
    var partOne = s.slice(0, i).trim();
    var partTwo = s.slice(i + 1, s.length).trim();

    cb(null, Date.now() + '.' +partTwo)
  }
})

var upload = multer({ storage: storage });

var moment = require('moment');
var {ObjectID} = require('mongodb');
var {mongoose} = require('./../db/mongoose');
var {Posts} = require('./../models/posts');

/* GET home page. */
router.get('/', function(req, res, next) {

Posts.find().then((posts)=>{
  res.render('index', {
    title: 'Express',
    posts
 });

},(e)=>{
  res.status(400).send(e);
});



});


router.get('/post/:id',(req,res)=>{
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
  res.status(404).send();
}



Posts.findById(id).then((posts)=>{
  if(!posts){
    return res.status(404).send();
  }
Posts.find().limit(3).then((allposts)=>{
  if(!posts){
    return res.status(404).send();
  }

  res.render('post',{
    posts,
    allposts
  });
},(e)=>{
  res.status(404).send();
});


},(e)=>{
  res.status(404).send();
});

});




router.post('/add',upload.single('mainimage'),function(req,res,next){
  var head=  req.body.head;
  var body= req.body.bodyck;
  var category=  req.body.category;
  var author= req.body.author;
  var likes= 0;
  var views= 0;
  var unformattedDate = new Date();
  var date = moment(unformattedDate).format('MMMM Do YYYY, h:mm:ss a');




  if(req.file){
    var mainimage = req.file.filename;

  }else {
    var mainimage = 'noimage.jpg';

  }

req.checkBody("head", "Enter a Title .").trim().notEmpty();
// req.checkBody("body", 'Enter the Body Part.').trim().notEmpty();

req.checkBody("author", "Enter A Author Name.").trim().notEmpty();

var errors = req.validationErrors();







  if (!errors) {
    var posts = new Posts({
      head: head,
      body: body,
      category: category,
      author: author,
      likes: likes,
      views: views,
      date: date,
      mainimage: mainimage
    });

    posts.save().then((doc)=>{
         req.flash('success', 'New Post Added...!');

         res.redirect('/');
    },(e)=>{
    res.status(400).send(e);
    });


  } else {
    res.render('index', {
      title: 'Express',
      errors
    });
  }



});

router.post('/post/:id/comment',(req,res)=>{
var id = req.params.id;
if(!ObjectID.isValid(id)){
res.status(404).send();
}
var name= req.body.name;
var email= req.body.email;
var comment= req.body.comment;
var unformattedDate = new Date();
var commentDate = moment(unformattedDate).format('MMMM Do YYYY, h:mm:ss a');


var cbody = {
  "name": name,
  "email": email,
  "comment": comment,
  "commentDate": commentDate
};

Posts.findByIdAndUpdate(id, {$push: {
  comments: cbody
}}, {new: true}).then((comment)=>{
    if(!comment){
      return res.status(404).send();
    }


  }).catch((e)=>{
    res.status(400).send();
  });
  res.redirect(`/post/${id}`);
});

router.get('/:category',(req,res)=>{
  var category= req.params.category;
  Posts.find({category: category}).then((posts)=>{
    res.render('index', {
      title: 'Express',
      posts
   });

  },(e)=>{
    res.status(400).send(e);
  });
});

router.get('/edit/:id',(req,res)=>{
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
    res.status(400).send();
  }
Posts.findById(id).then((posts)=>{
  if(!posts){
    return res.status(400).send();
  }
  res.render('edit',{
    posts
  });

},(e)=>{
  res.status(404).send();
});
});

router.post('/edited/:id',upload.single('mainimage'),(req,res)=>{

  var id = req.params.id;
  var head=  req.body.head;
  var body= req.body.bodyck;
  var category=  req.body.category;
  var author= req.body.author;

  if(!ObjectID.isValid(id)){
    res.status(400).send();
  }


  if(req.file){
    var mainimage = req.file.filename;

  }else {
    var mainimage = 'noimage.jpg';

  }



  Posts.findByIdAndUpdate(id,{ $set:
    {
    head: head,
    body: body,
    category: category,
    author: author,
    mainimage: mainimage
    }
  }, {new: true}).then((posts)=>{
      if(!posts){

        return res.status(404).send();
      }


    }).catch((e)=>{
      res.status(400).send();
    });
    res.redirect('/');
});

router.get('/delete/:id',(req,res)=> {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    res.status(404).send();

  }
  Posts.findByIdAndRemove(id).then((posts)=>{
      if(!posts){
        return res.status(404).send();
      }


    }).catch((e)=>{
      res.status(400).send();
    });
    req.flash('success','Post has been Deleted.');
    res.redirect('/');
});

module.exports = router;
