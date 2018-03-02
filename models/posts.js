var mongoose = require('mongoose');

var Posts = mongoose.model('Posts',{
  head: {
    type: String,
    trim: true
  },
  body: {
    type: String,
    trim: true
  },
  category: {
    type: String
  },
  author: {
    type: String,
    trim: true
  },
  likes:{
    type: Number,
    default: 0
  },
  views:{
    type: Number,
    default: 0
  },
  date: {
    type: String
  },
  img: {
    type: String
  },
  imagename: {
    type: String
  },
  comments: {
  type: Array
  }

});




module.exports = {
  Posts: Posts
};
