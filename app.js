const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const loadPage = require(`${__dirname}/routes/loadPage`);

let port = 3000;

app.get('/', loadPage.main);

io.on('connection', (socket)=>{
  console.log('a user connected');
  socket.on('disconnect', ()=>{
    console.log('user disconnected');
  });
});

http.listen(port, ()=>{
  console.log(`listening ${port}`);
})