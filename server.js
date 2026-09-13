const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const rooms = new Map();

function roomState(room){
  return rooms.get(room) || {clients:new Set(), state:{}};
}
function broadcast(room, msg, except=null){
  const r=rooms.get(room); if(!r)return;
  const data=JSON.stringify(msg);
  for(const c of r.clients) if(c!==except && c.readyState===WebSocket.OPEN)c.send(data);
}

const server=http.createServer((req,res)=>{
  let p=req.url.split('?')[0];
  if(p==='/')p='/index.html';
  const file=path.join(__dirname,'public',p);
  if(!file.startsWith(path.join(__dirname,'public')))return res.writeHead(403).end();
  fs.readFile(file,(err,data)=>{
    if(err)return res.writeHead(404).end('Not found');
    const ext=path.extname(file);
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'});
    res.end(data);
  });
});

const wss=new WebSocket.Server({server});
wss.on('connection',ws=>{
  let room=null;
  ws.on('message',raw=>{
    let m; try{m=JSON.parse(raw)}catch{return}
    if(m.type==='join'){
      room=m.room;
      if(!rooms.has(room))rooms.set(room,{clients:new Set(),state:{}});
      const r=rooms.get(room);r.clients.add(ws);
      ws.send(JSON.stringify({type:'state',...r.state}));
      return;
    }
    if(!room)return;
    const r=rooms.get(room);
    if(m.type==='state'){
      r.state={type:'state',active:m.active,angle:m.angle,spinning:m.spinning,velocity:m.velocity,pendingWinner:m.pendingWinner,round:m.round,results:m.results};
      broadcast(room,r.state,ws);
    }else if(m.type==='event'){
      broadcast(room,{type:'event',event:m.event,angle:m.angle,pendingWinner:m.pendingWinner,active:m.active,results:m.results},ws);
    }
  });
  ws.on('close',()=>{
    if(room&&rooms.has(room)){
      const r=rooms.get(room);r.clients.delete(ws);
      if(!r.clients.size)rooms.delete(room);
    }
  });
});
server.listen(PORT,()=>console.log(`Chitti realtime server on ${PORT}`));
