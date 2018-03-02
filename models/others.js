var mongoose = require('mongoose');

var Others = mongoose.model('Others',{
  thought: {
    type: String,
    default: 'Enter Thought',
    trim: true
  },
  logoimg: {
    type: String
  },
  bannerimg: {
    type: String
  },
  shop: {
    type: String
  }
});

module.exports = {
  Others: Others
};
