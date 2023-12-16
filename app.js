const express = require('express') 


const getRouter = require('./router/get')
const postRouter = require('./router/post')


const { urlencoded } = require('body-parser')
const cookieParser = require('cookie-parser')

const consolidate = require('consolidate')

const app = express() 
app.use(express.static(__dirname + "/public")) 
app.use(urlencoded({ extended: true })) 
app.use(cookieParser()) 


app.engine('html', consolidate.mustache)
app.set('views', __dirname + "/public")
app.set('view engine', 'html')


app.use("/api", postRouter)
app.use("/", getRouter)


app.use((req, res, next) => {
    res.end(`
        <!DOCTYPE html>
        <html>
            <head lang="en">
                <meta charset="utf-8">
                <link rel="stylesheet" href="styles.css">
                <title>Error 404</title>
            </head>
            <body>
                <div class="home">
                    <h1 class="home__header">Error 404</h1>
                    <p>The page you are looking for may have:</p>
                    <ul>
                        <li>Been deleted</li>
                        <li>Been moved</li>
                        <li>Never existed</li>
                        <li>Be a typo</li>
                    </ul>
                    <a href="/">Click Here to Go Home</a>
                </div>
            </body>
        </html>
    `)
})

module.exports = app
