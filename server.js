require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const {logger} = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require("./config/corsOptions")
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const {logEvents} = require('./middleware/logger')
const PORT = process.env.PORT || 3500

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())


app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', require('./routes/root'))
app.all('*', (req, res) => {
    res.status(404)
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if(req.accepts('json')){
        res.json({error: 'Not found'})
        res.json({message: '404 Not found'})
    }else {
        res.type('txt').send('404 Not found')
    }
})

app.use(errorHandler)

mongoose.connections.once('open', () => {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
})

mongoose.connections.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

// app.listen(PORT, () => console.log(`Server is rumming... on port ${PORT}`))
