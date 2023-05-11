const { GraphQLString, GraphQLNonNull, GraphQLList } = require('graphql')
const { QuestionInputType, AnswerInputType } = require('./types')
const { User, Quiz, Question, Submission } = require("../models")
const { createJWT } = require('../util/auth')

// Register a user
const register = {
    type: GraphQLString,
    args: {
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString }
    },
    async resolve(parent, args) {
        //check if a user with passed-in email exists:
        const checkUser = await User.findOne({ email: args.email })

        if (checkUser) {
            throw new Error('User with this email address already exists!')
            //this ^^ breaks out of the RESOLVE, so this vv doesn't need to be an ELSE
        }

        const newUser = new User({
            username: args.username,
            password: args.password,
            email: args.email
        })

        await newUser.save() //this is like db.session.add and db.session.commit we had in python

        const token = createJWT(newUser)
        return token
// this token is like our load_user() function we created in Flask.
// it ways that this user is currently logged in, aka our 'current user'
    }
}

//login if password matches, we create good-to-go token
const login = {
    type: GraphQLString,
    args: {
        email: { type: GraphQLString },
        password: {type: GraphQLString}
    },
    async resolve(parent, args) {
        const user = await User.findOne({ email: args.email })
        
        if (!user || user.password != args.password) {
            throw new Error("Password or email incorrect")
        }

        const token = createJWT(user)
        return token
    }
}

//quiz mutation
const createQuiz = {
    type: GraphQLString,
    args: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        userId: { type: GraphQLString },
        questions: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(QuestionInputType))) }
    },
    async resolve(parent, args) {
        /*
        Slugifying: 
        "This is a title" -> "this-is-a-title",
        "This is a title & a description" -> "this-is-a-title-a-description"
        aka, make the title usable in a URL
        */
        const slug = args.title.toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replaceAll(' ', '-')

        let fullSlug = ''

        while(true) {
            let slugId = Math.floor(Math.random() * 1000000)
    
            fullSlug = slug + slugId

            const existingQuiz = await Quiz.findOne({ slug: fullSlug })

            if (!existingQuiz) {
                break
            }
        }

        const quiz = new Quiz({
            title: args.title,
            description: args.description,
            userId: args.userId,
            slug: fullSlug
        })

        await quiz.save()

        for (const question of args.questions) {
            const questionObject = new Question({
                title: question.title,
                correctAnswer: question.correctAnswer,
                order: question.order,
                quizId: quiz.id
            })
            questionObject.save()
        }

        return quiz.slug
    }
}

const submitQuiz = {
    type: GraphQLString,
    args: {
        answers: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AnswerInputType))) },
        quizId: { type: GraphQLString },
        userId: { type: GraphQLString }
    },
    async resolve(parent,args) {
        let correct = 0
        let totalScore = args.answers.length

        for (const answer of args.answers) {
            const question = await Question.findById(answer.questionId)

            if (answer.answer.trim().toLowerCase() == question.correctAnswer.trim().toLowerCase()) {
                correct++
            }
        }

        const score = (correct / totalScore) * 100

        const submission = new Submission({
            userId: args.userId,
            quizId: args.quizId,
            score: score
        })

        await submission.save()

        return submission.id
    }
}

module.exports = {
    register,
    login,
    createQuiz,
    submitQuiz
}