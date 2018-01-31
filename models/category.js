var mongoose = require('mongoose');

var Category = mongoose.model('Category',{
  title: {
    type: String,
    trime: true
  },
  cimage: {
    type: String
  }
});

module.exports = {
  Category: Category
};
