const axios = require('axios')

module.exports = async (req, res) => {
    // Form validation
    if (!req.body.email || !req.body.password) {
        res.redirect('/auth/login')
        return
    }

    const mutation = `
    mutation login($email: String!, $password: String!) { 
        login( email: $email, password: $password ) 
    }`

    try {
        const response = await axios.post('http://localhost:3000/graphql',
        { 
            query: mutation,
            variables: {
                email: req.body.email,
                password: req.body.password
            }
        },
        {
            headers: {
                'Content-Type': 'application/json',
            }
        });   
        console.log(response.data.data.login)
        res.cookie('JWT', response.data.data.login, { maxAge: 900000, httpOnly: true })
        res.redirect('/')
    }
    catch(err) {
        res.redirect('/auth/login')
    }
}