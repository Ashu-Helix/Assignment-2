const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const req = require('express/lib/request');
const bcrypt = require('bcrypt');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const res = require('express/lib/response');
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
    res.render('pages/index', { loginResult: "" });
});

app.get('/register', (req, res)=>{
    // res.render('pages/register');
    res.render('pages/register', { registerResult: "", textColor: "text-danger"});
});

app.post('/login', (req, res)=>{
    // const { error } = validateLoginFileds(req.body);
    // if(error){
    //     res.render('pages/index', { loginResult: error.details[0].message });
    //     console.log(error);
    //     return;
    // }

    // res.render('pages/index', { loginResult: "All Good"} );


    let username = req.body.username;
    let password = req.body.password;
    console.log("Username: "+username+" Password: "+password);
    // res.send("Username: "+username+" Password: "+password);
    if(username.length === 0 || password.length === 0){
        // res.status(400).send("Filed should not be empty");
        res.render('pages/index',{ loginResult: "Filed should not be empty"});
    }
    else{
        let result = validateLogin(username, password, res);
    }
});

async function validateLogin(user, pass, res){
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
        // res.send("Field Should not empty.");
        res.render('pages/register', { registerResult: "Field Should not empty", textColor: "text-danger"});
        
    }else{
        let registerObj = { username: user, password: pass, datetime: new Date()};
        addUser(registerObj, res);
    }
});

async function addUser(registerObj, res){
    // const registeUser = new loginModel({
    //     username: registerObj.username,
    //     password: registerObj.password
    // });
    // const token = await registeUser.generateAuthToken();
    // console.log("Token: "+token);
    let tableRecords = await getAllData();
    

    let checkUserExists = tableRecords.find((obj)=>{
        if(obj.username == registerObj.username){
            return obj;
        }
    });

    if(checkUserExists){
        // res.status(500).send("Username Already exists.Please use another name");
        res.render('pages/register',{ registerResult: "Username Already exists.Please use another name", textColor: "text-danger"});
    }else{

        let hashedPass = await securePassword(registerObj);
        // console.log(hashedPass);
        registerObj.password = hashedPass;
        let registerModel = new loginModel(registerObj);
        registerModel.save((err)=>{
            if(err)
                res.sendStatus(500);
            else
                // res.status(200).send("User Registered"); 
                res.render('pages/register',{ registerResult: "User Registered" , textColor: "text-success"});
        })
    }
}

// loginModel.methods.generateAuthToken = async function(){
//     try{
//         const token = jwt.sign({_id: this._id.toString()} , "mynameisashutoshgorke");
//     }catch(error){
//         res.send("The Error Part: "+ error);
//         console.log("The Error Part: "+ error);
//     }
// }

function securePassword(obj){
    let pass = bcrypt.hash(obj.password, 10);
    return pass;
}

// function validateLoginFileds(loginObj){
//     const schema = Joi.object({
//         username: Joi.string().required(),
//         password: Joi.string().required()
//     });
//     const validateFields = schema.validate(loginObj);
//     return validateFields;
// }

// const createToken = async () => {
//     const token =  await jwt.sign({_id:"621e032351ce4271135f50c8", name: "Ashutosh"}, "gakdgkwgdkgwkdgawgdawgdawgdkagwkdgawkd" , { expiresIn: "2 seconds"});
//     console.log(token);

//     const userVar = await jwt.verify(token, "gakdgkwgdkgwkdgawgdawgdawgdkagwkdgawkd");
//     console.log(userVar);
// }
// createToken();
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