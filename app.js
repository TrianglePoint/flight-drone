const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const loadPage = require(`${__dirname}/routes/loadPage`);
const loadJS = require(`${__dirname}/routes/loadJS`);

let port = 3000;

let droneDatas = [];

function updateDroneData(json){
  var found = droneDatas.find((data)=>{
      return data.id == json.id;
  });
  
  if(found){
    found.x = json.x;
    found.y = json.y;
    found.speedX = json.speedX;
    found.speedY = json.speedY;
    found.width = json.width;
    found.height = json.height;
  }
}

function getDroneDataAsId(id){
  return droneDatas.find((data)=>{
      return data.id == id;
  });
}

function removeDroneDataAsJSON(json){
  if(json){
    var index = droneDatas.findIndex((data)=>{
        return data.id == json.id;
    });
    
    droneDatas.splice(index, 1);
  }
}

function isCollision(clientObject){

  for(var i = 0; i < droneDatas.length; i++){
    let serverData = {
      id: droneDatas[i].id,
      x0: droneDatas[i].x,
      y0: droneDatas[i].y,
      x1: droneDatas[i].x + droneDatas[i].width,
      y1: droneDatas[i].y + droneDatas[i].height
    }
    let clientData = {
      id: clientObject.id,
      x0: clientObject.x,
      y0: clientObject.y,
      x1: clientObject.x + clientObject.width,
      y1: clientObject.y + clientObject.height
    }
    
    if(serverData.id != clientData.id &&
    serverData.x0 <= clientData.x1 && 
    serverData.x1 >= clientData.x0 && 
    serverData.y0 <= clientData.y1 && 
    serverData.y1 >= clientData.y0){

        return true;
    }
  }

  return false;
}

app.get('/', loadPage.drone);

app.get('/js/common.js', loadJS.common);
app.get('/js/drone.js', loadJS.drone);
app.get('/js/chat.js', loadJS.chat);

io.on('connection', (socket)=>{
  console.log(`a user connected ${socket.id}`);

  for(var i = 0; i < droneDatas.length; i++){
    socket.emit('create someone drone', droneDatas[i]);
  }

  socket.on('created drone', (json)=>{
    if(json.id){
      droneDatas.push(json);
      socket.broadcast.emit('create someone drone', json);
    }
  });

  socket.on('collision with other drone', (json)=>{
    io.sockets.to(json.id).emit('change speed', json);
  });

  socket.on('transmit drone data', (json)=>{
    if(json.id){
      if(!isCollision(json)){
        updateDroneData(json);
        /*
        * Transmit data to everyone except the provider of data.
        */
        socket.broadcast.emit('update someone drone', json);
      }
    }
  });

  socket.on('send message', (json)=>{
    if(json.id){
      json.id = json.id.substring(0, 4);
      io.emit('new message', json);
    }
  });

  socket.on('disconnect', ()=>{
    console.log(`user disconnected ${socket.id}`);
    var found = getDroneDataAsId(socket.id);

    socket.broadcast.emit('remove someone drone', found);
    
    removeDroneDataAsJSON(found);
  });

});

http.listen(port, ()=>{
  console.log(`listening ${port}`);
})