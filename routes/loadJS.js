const fs = require('fs');

function load_common(req, res){
    fs.readFile('./public/javascripts/common.js', (err, body)=>{
        if(err) throw err;

        res.write(body);
        res.end();
    });
}

function load_drone(req, res){
    fs.readFile('./public/javascripts/drone.js', (err, body)=>{
        if(err) throw err;

        res.write(body);
        res.end();
    });
}

function load_chat(req, res){
    fs.readFile('./public/javascripts/chat.js', (err, body)=>{
        if(err) throw err;

        res.write(body);
        res.end();
    });
}

module.exports = {
    common: load_common,
    drone: load_drone,
    chat: load_chat
}