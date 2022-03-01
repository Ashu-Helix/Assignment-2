const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const req = require('express/lib/request');
const bcrypt = require('bcrypt');
// const res = require('express/lib/response');
// const { use } = require('express/lib/application');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended:true}));

var dbUrl = "mongodb+srv://admin:admin@cluster0.gikvy.mongodb.net/loginDB?retryWrites=true&w=majority";
const loginSchema = new mongoose.Schema({
    username: String,
    password: String,
    datetime: String
});
var loginModel = mongoose.model('loginSchema',loginSchema);

// app.use(express.static(__dirname));
app.set('view engine', 'ejs');
app.get('/', (req, res)=>{
    res.render('pages/index', { loginResult: ""});
});

app.get('/register', (req, res)=>{
    res.render('pages/register');
});

app.post('/login', (req, res)=>{
    let username = req.body.username;
    let password = req.body.password;
    // console.log("Username: "+username+" Password: "+password);
    // res.send("Username: "+username+" Password: "+password);
    if(username.length === 0 || password.length === 0){
        // res.status(400).send("Filed should not be empty");
        res.render('pages/index',{ loginResult: "Filed should not be empty"});
    }
    else{
        let result = validatLogin(username, password, res);
    }
});

async function validatLogin(user, pass, res){
    let loginRecords = await getAllData();

    let getRecord = loginRecords.find((obj)=>{
        if(obj.username == user){
            return obj;
        }
    });
    // console.log(getRecord);

    if(getRecord){
        let isMatch = await bcrypt.compare(pass, getRecord.password);
        // console.log(isMatch);
        // res.send(getRecord);

        if(!isMatch){
            // res.send("Invalid Login");
            res.render('pages/index',{ loginResult: "Invalid Credentials"});
        }else{
            res.status(201).render('pages/dashboard');
        }
    }else{
        // res.send("Invalid Login");
        res.render('pages/index',{ loginResult: "Invalid Credentials"});
    }
}

// async function compareHashPass(pass, hashedPass){
//     return await bcrypt.compare(pass, hashedPass)
// }

function getAllData(){
    return new Promise((resolve, reject)=>{
        loginModel.find({}, (err, result)=>{
            if(err){
                console.log(err);
                return;
            }       
            resolve(result);
        });
    });
}

//insert record
app.post('/register', function(req, res){
    let user = req.body.username;
    let pass = req.body.password;
    if(user.length === 0 || pass.length === 0){
        res.send("Field Should not empty.");
    }else{
        let registerObj = { username: user, password: pass, datetime: new Date()};
        addUser(registerObj, res);
    }
});

async function addUser(registerObj, res){
    let tableRecords = await getAllData();
    

    let checkUserExists = tableRecords.find((obj)=>{
        if(obj.username == registerObj.username){
            return obj;
        }
    });

    if(checkUserExists){
        res.status(500).send("Username Already exists.Please use another name");
    }else{

        let hashedPass = await securePassword(registerObj);
        // console.log(hashedPass);
        registerObj.password = hashedPass;
        let registerModel = new loginModel(registerObj);
        registerModel.save((err)=>{
            if(err)
                res.sendStatus(500);
            else
                res.status(200).send("User Registered"); 
        })
    }
}

function securePassword(obj){
    let pass = bcrypt.hash(obj.password, 10);
    return pass;
}

mongoose.connect(dbUrl , (err)=>{
    if(err){
        console.log(err);
        return;
    }
    console.log("mongoDB connection successful.");
});

const server = app.listen(port, (err)=>{
    if(err){
        console.log(err);
        return;
    }
    console.log(`server is running at port at ${port}...`);
});