const MainQuizRouter = require("express").Router()

MainQuizRouter.route('/create')
    .get(require('./editor.js'))
    .post(require('./create.js'))

MainQuizRouter.route('/:slug')
    .get(require('./view.js'))

MainQuizRouter.route('/:slug/submit')
    .post(require('./submit.js'))

MainQuizRouter.route('/success/:slug')
    .get(require('./created.js'))

MainQuizRouter.route('/results/:id')
    .get(require('./results.js'))

module.exports = MainQuizRouter