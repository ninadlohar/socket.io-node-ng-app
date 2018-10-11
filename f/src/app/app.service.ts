import { Injectable } from '@angular/core';
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
export class AppService {

  constructor(public http: HttpClient) { }

  private url = 'http://localhost:3000'

  public signupFunction(data): Observable<any> {
    const params = new HttpParams()
      .set('firstName', data.firstName)
      .set('lastName', data.lastName)
      .set('mobile', data.mobile)
      .set('email', data.email)
      .set('password', data.password)
    return this.http.post(`${this.url}/api/v1/users/signup`, params);

  } // end of signupFunction function.

  public signinFunction(data): Observable<any> {
    const params = new HttpParams()
      .set('email', data.email)
      .set('password', data.password);
    return this.http.post(`${this.url}/api/v1/users/login`, params);
  }

  public sendResetLink(data): Observable<any> {
    const params = new HttpParams()
      .set('email', data.email)
    return this.http.post(`${this.url}/api/v1/users/sendResetLink`, params);
  }

  public resetPassword(data): Observable<any> {
    const params = new HttpParams()
      .set('userId', data.userId)
      .set('password', data.password)
    return this.http.post(`${this.url}/api/v1/users/resetPassword`, params)
  }

  public getUserInfoFromLocalstorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  }

  public setUserInfoInLocalStorage = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data))
  }

  public logout(): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
    return this.http.post(`${this.url}/api/v1/users/logout`, params);
  }

  public createGroup = (data, authToken): Observable<any> => {
    const params = new HttpParams()
      .set('name', data.name)
      .set('creator', data.creator);
    return this.http.post(`${this.url}/api/v1/group/createGroup?authToken=${authToken}`, params);
  }

  public deleteGroup = (roomId, authToken): Observable<any> => {
    const data = {};
    return this.http.post(`${this.url}/api/v1/group/${roomId}/deleteGroup?authToken=${authToken}`, data);
  }

  public editGroup = (data, authToken): Observable<any> => {
    const params = new HttpParams()
      .set('name', data.name);
    return this.http.put(`${this.url}/api/v1/group/${data.roomId}/editGroup?authToken=${authToken}`, params);
  }

  public close = (roomId, authToken): Observable<any> => {
    const data = {};
    return this.http.put(`${this.url}/api/v1/group/${roomId}/markAsClose?authToken=${authToken}`, data);
  }

  public getChatGroup = (authToken): Observable<any> => {
    return this.http.get(`${this.url}/api/v1/group/getChatGroup?authToken=${authToken}`);
  }

  public shareLink = (data, authToken): Observable<any> => {
    const params = new HttpParams()
      .set('email', data.email)
      .set('roomId', data.roomId)
      .set('roomName', data.roomName);
    return this.http.post(`${this.url}/api/v1/group/shareLink?authToken=${authToken}`, params);
  }

  public getChatsForGroup(receiverId, skip): Observable<any> {
    return this.http.get(`${this.url}/api/v1/group/chat/get/for/group?receiverId=${receiverId}&skip=${skip}&authToken=${Cookie.get('authToken')}`)
      .do(data => console.log('Data Received'))
      .catch(this.handleError);
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return Observable.throw(errorMessage);
  }
}


  /**
   * @apiGroup users
   * @apiVersion  1.0.0
   * @api {post} /api/v1/users/signup api for user login.
   *
   * @apiParam {string} email email of the user. (body params) (required)
   * @apiParam {string} password password of the user. (body params) (required)
   *
   * @apiSuccess {object} myResponse shows error status, message, http status code, result.
   * 
   * @apiSuccessExample {object} Success-Response:
 {
    "error": false,
    "message": "email send successfully for password reset",
    "status": 200,
    "data": {
        "error": false,
        "message": "email send successfully for password reset",
        "status": 200,
        "data": "email sent for password reset"
    }
}
  */
