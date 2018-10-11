import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from './../../app.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {

  @Input() userFirstName: any;
  @Input() userLastName: string;
  @Input() userStatus: string;
  @Input() messageRead?: any;
  @Input() list: string;
  @Input() roomId: string

  public firstChar: string;
  public roomName: string;
  public authToken: any;

  constructor(
    public appService: AppService,
    public router: Router) { }

  ngOnInit(): void {
    this.firstChar = this.userFirstName[0];
    this.roomName = btoa(this.userFirstName);
  }

}
