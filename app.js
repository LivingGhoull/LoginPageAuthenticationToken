const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
require('dotenv').config()

app.use(express.urlencoded({extended: false}))
app.use(express.json())

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET

function generateToken(user) {
    const accessToken = jwt.sign(user, accessTokenSecret, {expiresIn: '10s'})
    const refreshToken = jwt.sign(user, refreshTokenSecret, {expiresIn: '1h'})
    return {accessToken, refreshToken}
}

//Middelware 
function VerifyToken(req, res, next) {
    
    if (!req.headers.cookie) {
        res.sendStatus(403)
    }
    
    const cookie = (req.headers.cookie).split(';')

    const accessToken = cookie[0].split('=')[1]
    const refreshToken = cookie[1].trim().split('=')[1]

    if(!accessToken){
        res.sendStatus(403)
    }

    jwt.verify(accessToken, accessTokenSecret, (err) =>{
        if (err) {
            jwt.verify(refreshToken, refreshTokenSecret, (err, authData) => {
                if (err) { 
                    console.log(err)
                    res.redirect('/login') }
                
                const user = { id: 1, role: 'admin'}
                const tokens = generateToken(user)
                res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true})
                next()
            })
        } else { next() } 
    })
}

//Frontpage
app.get('/', VerifyToken, (req, res) =>{
    res.sendFile(__dirname+ '/views/index.html')
})

app.get('/login', (req, res) =>{
    res.sendFile(__dirname+ '/views/login.html')
})

app.post('/login', (req, res) =>{
    const user = { id: 1, role: 'admin'}
    const tokens = generateToken(user)
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true})
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true})
    res.redirect('/')
})

//If the site doesen't exist
app.get('*', (req, res) => {
    res.sendFile(__dirname+ '/views/error.html')
})

app.listen(3000), () =>{
    console.log("listening")
} 