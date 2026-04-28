const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['register', 'login', 'logout', 'action', 'system']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  username: {
    type: String,
    default: null
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: Object,
    default: {}
  },
  ip: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  sessionId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

logSchema.index({ createdAt: -1 });
logSchema.index({ type: 1, createdAt: -1 });
logSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);
