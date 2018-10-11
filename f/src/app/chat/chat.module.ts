import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../shared/shared.module';
import { GroupChatComponent } from './group-chat/group-chat.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    RouterModule.forChild([
      { path: 'chat', component: ChatBoxComponent },
      { path: 'group-chat', component: GroupChatComponent },
      { path: 'group-chat/:roomId', component: GroupChatComponent },
      { path: 'chat/:roomId/:roomName', component: ChatBoxComponent },
      { path: 'group-chat/:roomId/:roomName', component: GroupChatComponent },
    ]),
    SharedModule
  ],
  declarations: [ChatBoxComponent, GroupChatComponent]
})
export class ChatModule { }
