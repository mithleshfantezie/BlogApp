var mongoose = require('mongoose');

var Category = mongoose.model('Category',{
  title: {
    type: String,
    trim: true
  },
  cimg: {
    type: String
  },
  imagename: {
    type: String
  }
});

module.exports = {
  Category: Category
};
