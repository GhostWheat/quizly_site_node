const MainAuthRouter = require("express").Router()

MainAuthRouter.route('/login')
    .get(require('./login.view.js'))
    .post(require('./login'))

MainAuthRouter.route('/register')
    .get(require('./register.view.js'))
    .post(require('./register'))

MainAuthRouter.route('/logout')
    .get(require('./logout'))

module.exports = MainAuthRouter