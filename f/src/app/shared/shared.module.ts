import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirstCharComponent } from './first-char/first-char.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupChatComponent } from '../chat/group-chat/group-chat.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: 'group-chat/:roomId/:roomName', component: GroupChatComponent },
      { path: 'group-chat/:roomId', component: GroupChatComponent }
    ])
  ],
  declarations: [UserDetailsComponent, FirstCharComponent],
  exports: [
    UserDetailsComponent,
    FirstCharComponent,
    CommonModule,
    FormsModule
  ]
})
export class SharedModule { }
