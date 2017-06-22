//连接数据库
var mysql  = require('mysql');  //调用MySQL模块

var connection = null;
function connect() {//创建一个connection
	connection = mysql.createConnection({     
	  host     : '112.74.199.52',       //主机
	  user     : 'lnet',               //MySQL认证用户名
	  password : 'lnet',        //MySQL认证用户密码
	  port: '3306',                   //端口号
	  database:'zhan_chess'
	}); 
	//连接
	connection.connect(function(err){
	    if(err){        
	          console.log('[query] - :'+err);
	        return;
	    }
      console.log('[connection connect]  succeed!');
	});  
}

function select() {//执行SQL语句
	connection.query('select * from `users`', function(err, rows, fields) { 
	     if (err) {
	             console.log('[query] - :'+err);
	        return;
	     }
	     console.log('查询结果为: ', rows);
	});  
}

function close() {
	//关闭connection
	connection.end(function(err){
	    if(err){        
	        return;
	    }
	      console.log('[connection end] succeed!');
	});
}

module.exports = {
	connect,
	select,
	close
};