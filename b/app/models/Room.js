const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let roomSchema = new Schema({
  roomId: {
    type: String,
    index: true,
    unique: true,
    default: ''
  },
  roomName: {
    type: String,
    default: ''
  },
  creator: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },

  createdOn: {
    type: Date,
    default: Date.now
  },
  modifiedOn: {
    type: Date,
    default: Date.now
  }
})

mongoose.model('Room', roomSchema);