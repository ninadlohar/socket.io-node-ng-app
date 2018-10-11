import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from './../../app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.css']
})
export class GroupChatComponent implements OnInit {

  public param1: String;
  public param2: String;
  public email: any;
  public groupChat = true;
  public authToken: String;
  public receiverId: String;
  public groupName: String;
  public receiverName: String;
  public share = false;
  public editChat = false;
  public deleteChat = false;
  public markAsClose = false;

  constructor(public appService: AppService,
    private _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService) { }

  ngOnInit() {
    /* get these as snapshot for parameters */
    this.param1 = this._route.snapshot.paramMap.get('roomId');
    this.param2 = this._route.snapshot.paramMap.get('roomName');

    /* get these details from local storage browser */
    this.authToken = Cookie.get('authToken');
    this.receiverName = Cookie.get('receiverName');
    this.receiverId = Cookie.get('receiverId');

    /* to make sure parameters match, if it doesn't [close, delete, edit] operations happen */
    if (this.param1 && !this.param2) {
      this.editChat = true;
      this.groupChat = false;
    }
    if (this.param1 && this.param2) {
      if (this.param1 && this.param2 === 'delete') {
        this.deleteChat = true;
        this.groupChat = false;
        this.delete(this.param1);
      } else if (this.param1 && this.param2 === 'close') {
        this.markAsClose = true;
        this.groupChat = false;
        this.close(this.param1);
      } else {
        this.share = true;
        this.groupChat = false;
      }
    }
  }

  public editGroup() {
    const data = {
      name: this.groupName,
      roomId: this.param1
    }
    this.appService.editGroup(data, this.authToken)
      .subscribe((res) => {
        if (res.status === 200) {
          this.toastr.success('successfully edited group details')
          setTimeout(() => {
            this.router.navigate(['/chat'])
          }, 1000)
        } else {
          this.toastr.error(res.message)
        }
      }, (err) => {
        this.toastr.error(err.message)
      })
  }

  public delete(roomId) {
    this.appService.deleteGroup(roomId, this.authToken)
      .subscribe((res) => {
        if (res.status === 200) {
          this.toastr.success('successfully deleted group')
          setTimeout(() => {
            this.router.navigate(['/chat'])
          }, 1000)
        } else {
          this.toastr.error(res.message)
        }
      }, (err) => {
        this.toastr.error(err.message)
      })
  }

  public close(roomId) {
    this.appService.close(roomId, this.authToken)
      .subscribe((res) => {
        if (res.status === 200) {
          this.toastr.success('group closed and made de-activated')
          setTimeout(() => {
            this.router.navigate(['/chat'])
          }, 1000)
        } else {
          this.toastr.error(res.message)
        }
      }, (err) => {
        this.toastr.error(err.message)
      })
  }

  public createGroup() {
    const data = {
      name: this.groupName,
      creator: this.receiverName
    }
    this.appService.createGroup(data, this.authToken)
      .subscribe((res) => {
        if (res.status === 200) {
          this.toastr.success('successfully created group')
          setTimeout(() => {
            this.router.navigate(['/chat'])
          }, 1000)
        } else {
          this.toastr.error(res.message)
        }
      }, (err) => {
        this.toastr.error(err.message)
      })
  }

  public shareLink = () => {
    const data = {
      'roomId': this.param1,
      'roomName': this.param2,
      'email': this.email,
    };
    this.appService.shareLink(data, this.authToken)
      .subscribe(Response => {
        if (Response.status === 200) {
          this.toastr.success('Link has been Successfully Shared!');
          setTimeout(() => {
            this.router.navigate(['/chat']);
          }, 2000);
        } else {
          this.toastr.error(Response.message);
        }
      },
        error => {
          this.toastr.error(`Some Error Occured!`);
        });
  }
}


