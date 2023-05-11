const express = require('express')
const dotenv = require('dotenv')
const {connectDB} = require('./src/db')
const { graphqlHTTP } = require('express-graphql')
const cookieParser = require('cookie-parser')

//import for gql schema
const schema = require('./src/graphql/schema')
const { authenticate } = require('./src/middleware/auth')
const { userData } = require('./src/middleware/userData')
const path = require('path')


dotenv.config()

const app = express()

connectDB()

app.use(cookieParser())

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))

app.use(express.urlencoded({ extended: true }))

// set the view engine to ejs
app.set('view engine', 'ejs');

// update location of views folder that res.render pulls from
app.set('views', path.join(__dirname,'/src/templates/views'))

app.use(authenticate)
app.use(userData)

/* Initialize Routes */
require("./src/routes")(app)

app.listen(process.env.PORT, () => {
    console.log(`Server now running on PORT ${process.env.PORT}`)
})