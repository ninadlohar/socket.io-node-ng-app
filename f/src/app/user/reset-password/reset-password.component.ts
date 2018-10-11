import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  constructor(private router: Router, private appService: AppService, private toastr: ToastrService,
    public route: ActivatedRoute) { }

  ngOnInit() {
  }

  public password: string
  public confirmPassword: string
  public userId: string = this.route.snapshot.paramMap.get('userId');
  public data: any = {};

  public matchPassword() {
    if (this.password === this.confirmPassword) {
      return true
    } else {
      return false
    }
  }

  public resetPassword() {
    if (this.matchPassword()) {
      this.data.userId = this.userId
      this.data.password = this.password
      this.appService.resetPassword(this.data).subscribe((apires) => {
        if (apires.status === 200) {
          this.toastr.success('successfully changed password')
          setTimeout(() => {
            this.router.navigate(['/'])
          })
        } else {
          this.toastr.warning(apires.message)
        }
      }, (err) => {
        this.toastr.error(err.message)
      })
    }
  }

}
