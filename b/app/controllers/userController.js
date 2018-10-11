const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const passwordLib = require('./../libs/generatePasswordLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const token = require('../libs/tokenLib')
const sendMail = require('../libs/sendEmail')
const AuthModel = mongoose.model('Auth')
const UserModel = mongoose.model('User')

let getAllUser = (req, res) => {
  UserModel.find()
    .select(' -__v -_id')
    .lean()
    .exec((err, result) => {
      if (err) {
        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
        res.send(apiResponse)
      } else if (check.isEmpty(result)) {
        let apiResponse = response.generate(true, 'No User Found', 404, null)
        res.send(apiResponse)
      } else {
        let apiResponse = response.generate(false, 'All User Details Found', 200, result)
        res.send(apiResponse)
      }
    })
}

let getSingleUser = (req, res) => {
  UserModel.findOne({
      'userId': req.params.userId
    })
    .select('-password -__v -_id')
    .lean()
    .exec((err, result) => {
      if (err) {
        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
        res.send(apiResponse)
      } else if (check.isEmpty(result)) {
        let apiResponse = response.generate(true, 'No User Found', 404, null)
        res.send(apiResponse)
      } else {
        let apiResponse = response.generate(false, 'User Details Found', 200, result)
        res.send(apiResponse)
      }
    })
}

let deleteUser = (req, res) => {
  UserModel.findOneAndRemove({
    'userId': req.params.userId
  }).exec((err, result) => {
    if (err) {
      let apiResponse = response.generate(true, 'Failed To delete user', 500, null)
      res.send(apiResponse)
    } else if (check.isEmpty(result)) {
      let apiResponse = response.generate(true, 'No User Found', 404, null)
      res.send(apiResponse)
    } else {
      let apiResponse = response.generate(false, 'Deleted the user successfully', 200, result)
      res.send(apiResponse)
    }
  })
}
let editUser = (req, res) => {

  let options = req.body;
  UserModel.update({
    'userId': req.params.userId
  }, options).exec((err, result) => {
    if (err) {
      console.log(err)
      logger.error(err.message, 'User Controller:editUser', 10)
      let apiResponse = response.generate(true, 'Failed To edit user details', 500, null)
      res.send(apiResponse)
    } else if (check.isEmpty(result)) {
      logger.info('No User Found', 'User Controller: editUser')
      let apiResponse = response.generate(true, 'No User Found', 404, null)
      res.send(apiResponse)
    } else {
      let apiResponse = response.generate(false, 'User details edited', 200, result)
      res.send(apiResponse)
    }
  });
}


let logout = (req, res) => {
  AuthModel.findOneAndRemove({
    userId: req.user.userId
  }, (err, result) => {
    if (err) {
      let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
      res.send(apiResponse)
    } else if (check.isEmpty(result)) {
      let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
      res.send(apiResponse)
    } else {
      let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
      res.send(apiResponse)
    }
  })
}

let signUpFunction = (req, res) => {
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (req.body.email) {
        if (!validateInput.Email(req.body.email)) {
          let apiResponse = response.generate(true, 'Email Does not met the requirement', 400, null)
          reject(apiResponse)
        } else if (check.isEmpty(req.body.password)) {
          let apiResponse = response.generate(true, '"password" parameter is missing"', 400, null)
          reject(apiResponse)
        } else {
          resolve(req)
        }
      } else {
        let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
        reject(apiResponse)
      }
    })
  }
  let createUser = () => {
    return new Promise((resolve, reject) => {
      UserModel.findOne({
          email: req.body.email
        })
        .exec((err, retrievedUserDetails) => {
          if (err) {
            let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
            reject(apiResponse)
          } else if (check.isEmpty(retrievedUserDetails)) {
            let newUser = new UserModel({
              userId: shortid.generate(),
              firstName: req.body.firstName,
              lastName: req.body.lastName || '',
              email: req.body.email.toLowerCase(),
              mobileNumber: req.body.mobileNumber,
              password: passwordLib.hashpassword(req.body.password),
              createdOn: time.now()
            })
            newUser.save((err, newUser) => {
              if (err) {
                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                reject(apiResponse)
              } else {
                let newUserObj = newUser.toObject();
                sendMail.sendEmail(newUserObj.email, `<h2>${newUserObj.firstName} you have successfully registered for group chat</h2>`)
                resolve(newUserObj)
              }
            })
          } else {
            let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
            reject(apiResponse)
          }
        })
    })
  }

  validateUserInput(req, res)
    .then(createUser)
    .then((resolve) => {
      delete resolve.password
      let apiResponse = response.generate(false, 'User created', 200, resolve)
      res.send(apiResponse)
    })
    .catch((err) => {
      res.send(err);
    })
}

let sendResetLink = (req, res) => {
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(req.body.email)) {
        let apires = response.generate(true, 'email parameter required', 500, null)
        reject(apires)
      } else {
        resolve(req)
      }
    })
  }
  let sendLink = () => {
    return new Promise((resolve, reject) => {
      UserModel.findOne({
        email: req.body.email
      }, (err, result) => {
        if (err) {
          let apires = response.generate(true, 'failed to find user', 500, null)
          reject(apires)
        } else if (check.isEmpty(result)) {
          let apires = response.generate(true, 'no email found', 404, null)
          reject(apires)
        } else {
          sendMail.sendEmail(result.email, `<a href='http://localhost:4200/resetPassword/${result.userId}'>click here to reset password</a>`)
          let apires = response.generate(false, 'email send successfully for password reset', 200, 'email sent for password reset')
          resolve(apires)
        }
      })
    })
  }
  validateUserInput(req, res).then(sendLink).then((resolve) => {
    let apires = response.generate(false, 'email send successfully for password reset', 200, resolve)
    res.send(apires)
  }).catch(err => res.send(err))
}

let resetPassword = (req, res) => {
  let findUser = () => {
    return new Promise((resolve, reject) => {
      if (req.body.userId) {
        UserModel.findOne({
          userId: req.body.userId
        }, (err, userDetails) => {
          if (err) {
            let apiResponse = response.generate(true, "failed to find the user with given email", 500, null);
            reject(apiResponse);
          } else if (check.isEmpty(userDetails)) {
            let apiResponse = response.generate(true, "No user Details Found", 500, null);
            reject(apiResponse);
          } else {
            resolve(userDetails);
          }
        });
      } else {
        let apiResponse = response.generate(true, "UserId parameter is missing", 500, null);
        reject(apiResponse);
      }
    });
  }

  let updatePassword = (userDetails) => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(req.body.password)) {
        logger.error("password is missing", "UserController: logOut", 10);
        let apiResponse = response.generate(true, "Password is missing", 500, null);
        reject(apiResponse);
      } else {
        UserModel.update({
          userId: req.body.userId
        }, {
          password: passwordLib.hashpassword(req.body.password)
        }, {
          multi: true
        }, (err, result) => {
          if (err) {
            let apiResponse = response.generate(true, "Failed to change Password", 500, null);
            reject(apiResponse);
          } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, "User not found", 500, null);
            reject(apiResponse);
          } else {
            sendMail.sendEmail(userDetails.email, `<b> Hi ${userDetails.firstName} ${userDetails.lastName}, your password has been changed succesfully</b>`);
            resolve("Password reset successfull");
          }
        });
      }
    });
  }

  findUser(req, res)
    .then(updatePassword)
    .then((message) => {
      let apiResponse = response.generate(false, "Mail sent Successfully", 200, message);
      res.status(200);
      res.send(apiResponse);
    })
    .catch((err) => {
      res.status(err.status);
      res.send(err);
    });
}

let loginFunction = (req, res) => {
  let findUser = () => {
    return new Promise((resolve, reject) => {
      if (req.body.email) {
        UserModel.findOne({
          email: req.body.email
        }, (err, userDetails) => {
          if (err) {
            let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
            reject(apiResponse)
          } else if (check.isEmpty(userDetails)) {
            let apiResponse = response.generate(true, 'No User Details Found', 404, null)
            reject(apiResponse)
          } else {
            resolve(userDetails)
          }
        });
      } else {
        let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
        reject(apiResponse)
      }
    })
  }
  let validatePassword = (retrievedUserDetails) => {
    return new Promise((resolve, reject) => {
      passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
        if (err) {
          let apiResponse = response.generate(true, 'Login Failed', 500, null)
          reject(apiResponse)
        } else if (isMatch) {
          let retrievedUserDetailsObj = retrievedUserDetails.toObject()
          delete retrievedUserDetailsObj.password
          delete retrievedUserDetailsObj._id
          delete retrievedUserDetailsObj.__v
          delete retrievedUserDetailsObj.createdOn
          delete retrievedUserDetailsObj.modifiedOn
          resolve(retrievedUserDetailsObj)
        } else {
          let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
          reject(apiResponse)
        }
      })
    })
  }

  let generateToken = (userDetails) => {
    return new Promise((resolve, reject) => {
      token.generateToken(userDetails, (err, tokenDetails) => {
        if (err) {
          let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
          reject(apiResponse)
        } else {
          tokenDetails.userId = userDetails.userId
          tokenDetails.userDetails = userDetails
          resolve(tokenDetails)
        }
      })
    })
  }
  let saveToken = (tokenDetails) => {
    return new Promise((resolve, reject) => {
      AuthModel.findOne({
        userId: tokenDetails.userId
      }, (err, retrievedTokenDetails) => {
        if (err) {
          let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
          reject(apiResponse)
        } else if (check.isEmpty(retrievedTokenDetails)) {
          let newAuthToken = new AuthModel({
            userId: tokenDetails.userId,
            authToken: tokenDetails.token,
            tokenSecret: tokenDetails.tokenSecret,
            tokenGenerationTime: time.now()
          })
          newAuthToken.save((err, newTokenDetails) => {
            if (err) {
              let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
              reject(apiResponse)
            } else {
              let responseBody = {
                authToken: newTokenDetails.authToken,
                userDetails: tokenDetails.userDetails
              }
              resolve(responseBody)
            }
          })
        } else {
          retrievedTokenDetails.authToken = tokenDetails.token
          retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
          retrievedTokenDetails.tokenGenerationTime = time.now()
          retrievedTokenDetails.save((err, newTokenDetails) => {
            if (err) {
              let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
              reject(apiResponse)
            } else {
              let responseBody = {
                authToken: newTokenDetails.authToken,
                userDetails: tokenDetails.userDetails
              }
              resolve(responseBody)
            }
          })
        }
      })
    })
  }

  findUser(req, res)
    .then(validatePassword)
    .then(generateToken)
    .then(saveToken)
    .then((resolve) => {
      let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
      res.status(200)
      res.send(apiResponse)
    })
    .catch((err) => {
      res.send(err)
    })
}
module.exports = {
  signUpFunction: signUpFunction,
  getAllUser: getAllUser,
  editUser: editUser,
  deleteUser: deleteUser,
  getSingleUser: getSingleUser,
  loginFunction: loginFunction,
  logout: logout,
  sendResetLink: sendResetLink,
  resetPassword: resetPassword
}