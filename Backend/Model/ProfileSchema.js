const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  phone: {
    type: String
  },
  profileImage: {
    type: String
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);
