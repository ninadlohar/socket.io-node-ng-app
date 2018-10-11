const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const check = require('../libs/checkLib')
const sendMail = require('../libs/sendEmail')
const roomModel = mongoose.model('Room')
const ChatModel = mongoose.model('Chat')
const UserModel = mongoose.model('User')

let getChatsForGroup = (req, res) => {
  let validateParams = () => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(req.query.receiverId)) {
        let apiResponse = response.generate(true, 'parameters missing for receiverId.', 403, null)
        reject(apiResponse)
      } else {
        resolve()
      }
    })
  }

  let findChats = () => {
    return new Promise((resolve, reject) => {
      let findQuery = {
        'receiverId': req.query.receiverId
      }
      ChatModel.find(findQuery)
        .select('-_id -__v ')
        .sort('-createdOn')
        .skip(parseInt(req.query.skip) || 0)
        .lean()
        .limit(10)
        .exec((err, result) => {
          if (err) {
            let apiResponse = response.generate(true, `failed to find chats`, 500, null)
            reject(apiResponse)
          } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'no Chats Found', 404, null)
            reject(apiResponse)
          } else {
            resolve(result)
          }
        })
    })
  }

  validateParams()
    .then(findChats)
    .then((result) => {
      let apiResponse = response.generate(false, 'all chats found', 200, result)
      res.send(apiResponse)
    })
    .catch((error) => {
      res.send(error)
    })
}

let createGroup = (req, res) => {
  let RoomCreation = () => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(req.body.name) || check.isEmpty(req.body.creator)) {
        let apiResponse = response.generate(true, 'parameter required for admin name', 403, null)
        reject(apiResponse)
      } else {
        let newRoom = new roomModel({
          roomId: shortid.generate(),
          roomName: req.body.name,
          creator: req.body.creator,
          createdOn: time.now(),
          ModifiedOn: time.now()
        });
        newRoom.save((err, newRoom) => {
          if (err) {
            console.log(err)
            let apiResponse = response.generate(true, 'Failed to save group/room', 500, null)
            reject(apiResponse)
          } else {
            let newRoomObj = newRoom.toObject();
            newRoomObj.creatorId = req.body.creatorId;
            resolve(newRoomObj)
          }
        })
      }
    });
  }

  RoomCreation()
    .then((resolve) => {
      let apiResponse = response.generate(false, 'Chat Room is created', 200, resolve)
      res.send(apiResponse)
    })
    .catch((err) => {
      res.send(err);
    })
}

let getChatGroup = (req, res) => {
  roomModel.find({
      'active': true
    })
    .select('-__v -_id')
    .lean()
    .exec((err, result) => {
      if (err) {
        console.log(err)
        let apiResponse = response.generate(true, 'failed to find active group', 500, null)
        res.send(apiResponse)
      } else if (check.isEmpty(result)) {
        let apiResponse = response.generate(true, 'no active chat groups found', 404, null)
        res.send(apiResponse)
      } else {
        let apiResponse = response.generate(false, 'All Group Chats Details Found', 200, result)
        res.send(apiResponse)
      }
    })
}

let shareLink = (req, res) => {
  if (check.isEmpty(req.body.email)) {
    let apiResponse = response.generate(true, 'email is required', 403, null)
    res.send(apiResponse)
  } else {
    UserModel.find({
      'email': req.body.email
    }, (err, result) => {
      if (err) {
        sendMail.sendEmail(req.body.email, `<a href='http://localhost:4200/group/${req.body.roomId}/${req.body.roomName}'>Click here</a> to Join!`)
        let apiResponse = response.generate(false, 'email sent', 200, 'email sent')
        res.send(apiResponse)
      } else if (check.isEmpty(result)) {
        sendMail.sendEmail(req.body.email, `<a href='http://localhost:4200/group/${req.body.roomId}/${req.body.roomName}'>Click here</a> to Join!`)
        let apiResponse = response.generate(false, 'email sent', 200, 'email sent')
        res.send(apiResponse)
      } else {
        sendMail.sendEmail(req.body.email, `<a href='http://localhost:4200/group/${req.body.roomId}/${req.body.roomName}'>Click here</a> to Join!`)
        let apiResponse = response.generate(false, 'email sent', 200, 'email sent')
        res.send(apiResponse)
      }
    })
  }
}

let editGroup = (req, res) => {
  if (check.isEmpty(req.params.roomId)) {
    let apiResponse = response.generate(true, 'room id is required', 403, null)
    res.send(apiResponse)
  } else {

    roomModel.findOne({
      'roomId': req.params.roomId
    }).exec((err, result) => {
      if (err) {
        let apiResponse = response.generate(true, "failed to find room", 500, null);
        res.send(apiResponse)
      } else if (check.isEmpty(result)) {
        let apiResponse = response.generate(true, "no rooms found", 404, null);
        res.send(apiResponse)
      } else {
        result.roomName = req.body.name;
        result.save((error, resul) => {
          if (error) {
            let apiResponse = response.generate(true, "failed to save changes for edit room", 500, null);
            res.send(apiResponse)
          } else {
            let apiResponse = response.generate(false, "Updated successfully!", 200, resul);
            res.send(apiResponse)
          }
        });
      }
    });
  }
}

let deleteGroup = (req, res) => {
  if (check.isEmpty(req.params.roomId)) {
    let apiResponse = response.generate(true, 'room id is required', 403, null)
    res.send(apiResponse)
  } else {
    roomModel.remove({
        'roomId': req.params.roomId
      })
      .exec((err, result) => {
        if (err) {
          let apiResponse = response.generate(true, 'failed to find rooms for deletiob', 500, null)
          res.send(apiResponse)
        } else if (result.n == 0) {
          let apiResponse = response.generate(true, 'No Room Found', 404, null)
          res.send(apiResponse)
        } else {
          let apiResponse = response.generate(false, 'Deleted the Room successfully', 200, null)
          res.send(apiResponse)
        }
      });
  }
}


let closeGroup = (req, res) => {
  let validateParams = () => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(req.params.roomId)) {
        let apiResponse = response.generate(true, 'parameter missing.', 403, null)
        reject(apiResponse)
      } else {
        resolve()
      }
    })
  }

  let modifyChatRoom = () => {
    return new Promise((resolve, reject) => {
      let findQuery = {
        roomId: req.params.roomId
      }
      let updateQuery = {
        active: false
      }
      roomModel.update(findQuery, updateQuery, {
          multi: true
        })
        .exec((err, result) => {
          if (err) {
            let apiResponse = response.generate(true, 'failed to mofidy chat room', 500, null)
            reject(apiResponse)
          } else if (result.n === 0) {
            let apiResponse = response.generate(true, 'no rooms found for modifcation', 404, null)
            reject(apiResponse)
          } else {
            resolve(result)
          }
        })
    })
  }

  validateParams()
    .then(modifyChatRoom)
    .then((result) => {
      let apiResponse = response.generate(false, 'chat room is closed', 200, null)
      res.send(apiResponse)
    })
    .catch((error) => {
      res.send('something went wrong')
    })
}


module.exports = {
  getChatsForGroup: getChatsForGroup,
  createGroup: createGroup,
  getChatGroup: getChatGroup,
  shareLink: shareLink,
  editGroup: editGroup,
  deleteGroup: deleteGroup,
  closeGroup: closeGroup
}