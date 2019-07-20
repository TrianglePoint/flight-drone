const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const loadPage = require(`${__dirname}/routes/loadPage`);

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
  var index = droneDatas.findIndex((data)=>{
      return data.id == json.id;
  });
  
  droneDatas.splice(index, 1);
}

app.get('/', loadPage.main);

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

  socket.on('transmit drone data', (json)=>{
    if(json.id){
      updateDroneData(json);
      /*
       * Transmit data to everyone except the provider of data.
       */
      socket.broadcast.emit('update someone drone', json);
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