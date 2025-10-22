///<reference path="./types/index.d.ts" />


import express from 'express'
import initDatabase from 'config/seed'
import cors from 'cors'

const app = express()


require('dotenv').config()
const port = process.env.PORT || 3002

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')


//config req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//config static file
app.use(express.static('public'))


//cors
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true,
}));


//config routes

//mock data
initDatabase()


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})