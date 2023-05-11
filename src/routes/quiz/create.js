const axios = require('axios')

module.exports = async (req, res) => {
    const quizInputs = req.body

    const quizData = {
        userId: req.verifiedUser.user._id,
        title: quizInputs.quizTitle,
        description: quizInputs.quizDescription,
        questions: []
    }

    for (const key in quizInputs) {
        if (key.includes('questionTitle')) {
            // If the key is a question title
            const questionNum = parseInt(key.replace('questionTitle', ''))

            while(!quizData.questions[questionNum]) {
                quizData.questions.push({})
            }

            quizData.questions[questionNum].title = quizInputs[key] 
        } else if (key.includes('questionAnswer')) {
            // If the key is a question answer
            const questionNum = parseInt(key.replace('questionAnswer', ''))
            quizData.questions[questionNum].correctAnswer = quizInputs[key]
            quizData.questions[questionNum].order = questionNum + 1
        }
    }

    const mutation = `
    mutation createQuiz($userId: String!, $title: String!, $description: String!, $questions: [QuestionInput!]!) { 
        createQuiz( userId: $userId, title: $title, description: $description, questions: $questions ) 
    }`

    try {
        const response = await axios.post('http://localhost:3000/graphql',
        { 
            query: mutation,
            variables: quizData
        },
        {
            headers: {
                'Content-Type': 'application/json',
            }
        });   
        const quizSlug = response.data.data.createQuiz
        res.redirect(`/quiz/success/${quizSlug}`)
    }
    catch(err) {
        console.log(err)
        res.redirect('/')
    }
}