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


var Promise = require('bluebird');
var GoogleCloudStorage = Promise.promisifyAll(require('@google-cloud/storage'));

var storage = GoogleCloudStorage({
projectId: 'mithlexh001',
keyFilename: 'privatekey.json'
});

var BUCKET_NAME = 'mithlexh001.appspot.com';
// https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/0.39.0/storage/bucket
var myBucket = storage.bucket(BUCKET_NAME);

var moment = require('moment');
var {ObjectID} = require('mongodb');
var {mongoose} = require('./../db/mongoose');
var {Posts} = require('./../models/posts');
var {Category} = require('./../models/category');
var {Blogger} = require('./../models/blogger');
var {Others} = require('./../models/others');

/* GET home page. */
router.get('/', function(req, res, next) {

Posts.find().then((posts)=>{
  Category.find().then((category)=>{
    Blogger.find().then((blogger)=>{
      Others.find().then((others)=>{
      res.render('index', {
        title: 'Blog | Page',
        posts,
        category,
        blogger,
        others
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

//Others

router.post('/add/thought',(req,res)=>{
  var thought = req.body.thought;

  req.checkBody('thought','Please Enter the Text.').trim().notEmpty();

  var errors= req.validationErrors();

  if(!errors){
    Others.update({},{$set: {
      thought: thought
    }}, {new: true}).then((upload)=>{
         req.flash('success', 'Thought has been added.');
         res.redirect('/dashboard/others');
    },(e)=>{
    res.status(400).send(e);
    });
  }else{
    res.render('others', {
      title: 'Dashboad | Others',
      errors
    });
  }
});

router.post('/add/logo',upload.single('logo'),(req,res)=>{
  if(req.file){
    var logo = req.file.filename;

  }else {
    var logo = 'noimage.jpg';

  }
  let localFileLocation = `./public/images/uploads/${logo}`;
  myBucket.uploadAsync(localFileLocation, { public: true })
    .then(file => {
      // file saved
      console.log('Done');
    });

    var url = `https://storage.googleapis.com/${BUCKET_NAME}/${logo}`




    Others.update({},{$set: {
      logoimg: url,
      imagename: logo
    }}, {new: true}).then((logo)=>{
         req.flash('success', 'Logo has been added.');
         res.redirect('/dashboard/others');
    },(e)=>{
    res.status(400).send(e);
    });

});

router.post('/add/banner',upload.single('banner'),(req,res)=>{
  if(req.file){
    var banner = req.file.filename;

  }else {
    var banner = 'noimage.jpg';

  }

  let localFileLocation = `./public/images/uploads/${banner}`;
  myBucket.uploadAsync(localFileLocation, { public: true })
    .then(file => {
      // file saved
      console.log('Done');
    });

    var url = `https://storage.googleapis.com/${BUCKET_NAME}/${banner}`


    Others.update({},{$set: {
      bannerimg: url,
      imagename: banner
    }}, {new: true}).then((data)=>{
         req.flash('success', 'Banner has been added.');
         res.redirect('/dashboard/others');
    },(e)=>{
    res.status(400).send(e);
    });

});

router.post('/shop',(req,res)=>{
  var shop = req.body.shop;

  req.checkBody('shop','Please choose from the list.').notEmpty();

  var errors= req.validationErrors();

  if(!errors){
    Others.update({},{$set: {
      shop: shop
    }}, {new: true}).then((upload)=>{
         req.flash('success', 'Added Successfully.');
         res.redirect('/dashboard/others');
    },(e)=>{
    res.status(400).send(e);
    });
  }else{
    res.render('others', {
      title: 'Dashboad | Others',
      errors
    });
  }
});

// Others............

router.get('/dashboard/profile',ensureAuthenticated,(req,res)=>{
  Blogger.find().then((blogger)=>{
    res.render('profile',{
      title: 'Dashboad | Profile',
      blogger
    });
  },(e)=>{
    res.status(400).send(e);
  });

});

router.get('/dashboard/others',ensureAuthenticated,(req,res)=>{
  Blogger.find().then((blogger)=>{
  res.render('others',{
    title: 'Dashboad | Others',
    blogger
  });
},(e)=>{
  res.status(400).send(e);
});
});

router.get('/dashboard/addpost',ensureAuthenticated,(req,res)=>{


  Posts.find().then((posts)=>{
    Category.find().then((categorys)=>{
      Blogger.find().then((blogger)=>{
        res.render('addpost',{
          posts,
          categorys,
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

router.get('/dashboard/category',ensureAuthenticated,(req,res)=>{
  Category.find().then((categories)=>{
      Blogger.find().then((blogger)=>{
      res.render('category',{
        title: 'Dashboad | Category',
        categories,
        blogger
      });
    },(e)=>{
      res.status(400).send(e);
    });

  },(e)=>{
    res.status(404).send(e);
  });


});

function ensureAuthenticated(req, res , next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/users/signin');
}

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
          Others.find().then((others)=>{
          if(!posts){
            return res.status(404).send();
          }
          res.render('post', {
            title: 'Single | Post',
            posts,
            allposts,
            blogger,
            category,
            others
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

  var file = myBucket.file('pic.jpg')
file.existsAsync()
  .then(exists => {
    if (exists) {
      // file exists in bucket
    }
  })
  .catch(err => {
     return err
  })


// upload file to bucket
// https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/0.39.0/storage/bucket?method=upload






  req.checkBody("firstname", "Enter the FirstName .").trim().notEmpty();
  req.checkBody("lastname", "Enter the LastName .").trim().notEmpty();
  req.checkBody("email", "Enter the email address .").trim().notEmpty();
  req.checkBody("email", "Enter the valid email address .").isEmail();

  req.checkBody("fbid", "Enter your Facebook ID Url .").trim().notEmpty();
  req.checkBody("instaid", "Enter your Instagram ID Url .").trim().notEmpty();
  req.checkBody("twitterid", "Enter your Twitter ID Url .").trim().notEmpty();


  var errors = req.validationErrors();





if(!errors){
  let localFileLocation = `./public/images/uploads/${profileimg}`;
  myBucket.uploadAsync(localFileLocation, { public: true })
    .then(file => {
      // file saved
      console.log('Done');
    });

    var url = `https://storage.googleapis.com/${BUCKET_NAME}/${profileimg}`


Blogger.update({},{$set: {
  firstname: firstname,
  lastname: lastname,
  username: username,
  email: email,
  fbid: fbid,
  instaid: instaid,
  twitterid: twitterid,
  profileimage: url,
  imagename: profileimg
  }}, {new: true}).then((upload)=>{
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
      let localFileLocation = `./public/images/uploads/${cimage}`;
      myBucket.uploadAsync(localFileLocation, { public: true })
        .then(file => {
          // file saved
          console.log('Done');
        });

        var url = `https://storage.googleapis.com/${BUCKET_NAME}/${cimage}`



  var category = new Category({
    title: title,
    cimg: url,
    imagename: cimage
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

let localFileLocation = `./public/images/uploads/${mainimage}`;
myBucket.uploadAsync(localFileLocation, { public: true })
  .then(file => {
    // file saved
    console.log('Done');
  });

  var url = `https://storage.googleapis.com/${BUCKET_NAME}/${mainimage}`





  if (!errors) {
    var posts = new Posts({
      head: head,
      body: body,
      category: category,
      author: author,
      likes: likes,
      views: views,
      date: date,
      img: url,
      imagename: mainimage
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
  var Categorys= req.params.category;

    Posts.find({category: Categorys}).then((posts)=>{
      Category.find().then((category)=>{
        Blogger.find().then((blogger)=>{
        Others.find().then((others)=>{
          res.render('search', {
            title: `Filter | ${Categorys}`,
            posts,
            category,
            blogger,
            others
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

router.post('/edit/post/:id',upload.single('mmainimage'),(req,res)=>{

  var id = req.params.id;
  var head=  req.body.mhead;
  var body= req.body.mbodyck;
  var category=  req.body.mcategory;
  var author= req.body.mauthor;

  if(!ObjectID.isValid(id)){
    res.status(400).send();
  }


  if(req.file){
    var mainimage = req.file.filename;

  }else {
    var mainimage = 'noimage.jpg';

  }
  req.checkBody("mhead", "Enter a Title .").trim().notEmpty();
  // req.checkBody("body", 'Enter the Body Part.').trim().notEmpty();
  req.checkBody("mcategory", "Select a valid Category.").trim().notEmpty();
  req.checkBody("mauthor", "Select Author Name.").trim().notEmpty();

  var errors = req.validationErrors();

  let localFileLocation = `./public/images/uploads/${mainimage}`;
  myBucket.uploadAsync(localFileLocation, { public: true })
    .then(file => {
      // file saved
      console.log('Done');
    });

    var url = `https://storage.googleapis.com/${BUCKET_NAME}/${mainimage}`





    if (!errors) {

  Posts.findByIdAndUpdate(id,{ $set:
    {
    head: head,
    body: body,
    category: category,
    author: author,
    mainimg: url,
    imagename: mainimage
    }
  }, {new: true}).then((posts)=>{
      if(!posts){

        return res.status(404).send();
      }
req.flash('success','Post has been Modified.');
res.redirect('/dashboard/addpost');
    }).catch((e)=>{
      res.status(400).send();
    });
  } else {
    Posts.find().then((posts)=>{
      Category.find().then((categorys)=>{
        Blogger.find().then((blogger)=>{
          res.render('addpost',{
            title: 'Dashboad | Add Post',
            posts,
            categorys,
            blogger,
            errors
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


  }

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

      const filename = `${posts.imagename}`;

      // Deletes the file from the bucket
    myBucket
        .file(filename)
        .delete()
        .then(() => {
          console.log(`${filename} deleted.`);
        })
        .catch(err => {
          console.error('ERROR:', err);
        });

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
      // const bucketName = 'Name of a bucket, e.g. my-bucket';
      const filename = `${category.imagename}`;

      // Deletes the file from the bucket
myBucket
        .file(filename)
        .delete()
        .then(() => {
          console.log(`${filename} deleted.`);
        })
        .catch(err => {
          console.error('ERROR:', err);
        });

    }).catch((e)=>{
      res.status(400).send();
    });
    req.flash('success','Category has been Deleted.');
    res.redirect('/dashboard/category');
});

router.post('/edit/category/:id',upload.single('cimagem'),(req,res)=>{
  var id = req.params.id;
  var title= req.body.mtitle;

  if(req.file){
    var cimage = req.file.filename;

  }else {
    var cimage = 'noimage.jpg';

  }

  req.checkBody("mtitle", "Enter a Title .").trim().notEmpty();


  var errors = req.validationErrors();

  let localFileLocation = `./public/images/uploads/${cimage}`;
  myBucket.uploadAsync(localFileLocation, { public: true })
    .then(file => {
      // file saved
      console.log('Done');
    });

    var url = `https://storage.googleapis.com/${BUCKET_NAME}/${cimage}`





    if (!errors) {

Category.findByIdAndUpdate(id,{ $set: {
  title: title,
  cimg: url,
  imagename: cimage

}
}, {new: true}).then((posts)=>{
    if(!posts){

      return res.status(404).send();
    }
    req.flash('success','Category has been Modified.');
    res.redirect('/dashboard/category');

  }).catch((e)=>{
    res.status(400).send();
  });
} else {
  Category.find().then((categories)=>{
      res.render('category',{
        title: 'Dashboard | Category',
        categories,
        errors
      });
  },(e)=>{
    res.status(404).send(e);
  });


  }



});

module.exports = router;
