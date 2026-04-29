const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  sort: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

regionSchema.index({ sort: 1 });
regionSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('Region', regionSchema);
