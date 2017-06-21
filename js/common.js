var _commonFns = {};
function init(chessInfo) {

    var levelPool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    var positionPool = [
        {i:0, j:0}, {i:1, j:0}, {i:2, j:0}, {i:3, j:0}, {i:4, j:0},
        {i:0, j:1}, {i:1, j:1}, {i:2, j:1}, {i:3, j:1}, {i:4, j:1},
        {i:0, j:3}, {i:1, j:3}, {i:2, j:3}, {i:3, j:3}, {i:4, j:3},
        {i:0, j:4}, {i:1, j:4}, {i:2, j:4}, {i:3, j:4}, {i:4, j:4}
    ];

    for(var i=0;i<20;i++) {
        var r1 = Math.floor(Math.random()*levelPool.length);
        var level = levelPool[r1];
        chessInfo.push({
            level: level>9?level-10:level,
            isBlack: level>9,
            mask: true,
            i: positionPool[i].i,
            j: positionPool[i].j,
            selected: false
        });
        levelPool.splice(levelPool.indexOf(level), 1);
    }
}
function gaming(chessInfo, index, user, i, j, fn) {

    var chess = chessInfo[index];
    var mountainArr = [0, 1, 2, 3, 4, 5, 8, 9];//能上山的列表
    var waterArr = [0, 1, 7, 9];//等淌水的列表
    var holeArr = [0, 1, 2, 3, 4, 5, 9];//能进洞的列表
    
    if(user.selectChess!=null) chessInfo[user.selectChess].selected = false;

    if(index != undefined) {

        if(chess.mask) {

            if(user.selectChess!=null) {
                chessInfo[index].selected = true;
                fn && fn(true);
            } else {
                fn && fn();
                chessInfo[index].mask = false;
            }
        } else if(chess.isBlack==user.isBlack) {

            if(user.selectChess==null) {
                chessInfo[index].selected = true;
                user.selectChess = index;
                fn && fn(true);
            } else {

                if(user.selectChess!=index) {
                    chessInfo[index].selected = true;
                    user.selectChess = index;
                    fn && fn(true);
                } else {
                    chessInfo[index].selected = false;
                    user.selectChess = null;
                    fn && fn(true);
                }
            }
        } else if(chess.isBlack!=user.isBlack) {

            if(user.selectChess!=null) {
                var selectChess = chessInfo[user.selectChess];
                function goFn() {
                	
                	function isSuccess() {//如果双方的最大棋等级不同则表示有较大等级的一方胜利
                		
                		var maxWhite = -1;
                		var maxBlack = -1;
                		
                		for(var i=0,ii=chessInfo.length;i<ii;i++) {
                			
                			if(chessInfo[i].isBlack) {
                				if(+chessInfo[i].level > maxBlack) maxBlack = +chessInfo[i].level;
                			} else {
                				if(+chessInfo[i].level > maxWhite) maxWhite = +chessInfo[i].level;
                			}
                		}
console.log(maxBlack, maxWhite);
                		if(maxBlack > maxWhite) console.log("黑方胜");
            			if(maxWhite > maxBlack) console.log("白方胜");
                	}

                    if(((selectChess.level!=7&&chess.level!=0) && (selectChess.level>chess.level))
                        || (selectChess.level==0&&chess.level==7)) {//等级更高吃掉或者鼠吃象

                        if(i==selectChess.i && Math.abs(selectChess.j-j)==1) {
                            chessInfo[user.selectChess].j = j;
                            chessInfo.splice(index, 1);
                            isSuccess();
                            fn && fn();
                        } else if(j==selectChess.j && Math.abs(selectChess.i-i)==1) {
                            chessInfo[user.selectChess].i = i;
                            chessInfo.splice(index, 1);
                            isSuccess();
                            fn && fn();
                        } else {
                            fn && fn(true);
                        }
                    } else if(selectChess.level == chess.level) {//同归于尽

                        if((i==selectChess.i && Math.abs(selectChess.j-j)==1)
                            || (j==selectChess.j && Math.abs(selectChess.i-i)==1)) {
                            var maxIndex = Math.max(user.selectChess, index);
                            chessInfo.splice(maxIndex, 1);
                            chessInfo.splice(maxIndex==user.selectChess?index:user.selectChess, 1);
                            isSuccess();
                            fn && fn();
                        } else {
                            fn && fn(true);
                        }
                    } else {
                        fn && fn(true);
                    }
                }

				if(j==2) {
					//如果对方棋在(i:1, j:2)、(i:2, j:2)、(i:3, j:2)则需要判断当前自己的棋是否可以进入该位置
	                if(i==1) {//山
	                	if(mountainArr.indexOf(selectChess.level)!=-1) {
	                		goFn();
	                	} else {
	                		user.selectChess = null;
	                		fn && fn(true);
	                		return;
	                	}
	                } else if(i==2){//水
	                	if(waterArr.indexOf(selectChess.level)!=-1) {
	                		goFn();
	                	} else {
	                		user.selectChess = null;
	                		fn && fn(true);
	                		return;
	                	}
	                } else if(i==3){//洞
	                	if(holeArr.indexOf(selectChess.level)!=-1) {
	                		goFn();
	                	} else {
	                		user.selectChess = null;
	                		fn && fn(true);
	                		return;
	                	}
	                } else {//i==0||i==4
	                	goFn();
	                }
				} else {
                    goFn();
				}
                user.selectChess = null;
            }
        }
    } else {//点击空格子

        if(user.selectChess==null) {//没有选棋
            return;
        }
        var selectChess = chessInfo[user.selectChess];
        var goFn = function () {

            if(i==selectChess.i && Math.abs(selectChess.j-j)==1) {//上下走了一步
                fn && fn();
                chessInfo[user.selectChess].j = j;
            } else if(j==selectChess.j && Math.abs(selectChess.i-i)==1) {//左右走了一步
                fn && fn();
                chessInfo[user.selectChess].i = i;
            }
        };

		if(j==2) {
			//如果对方棋在(i:1, j:2)、(i:2, j:2)、(i:3, j:2)则需要判断当前自己的棋是否可以进入该位置
            if(i==1) {//山
            	if(mountainArr.indexOf(selectChess.level)!=-1) {
            		goFn();
            	} else {
            		user.selectChess = null;
            		fn && fn(true);
            		return;
            	}
            } else if(i==2){//水
            	if(waterArr.indexOf(selectChess.level)!=-1) {
            		goFn();
            	} else {
            		user.selectChess = null;
            		fn && fn(true);
            		return;
            	}
            } else if(i==3){//洞
            	if(holeArr.indexOf(selectChess.level)!=-1) {
            		goFn();
            	} else {
            		user.selectChess = null;
            		fn && fn(true);
            		return;
            	}
            } else {//i==0||i==4
            	goFn();
            }
		} else {
            goFn();
		}
		user.selectChess = null;
    }
}
_commonFns.init = init;
_commonFns.gaming = gaming;
module.exports = _commonFns;