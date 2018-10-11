import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef } from '@angular/core';
import { SocketService } from './../../socket.service';
import { AppService } from './../../app.service';

import { Router, ActivatedRoute } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css'],
  providers: [SocketService]
})

export class ChatBoxComponent implements OnInit {

  @ViewChild('scrollMe', { read: ElementRef })

  public scrollMe: ElementRef;



  public authToken: any;
  public userInfo: any;
  public param1: string;
  public param2: string;
  public param3: string;
  public userList: any = [];
  public unreadList: any = [];
  public unreadOfflineList: any = [];
  public count;
  public disconnectedSocket: boolean;
  public scrollToChatTop: boolean = false;
  public receiverId: any;
  public receiverName: any;
  public previousChatList: any = [];
  public messageText: any;
  public messageList = []; // stores the current message list display in chat box
  public pageValue: number = 0;
  public loadingPreviousChat: boolean = false;
  public unreadMsgList: any = [];
  public chatRooms: any = [];
  public joinRooms: any = [];
  public typingUserName: any = '';
  public typingUserId: String = '';
  public roomId: any;

  constructor(
    public appService: AppService,
    public socketService: SocketService,
    public router: Router,
    private toastr: ToastrService,
    public route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.authToken = Cookie.get('authToken');
    this.userInfo = this.appService.getUserInfoFromLocalstorage();
    this.receiverId = Cookie.get('receiverId');
    this.receiverName = Cookie.get('receiverName');
    this.param1 = this.route.snapshot.paramMap.get('roomId');
    this.param2 = this.route.snapshot.paramMap.get('roomName');

    if (this.receiverId != null && this.receiverId != undefined && this.receiverId != '') {
      this.roomSelectedToChat(this.receiverId, this.receiverName)
    }
    this.verifyUserConfirmation(this.authToken);
    this.getOnTypingData();
    this.setJoinedRoom();
    this.getMessageFromAUser()

    this.appService.getChatGroup(this.authToken).subscribe(Response => {
      this.chatRooms = Response.data;
      this.userList = [];
      if (this.chatRooms !== null) {
        for (const i of this.chatRooms) {
          i.chatting = 'false';
        }
      }
    },
      error => {
        this.toastr.error('some error occured');
      });

    if (this.param1 && this.param2) {
      this.param2 = atob(this.param2);
      this.roomJoining(this.param1, this.param2);
      this.roomSelectedToChat(this.param1, this.param2);
    }

    if (this.receiverId != null && this.receiverId !== undefined && this.receiverId !== '') {
      this.roomSelectedToChat(this.receiverId, this.receiverName);
    }
    this.getOnlineUserList();
  }

  public verifyUserConfirmation: any = (token) => {
    this.socketService.verifyUser()
      .subscribe((data) => {
        this.disconnectedSocket = false;
        this.socketService.setUser(token);
        this.getOnlineUserList();
      });
  }

  public getOnlineUserList: any = () => {
    this.socketService.onlineUserList()
      .subscribe((userList) => {
        this.userList = [];
        for (const i of userList) {
          const temp = { 'userId': i.userId, 'name': i.fullName, 'unread': 0, 'chatting': false };
          this.userList.push(temp);
        }
      });
  }

  public joinRoomStatus(roomId): boolean {
    if (this.joinRooms.length > 0) {
      if (this.joinRooms.indexOf(roomId) !== -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public roomJoining = (roomId, roomName) => {
    console.log('clicked join room');
    const name = `${this.userInfo.firstName} ${this.userInfo.lastName}`;
    this.socketService.joinRoom(roomId, roomName, name);
  }

  public setJoinedRoom = () => {
    this.socketService.setJoinedRoom().subscribe(data => {
      this.joinRooms.push(data.roomId);
      this.joinRooms = this.joinRooms.filter((val, index) => {
        return this.joinRooms.indexOf(val) === index;
      });
      console.log(data.roomId);
      const name = `${this.userInfo.firstName} ${this.userInfo.lastName}`;
      if (data.joinedUser === name) {
        this.toastr.success(`You have Joined ${data.roomName} room`);
      } else {
        this.toastr.success(`${data.joinedUser} have Joined ${data.roomName} room`);
      }
    });
  }


  public getPreviousChatWithAUser: any = () => {
    const previousData = (this.messageList.length > 0 ? this.messageList.slice() : []);
    this.appService.getChatsForGroup(this.receiverId, this.pageValue * 10)
      .subscribe((apiResponse) => {
        if (apiResponse.status === 200) {
          this.messageList = apiResponse.data.concat(previousData);
        } else {
          this.messageList = previousData;
          this.toastr.warning('No Messages available');
        }
        this.loadingPreviousChat = false;
      }, (err) => {
        this.toastr.error('some error occured');
      });
  }


  public loadEarlierPageOfChat: any = () => {
    this.loadingPreviousChat = true;
    this.pageValue++;
    this.scrollToChatTop = true;
    this.getPreviousChatWithAUser()
  }

  public getOnTypingData = () => {
    this.socketService.getTypingUser()
      .subscribe((data) => {
        this.typingUserName = data.typingUser;
        this.typingUserId = data.typingUserId;
        this.roomId = data.roomId;
        this.toastr.success(`${this.typingUserName} is typing`);
      });
  }

  public onTyping(event: any) {
    if (event.keyCode !== 13) {
      const data = {
        'typingUser': this.userInfo.firstName,
        'typingUserId': this.userInfo.userId,
        'roomId': this.receiverId
      };
      if (this.messageText === '') {
        const data = {
          'typingUser': '',
          'typingUserId': '',
          'roomId': this.receiverId
        };
        this.socketService.typing(data);
      }
      if (this.messageText !== '') {
        this.socketService.typing(data);
      }
    }
  }

  public roomSelectedToChat: any = (roomId, roomName) => {
    this.chatRooms.map((room) => {
      if (room.roomId === roomId) {
        room.chatting = true;
      } else {
        room.chatting = false;
      }
    })
    Cookie.set('receiverId', roomId);
    Cookie.set('receiverName', roomName);

    this.receiverName = roomName;
    this.receiverId = roomId;
    this.messageList = [];
    this.pageValue = 0;
    this.getPreviousChatWithAUser();
  }

  public sendMessageUsingKeypress: any = (event: any) => {
    if (event.keyCode === 13) {
      this.sendMessage();
    }
  }

  public sendMessage() {
    if (this.messageText) {
      const chatMsgObject = {
        senderName: this.userInfo.firstName + ' ' + this.userInfo.lastName,
        senderId: this.userInfo.userId,
        receiverName: Cookie.get('receiverName'),
        receiverId: Cookie.get('receiverId'),
        message: this.messageText,
        createdOn: new Date()
      };
      this.socketService.SendChatMessage(chatMsgObject);
      this.pushToChatWindow(chatMsgObject);
    } else {
      this.toastr.warning('text message can not be empty');
    }
  }

  public pushToChatWindow: any = (data) => {

    this.messageText = "";
    this.messageList.push(data);
    this.scrollToChatTop = false;


  }// end push to chat window

  public getMessageFromAUser: any = () => {
    this.socketService.chatByRoomId()
      .subscribe((data) => {
        if (data.senderId === this.typingUserId) {
          this.roomId = '';
          this.typingUserName = '';
        }
        (this.receiverId === data.receiverId) ? this.messageList.push(data) : '';
        this.toastr.success(`${data.senderName} says : ${data.message}`);
        this.scrollToChatTop = false;
      });
  }


  public logout: any = () => {
    this.appService.logout()
      .subscribe((apiResponse) => {

        if (apiResponse.status === 200) {
          console.log("logout called")
          Cookie.delete('authToken');
          Cookie.delete('receiverId');
          Cookie.delete('receiverName');
          this.socketService.exitSocket()
          this.router.navigate(['/']);
        } else {
          this.toastr.error(apiResponse.message)
        }
      }, (err) => {
        this.toastr.error('some error occured')
      });
  }

  public showUserName = (name: string) => {
    this.toastr.success("You are chatting with " + name)
  }
}
