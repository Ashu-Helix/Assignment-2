const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const res = require('express/lib/response');
const { use } = require('express/lib/application');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended:true}));

var dbUrl = "mongodb+srv://admin:admin@cluster0.gikvy.mongodb.net/loginDB?retryWrites=true&w=majority";
const loginSchema = new mongoose.Schema({
    username: String,
    password: String
});
var loginModel = mongoose.model('loginSchema',loginSchema);

app.use(express.static(__dirname));

app.post('/login', (req, res)=>{
    let username = req.body.username;
    let password = req.body.password;
    console.log("Username: "+username+" Password: "+password);
    // res.send("Username: "+username+" Password: "+password);
    let result = validatLogin(username, password, res);
});

async function validatLogin(user, pass, res){
    let loginRecords = await getAllData();

    // console.log(loginRecords);
    let getRecord = loginRecords.find((obj)=>{
        if(obj.username == user && obj.password == pass){
            return obj;
        }
    });
    // res.send(getRecord);

    if(!getRecord){
        res.send("Invalid Login");
    }else{
        res.send("Login Successful");
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