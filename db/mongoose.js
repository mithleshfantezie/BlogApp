var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/BlogApp');

// mongoose.connect('mongodb://mithlesh:rockit1466@ds121088.mlab.com:21088/blogapp');
module.exports = {
  mongoose: mongoose
};
