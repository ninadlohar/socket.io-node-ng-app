import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse, HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private url = 'http://localhost:3000';

  private socket;

  constructor(public http: HttpClient) {
    this.socket = io(this.url);
  }

  /* verify user on{event} */
  public verifyUser = () => {
    return Observable.create((observer) => {
      this.socket.on('verifyUser', (data) => {
        observer.next(data);
      });
    });
  }

  /* send message to other user on{event} */
  public SendChatMessage = (chatMsgObject) => {
    this.socket.emit('room-msg', chatMsgObject);
  }

  /* to show user ...typing emit{event} */
  public typing = (data) => {
    this.socket.emit('typing', data);
  }

  /* to show receiver ...typing on{event} */
  public getTypingUser = () => {
    return Observable.create((observer) => {
      this.socket.on('userTyping', (data) => {
        observer.next(data);
      });
    });
  }

  /* display online users on{event} */
  public onlineUserList = () => {
    return Observable.create((observer) => {
      this.socket.on("online-user-list", (userList) => {
        observer.next(userList);
      });
    });
  }

  /* receive message from incomming user on{event} */
  public chatByRoomId = () => {
    return Observable.create((observer) => {
      this.socket.on('receiveMsg', (data) => {
        observer.next(data);
      });
    });
  }

  public disconnectedSocket = () => {
    return Observable.create((observer) => {
      this.socket.on("disconnect", () => {
        observer.next();
      });
    });
  }

  /* set user with auth token emit{event} */
  public setUser = (authToken) => {
    this.socket.emit("set-user", authToken);
  }

  /* users data to sent for joining in room emit{event} */
  public joinRoom = (roomId, roomName, joinUser) => {
    const data = {
      'roomId': roomId,
      'roomName': roomName,
      'joinedUser': joinUser
    };
    this.socket.emit('joinRoom', data);
  }

  public getChat(senderId, receiverId, skip): Observable<any> {
    return this.http.get(`${this.url}/api/v1/chat/get/for/user?senderId=${senderId}&receiverId=${receiverId}&skip=${skip}&authToken=${Cookie.get('authToken')}`)
      .do(data => console.log('Data Received'))
      .catch(this.handleError);
  }

  /* user joins the room on{event} */
  public setJoinedRoom = () => {
    return Observable.create((observer) => {
      this.socket.on('setJoinedRoom', (joinedRoom) => {
        observer.next(joinedRoom);
      });
    });
  }

  /* user disconnect to everyone in room emit{event} */
  public exitSocket = (): any => {
    this.socket.emit('disconnect');
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof Error) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return Observable.throw(errorMessage);
  }
}
