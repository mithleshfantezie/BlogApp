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
var {Category} = require('./../models/category');
var {Blogger} = require('./../models/blogger');

/* GET home page. */
router.get('/', function(req, res, next) {

Posts.find().then((posts)=>{
  Category.find().then((category)=>{
    Blogger.find().then((blogger)=>{
      res.render('index', {
        title: 'Blog | Page',
        posts,
        category,
        blogger
      });
    },(e)=>{
      res.status(400).send(e);
    });

  },(e)=>{
    res.status(400).send(e);
  });




},(e)=>{
  res.status(400).send(e);
});


});




router.get('/dashboard/profile',(req,res)=>{
  res.render('profile');
});

router.get('/dashboard/addpost',(req,res)=>{


  Posts.find().then((posts)=>{
    Category.find().then((category)=>{
      Blogger.find().then((blogger)=>{
        res.render('addpost',{
          posts,
          category,
          blogger
        });
      },(e)=>{
        res.status(400).send(e);
      });

    },(e)=>{
      res.status(400).send(e);
    });




  },(e)=>{
    res.status(400).send(e);
  });

});

router.get('/dashboard/category',(req,res)=>{
  Category.find().then((categories)=>{
      res.render('category',{
        categories
      });
  },(e)=>{
    res.status(404).send(e);
  });


});

router.get('/post/:id',(req,res)=>{
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
  res.status(404).send();
}

Posts.findByIdAndUpdate(id,{$inc : {
  views: 1
}},{new: true}).then((uviews)=>{
  if(!uviews){
    return res.status(404).send();
  }
},(e)=>{
  res.status(404).send();
});





Posts.findById(id).then((posts)=>{
    Blogger.find().then((blogger)=>{
      Posts.find().limit(3).then((allposts)=>{
        Category.find().then((category)=>{
          if(!posts){
            return res.status(404).send();
          }
          res.render('post', {
            title: 'Single | Post',
            posts,
            allposts,
            blogger,
            category
          });

        },(e)=>{
          res.status(400).send(e);
        });




    },(e)=>{
      res.status(400).send(e);
    });

  },(e)=>{
    res.status(400).send(e);
  });


},(e)=>{
  res.status(400).send(e);
});


});

router.post('/add/profileinformation',upload.single('profileimg'),(req,res)=>{
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var username = req.body.username;
  var email = req.body.email;

  var fbid = req.body.fbid;
  var instaid = req.body.instaid;
  var twitterid = req.body.twitterid;

  if(req.file){
    var profileimg = req.file.filename;

  }else {
    var profileimg = 'noimage.jpg';

  }
  req.checkBody("firstname", "Enter the FirstName .").trim().notEmpty();
  req.checkBody("lastname", "Enter the LastName .").trim().notEmpty();
  req.checkBody("email", "Enter the email address .").trim().notEmpty();
  req.checkBody("email", "Enter the valid email address .").isEmail();

  req.checkBody("fbid", "Enter your Facebook ID Url .").trim().notEmpty();
  req.checkBody("instaid", "Enter your Instagram ID Url .").trim().notEmpty();
  req.checkBody("twitterid", "Enter your Twitter ID Url .").trim().notEmpty();


  var errors = req.validationErrors();

if(!errors){
  var blogger = new Blogger({
    firstname: firstname,
    lastname: lastname,
    username: username,
    email: email,
    fbid: fbid,
    instaid: instaid,
    twitterid: twitterid,
    profileimg: profileimg

  });

  blogger.save().then((doc)=>{
       req.flash('success', 'Profile Information has been added.');
       res.redirect('/dashboard/profile');
  },(e)=>{
  res.status(400).send(e);
  });
}else{
  res.render('profile', {
    title: 'Dashboad | Profile',
    errors
  });
}

});

router.post('/add/category',upload.single('cimage'),(req,res)=>{
  var title= req.body.title;

  if(req.file){
    var cimage = req.file.filename;

  }else {
    var cimage = 'noimage.jpg';

  }
  req.checkBody("title", "Enter a Title .").trim().notEmpty();


  var errors = req.validationErrors();







    if (!errors) {

  var category = new Category({
    title: title,
    cimage: cimage
  });

  category.save().then((doc)=>{
       req.flash('success', 'category has been added!');
       res.redirect('/dashboard/category');
  },(e)=>{
  res.status(400).send(e);
  });
}
  else {
    res.render('category', {
      title: 'Dashboard | Category',
      errors
    });
  }

});


router.post('/add/post',upload.single('mainimage'),function(req,res,next){
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
req.checkBody("category", "Select a valid Category.").trim().notEmpty();
req.checkBody("author", "Select Author Name.").trim().notEmpty();

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

         res.redirect('/dashboard/addpost');
    },(e)=>{
    res.status(400).send(e);
    });


  } else {
    res.render('addpost', {
      title: 'Dashboad | Add Post',
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
      title: 'Comment',
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

router.get('/delete/post/:id',(req,res)=> {
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
    res.redirect('/dashboard/addpost');
});

router.get('/delete/category/:id',(req,res)=>{
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    res.status(404).send();

  }
  Category.findByIdAndRemove(id).then((category)=>{
      if(!category){
        return res.status(404).send();
      }


    }).catch((e)=>{
      res.status(400).send();
    });
    req.flash('success','Category has been Deleted.');
    res.redirect('/dashboard/category');
});

module.exports = router;
