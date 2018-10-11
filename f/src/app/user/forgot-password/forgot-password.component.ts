import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  public email: string;

  constructor(private appService: AppService,
    private router: Router,
    private toastr: ToastrService) { }

  ngOnInit() {
  }

  public sendResetLink() {
    if (!this.email) {
      this.toastr.warning('email required')
    } else {
      let data = {
        email: this.email
      }
      this.appService.sendResetLink(data)
        .subscribe((apires) => {
          if (apires.status === 200) {
            console.log(apires)
            this.toastr.success('ok done')
            setTimeout(() => {
              this.router.navigate(['/'])
            }, 1500)
          } else {
            this.toastr.warning('something went wrong')
          }
        }, (err) => {
          this.toastr.error(err.message)
        })
    }
  }

}
