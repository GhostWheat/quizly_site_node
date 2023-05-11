const axios = require('axios')

const userData = async(req, res, next) => {
    if (!req.verifiedUser) {
        next()
        return
    }

    const query = `
    query user($id: ID!){
        user(id: $id) {
          id,
          username,
          email,
          quizzes {
            id,
            slug,
            title,
            description,
            avgScore,
            questions {
                id,
              title,
              correctAnswer
            },
            submissions {
              userId,
                score
            }
          },
          submissions {
            quiz {
              title,
              description
            },
            score
          }
        }
    }
    `

    try {
        const response = await axios.post('http://localhost:3000/graphql',
        { 
            query: query,
            variables: {
                id: req.verifiedUser.user._id
            }
        },
        {
            headers: {
                'Content-Type': 'application/json',
            }
        }); 
        req.verifiedUser.user.quizzes = response.data.data.user.quizzes
        req.verifiedUser.user.submissions = response.data.data.user.submissions
    }
    catch {

    }
    next()
}

module.exports = { userData }