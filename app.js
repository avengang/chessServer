var _commonFns = require("./js/common.js");
var db = require("./js/db.js");
var app = require('http').createServer(handler),
    io = require('socket.io').listen(app);

app.listen(8080);
db.connect();
db.select();
Array.prototype.remove = function (dx) {

    if (isNaN(dx) || dx > this.length) {
        return false;
    }

    for (var i = 0, n = 0; i < this.length; i++) {

        if (this[i] != this[dx]) {
            this[n++] = this[i]
        }
    }
    this.length -= 1
}
function handler(req, res) {

    res.end("hello");
}
var onlineSockets = [];

io.sockets.on('connection', function (socket) {
    onlineSockets.push(socket);

    socket.on('register', function (data) {

        console.log(data);
        //其他逻辑。。。

        socket.name = data.name;
    });
    socket.on('login', function (data) {

        console.log(data);
        //其他逻辑。。。

        socket.emit('loginSuccess');
//    socket.emit('loginSuccess', { reason: '密码错误' });
        socket.name = data.name;
    });
    socket.on('addFriend', function (data) {

        console.log(data);
        //其他逻辑。。。
    });
    socket.on('invite', function (data) {

        console.log(data);
        //其他逻辑。。。

        for (var i = 0, ii = onlineSockets.length; i < ii; i++) {

            if (onlineSockets[i].name == data.name) {
                var friend = onlineSockets[i];
                break;
            }
        }

        if (friend) {
            friend.emit("invite", {name: socket.name});
        } else {
            socket.emit('inviteError', {reason: "好友不存在或者没在线！"});
        }
    });
    socket.on('inviteNO', function (data) {

        console.log(data);
        for (var i = 0, ii = onlineSockets.length; i < ii; i++) {

            if (onlineSockets[i] == socket) continue;

            if (onlineSockets[i].name == data.name) {
                onlineSockets[i].emit("inviteNO");
            }
        }
    });
    socket.on('inviteOK', function (data) {

        console.log(data);
        //其他逻辑。。。

        for (var i = 0, ii = onlineSockets.length; i < ii; i++) {

            if (onlineSockets[i] == socket) continue;

            if (onlineSockets[i].name == data.name) {
                var friend = onlineSockets[i];

                if (friend.gameSocket) {
                    socket.emit('inviteError', {reason: "好友正在玩游戏！"});
                    return;//如果已经在玩游戏就去掉
                }
                socket.gameSocket = friend;
                friend.gameSocket = socket;
                var chessInfo = [];
                _commonFns.init(chessInfo);
                socket.chessInfo = chessInfo;
                friend.chessInfo = chessInfo;
                var type = Math.floor(Math.random() * 2);//0:socket black;1:friend black
                socket.user = {
                    isBlack: type == 0,
                    selectChess: null,
                    myTurn: type == 0
                };
                friend.user = {
                    isBlack: type == 1,
                    selectChess: null,
                    myTurn: type == 1
                };
                socket.emit("init", {
                    user: socket.user,
                    chessInfo: chessInfo,
                    otherName: friend.name
                });
                friend.emit("init", {
                    user: friend.user,
                    chessInfo: chessInfo,
                    otherName: socket.name
                });
                return;
            }
        }
        socket.emit('inviteError', {reason: "好友没在线！"});
    });
    socket.on('match', function (data) {

        console.log(data);
        //其他逻辑。。。

        if (onlineSockets.length == 0 || onlineSockets.length == 1) {//1：表示只有当前登录人
            socket.emit("matchError", {reason: "没有其他在线的用户"});
            return;
        }
        var othersSockets = [];

        for (var i = 0, j = 0, ii = onlineSockets.length; i < ii; i++) {

            if (onlineSockets[i] == socket || onlineSockets[i].gameSocket) continue;//自己或者已经在玩游戏的去掉
            othersSockets[j++] = onlineSockets[i];
        }

        if (othersSockets.length == 0) {
            socket.emit("matchError", {reason: "没有其他在线的用户"});
            return;
        }
        var index = Math.floor(Math.random() * othersSockets.length);
        var other = othersSockets[index];
        socket.gameSocket = other;
        other.gameSocket = socket;
        var chessInfo = [];
        _commonFns.init(chessInfo);
        socket.chessInfo = chessInfo;
        other.chessInfo = chessInfo;
        var type = Math.floor(Math.random() * 2);//0:socket black;1:other black
        socket.user = {
            isBlack: type == 0,
            selectChess: null,
            myTurn: type == 0
        };
        other.user = {
            isBlack: type == 1,
            selectChess: null,
            myTurn: type == 1
        };
        socket.emit("init", {
            user: socket.user,
            chessInfo: chessInfo,
            otherName: other.name
        });
        other.emit("init", {
            user: other.user,
            chessInfo: chessInfo,
            otherName: socket.name
        });
    });
    socket.on('gaming', function (data) {

console.log(data);
        var gameUser = {//user对象会被服务器common.js里面的逻辑改变，所以现在这里备份一份执行前的对象给客户端执行
            isBlack: socket.user.isBlack,
            selectChess: socket.user.selectChess,
            myTurn: socket.user.myTurn
        };
        _commonFns.gaming(socket.chessInfo, data.index, socket.user, data.i, data.j, function (isSelect) {

            socket.emit("gaming", {index: data.index, myTurn: socket.user.myTurn, i: data.i, j: data.j, gameUser: gameUser, isSelect: isSelect});
            socket.gameSocket.emit("gaming", {index: data.index, myTurn: socket.gameSocket.user.myTurn, i: data.i, j: data.j, gameUser: gameUser, isSelect: isSelect});

            if(!isSelect) {//表示走了棋，而不是选择棋
                socket.user.myTurn = !socket.user.myTurn;
                socket.gameSocket.user.myTurn = !socket.gameSocket.user.myTurn;
            }
        }, function(isBlackSuccess) {
        	
        	if(socket.user.isBlack == isBlackSuccess) {
        		socket.emit("win");
        		socket.gameSocket.emit("fail");
        	} else {
        		socket.emit("fail");
        		socket.gameSocket.emit("win");
        	}
        });
    });
    socket.on('disconnect', function (data) {

        onlineSockets.splice(onlineSockets.indexOf(socket), 1);
    });
});
