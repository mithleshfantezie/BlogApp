var mongoose = require('mongoose');

var Others = mongoose.model('Others',{
  thought: {
    type: String,
    default: 'Enter Thought',
    trim: true
  },
  logo: {
    type: String
  },
  banner: {
    type: String
  },
  shop: {
    type: String
  }
});

module.exports = {
  Others: Others
};
