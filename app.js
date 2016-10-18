var http = require("http");
var io= require("socket.io"); 
var server = http.createServer(function(request, response){
    response.writeHead(200,{"Content-Type":"text/html"});
    response.write("WebSocket Start~~~~~~~~~~~~");
    response.end("");
}).listen(80);

var socket= io.listen(server); 

// 添加一个连接监听器
socket.on("connection", function(client){ 

  client.on("message",function(event){ 
    console.log("Received message from client!",event); 
    client.emit("emitMessage", { hello: "messgge received, wish you happy"+new Date().toString() });
    db();
    client.emit("emitMessage", { hello: "messgge received1, wish you happy"+new Date().toString() });
  }); 
  client.on("disconnect",function(){ 
   // clearInterval(interval); 
    console.log("Server has disconnected"); 
  }); 
  client.send("hello, I am the server");
});


function db() {
	var MongoClient = require('mongodb').MongoClient;
	var DB_CONN_STR = 'mongodb://192.168.1.19:27017/d5459f61-def0-4735-8906-ad263a055ee2';    
	
	var insertData = function(db, callback) {  
	    //连接到表  
	    var collection = db.collection('tb2');
	    //插入数据
	    var data = [{"name":'wilson001',"age":21},{"name":'wilson002',"age":22}];
	    collection.insert(data, function(err, result) { 
	        if(err)
	        {
	            console.log('Error:'+ err);
	            return;
	        }     
	        callback(result);
	    });
	}
	
	MongoClient.connect(DB_CONN_STR, function(err, db) {
	    console.log("连接成功！");
	    insertData(db, function(result) {
	        console.log(result);
	        db.close();
	    });
	});
}
