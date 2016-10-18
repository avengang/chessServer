var http = require("http");
var io= require("socket.io"); 
var server = http.createServer(function(request, response){
    response.writeHead(200,{"Content-Type":"text/html"});
    response.write("socket.io Start~~~~~~~~~~~~");
    response.end("");
}).listen(80);

var io= io.listen(server); 

//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;

io.on('connection', function(socket){
	console.log('a user connected');
	
	//监听新用户加入
	socket.on('login', function(obj){
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
	});
	
	//监听用户退出
	socket.on('disconnect', function(){
		//将退出的用户从在线列表中删除
		if(onlineUsers.hasOwnProperty(socket.name)) {
			//退出用户的信息
			var obj = {userid:socket.name, username:onlineUsers[socket.name]};
			
			//删除
			delete onlineUsers[socket.name];
			//在线人数-1
			onlineCount--;
			
			//向所有客户端广播用户退出
			io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
			console.log(obj.username+'退出了聊天室');
		}
	});
	
	//监听用户发布聊天内容
	socket.on('message', function(obj){
		//向所有客户端广播发布的消息
		io.emit('message', obj);
		console.log(obj.username+'说：'+obj.content);
	});
  
});

http.listen(80, function(){
	console.log('listening on *:80');
});

