var mongoose = require('mongoose');

var Category = mongoose.model('Category',{
  title: {
    type: String,
    trim: true
  },
  cimage: {
    type: String
  }
});

module.exports = {
  Category: Category
};
