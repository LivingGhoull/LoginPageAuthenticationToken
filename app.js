const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
require('dotenv').config()

app.use(express.urlencoded({extended: false}))
app.use(express.json())

function VerifyToken(req, res, next) {
    const bearerHeader = req.headers['cookie']
    //console.log(req.headers['cookie'])
    //console.log('test ' + JSON.stringify(req.headers))
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split('%20')[1]
        req.token = bearerToken
        console.log(bearerHeader)
        console.log(bearerToken)
        next()
    } else {
        res.sendStatus(403)
    } 
}

app.get('/', VerifyToken, (req, res) =>{
    jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, authData) =>{
        if (err) {
            console.log('site error')
            res.sendStatus(403)
        } else {
            res.json ({
                message: "posts created...",
                authData
            })
        }
    })
    //res.sendFile(__dirname+ '/views/index.html')
})

app.get('/login', (req, res) =>{
    res.sendFile(__dirname+ '/views/login.html')
})


app.post('/login', (req, res) =>{
    const user = {
        id: 1,
        username: 'Test',
        password: '1234'
    }
    
    jwt.sign ({user: user}, process.env.ACCESS_TOKEN_SECRET, (err, token) => {
    
        res.cookie('authorization', `Bearer ${token}`, {httpOnly: true, secure: true})
        res.redirect('/')
        //res.json({token,
        //})
    })
})

app.get('*', (req, res) => {
    res.sendFile(__dirname+ '/views/error.html')
})

app.listen(3000), () =>{
    console.log("listening")
} 

