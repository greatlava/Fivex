const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: Number,
    required: true
  },
  region: {
    type: String,
    required: true,
    default: '华东一区'
  },
  status: {
    type: String,
    enum: ['empty', 'waiting', 'playing'],
    default: 'empty'
  },
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rules: {
    timeLimit: {
      type: Number,
      default: 30
    },
    quickStart: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

roomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.player1 && this.player2) {
    this.status = 'playing';
  } else if (this.player1 || this.player2) {
    this.status = 'waiting';
  } else {
    this.status = 'empty';
  }
  
  next();
});

roomSchema.index({ roomNumber: 1, region: 1 }, { unique: true });
roomSchema.index({ region: 1, status: 1 });

module.exports = mongoose.model('Room', roomSchema);
