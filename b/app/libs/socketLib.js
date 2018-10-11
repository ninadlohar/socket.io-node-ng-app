const socketio = require('socket.io');
const mongoose = require('mongoose');
const shortid = require('shortid');
const _ = require('lodash');

const events = require('events');
const eventEmitter = new events.EventEmitter();
const tokenLib = require("./tokenLib.js");

const ChatModel = mongoose.model('Chat');
/* main function  */
let setServer = (server) => {

  let allOnlineUsers = []
  let onlineUsers = []

  let io = socketio.listen(server);

  let myIo = io.of('/')

  myIo.on('connection', (socket) => {
    socket.on('setUser', (authToken) => {
      console.log("set-user called" + authToken);
      tokenLib.verifyClaimWithoutSecret(authToken, (err, user) => {
        if (err) {
          socket.emit('auth-error', {
            status: 500,
            error: 'Please provide correct auth token'
          })
        } else {
          console.log("user is verified..setting details");
          let currentUser = user.data;
          socket.userId = currentUser.userId
          let fullName = `${currentUser.firstName} ${currentUser.lastName}`
          let userObj = {
            userId: currentUser.userId,
            fullName: fullName
          }
          onlineUsers.push(userObj)
          allOnlineUsers = _.uniqWith(onlineUsers, _.isEqual);
          console.log(allOnlineUsers);
          socket.room = 'edChat'
          socket.join(socket.room)
          myIo.emit('online-user-list', allOnlineUsers);
        }
      });
    });


    socket.on('disconnect', () => {
      console.log("user is disconnected");
      var removeIndex = allOnlineUsers.map(function (user) {
        return user.userId;
      }).indexOf(socket.userId);
      allOnlineUsers.splice(removeIndex, 1)
      console.log(allOnlineUsers)

      myIo.emit('online-user-list', allOnlineUsers);
      socket.leave(socket.room)
      socket.disconnect(0);
    })

    socket.on('joinRoom', (data) => {
      socket.room = data.roomId;
      socket.join(socket.room, () => {
        console.log('joined room ' + data.roomId);
        myIo.to(data.roomId).emit('setJoinedRoom', data);
      });
    })

    socket.on('room-msg', (data) => {
      console.log(data);
      data['chatId'] = shortid.generate()
      setTimeout(() => {
        eventEmitter.emit('chat-save', data);
      }, 2000)
      socket.to(data.receiverId).broadcast.emit('receiveMsg', data);
    });
    socket.on('typing', (data) => {
      socket.to(data.roomId).broadcast.emit('userTyping', data);
    });
  });

}

eventEmitter.on('chat-save', (data) => {
  let newChat = new ChatModel({
    chatId: data.chatId,
    senderName: data.senderName,
    senderId: data.senderId,
    receiverName: data.receiverName || '',
    receiverId: data.receiverId || '',
    message: data.message,
    createdOn: data.createdOn
  });

  newChat.save((err, result) => {
    if (err) {
      console.log(`error occurred: ${err}`);
    } else if (result == undefined || result == null || result == "") {
      console.log("Chat Is Not Saved.");
    } else {
      console.log(result);
    }
  });
});

module.exports = {
  setServer: setServer,
  emitter: eventEmitter
}