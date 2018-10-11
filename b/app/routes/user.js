const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

  let baseUrl = `${appConfig.apiVersion}/users`;

  // params: firstName, lastName, email, mobileNumber, password
  app.post(`${baseUrl}/signup`, userController.signUpFunction);

  /**
   * @apiGroup users
   * @apiVersion  1.0.0
   * @api {post} /api/v1/users/signup api for user signup.
   *
   * @apiParam {string} email email of the user. (body params) (required)
   * @apiParam {string} password password of the user. (body params) (required)
   * @apiParam {string} mobileNumber mobileNumber of the user. (body params) (required)
   * @apiParam {string} firstName firstName of the user. (body params) (required)
   * @apiParam {string} lastName lastName of the user. (body params) (required)
   *
   * @apiSuccess {object} myResponse shows error status, message, http status code, result.
   * 
   * @apiSuccessExample {object} Success-Response:
       {
          "error": false,
          "message": "User created",
          "status": 200,
          "data": {
               "__v": 0,
              "_id": "5bbeec8d7d1dd3114c4ffe69",
              "createdOn": "2018-10-11T06:24:13.000Z",
              "mobileNumber": 0,
              "email": "cc@gmail.com",
              "lastName": "Lohar",
              "firstName": "Ninad",
              "userId": "ysYSOKaj-"
          }

      }
  */

  // params: email, password
  app.post(`${baseUrl}/login`, userController.loginFunction);
  /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login api for user login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
    {
      "error": false,
      "message": "Login Successful",
      "status": 200,
      "data": {
          "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6IjhGbjVRYUJ2QiIsImlhdCI6MTUzOTIzODk0NjYyNSwiZXhwIjoxNTM5MzI1MzQ2LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJlZENoYXQiLCJkYXRhIjp7Im1vYmlsZU51bWJlciI6MCwiZW1haWwiOiJ0YXZrcXF6ZEBnbWFpbC5jb20iLCJsYXN0TmFtZSI6Inp6IiwiZmlyc3ROYW1lIjoienoiLCJ1c2VySWQiOiJuZXZncFg3ZXIifX0.FrSyMTtO2U2fkP4S-N_iVdctjRXAzQ6_dsJTtlLVdAc",
          "userDetails": {
              "mobileNumber": 0,
              "email": "tavkqqzd@gmail.com",
              "lastName": "zz",
              "firstName": "zz",
              "userId": "nevgpX7er"
          }
      }
  }
  */

  app.post(`${baseUrl}/logout`, auth.isAuthorized, userController.logout);
  /**
   * @apiGroup users
   * @apiVersion  1.0.0
   * @api {post} /api/v1/users/logout api for user logout.
   *
   * @apiParam {string} email email of the user. (body params) (required)
   * @apiParam {string} password password of the user. (body params) (required)
   * @apiParam {string} authToken authToken of the user (required)
   * @apiParam {string} userId userId of the user required
   * @apiSuccess {object} myResponse shows error status, message, http status code, result.
   * 
   * @apiSuccessExample {object} Success-Response:
       { 
          "error": false,
          "message": "Logged Out Successfully",
          "status": 200,
          "data": null
      }
  */

  app.post(`${baseUrl}/sendResetLink`, userController.sendResetLink)
  /**
   * @apiGroup users
   * @apiVersion  1.0.0
   * @api {post} /api/v1/users/sendResetLink api for user send reset passowrd link.
   *
   * @apiParam {string} email email of the user. (body params) (required)
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

  app.post(`${baseUrl}/resetPassword`, userController.resetPassword)
  /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/resetPassword api for user resetPassword.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     * @apiParam {string} userId userId of the user (required)
     * @apiParam {string} confirmPassword confirmPassowrd of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
      	{
  	    "error": false,
  	    "message": "Mail sent Successfully",
  	    "status": 200,
  	    "data": "Password reset successfull"
  	}
    */

}