var mongoose = require('mongoose');


var Blogger = mongoose.model('Blogger',{
  firstname: {
    type: String,
    trim: true
  },
  lastname: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  twitterid: {
    type: String,
    trim: true
  },
  instaid: {
    type: String,
    trim: true
  },
  fbid: {
    type: String,
    trim: true
  },
  profileimg: {
    type: String
  },
  username: {
    type: String,
    trim: true
  }

});

module.exports = {
  Blogger: Blogger
};
