///<reference path="./types/index.d.ts" />


import express from 'express'
import initDatabase from 'config/seed'
import cors from 'cors'
import configPassport from './middleware/passport'
import passport from 'passport'
import authRoute from 'routes/auth'
import api from 'routes/api'
import adminRoute from 'routes/ad'

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

//config passport
configPassport();
app.use(passport.initialize());

//config global
app.use((req, res, next) => {
    res.locals.user = req.user || null; // Pass user object to all views
    next();
});

//cors
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true,
}));


//config routes
authRoute(app)
api(app)
adminRoute(app)

//mock data
initDatabase()


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})