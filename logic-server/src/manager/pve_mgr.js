
var Pve = require("../class/pve.js");

function PveMgr() {

}

PveMgr.prototype.init = function(player) {

	g_logger.print.info("初始化pve游戏数据");
	return new Promise(function(resolve, reject) {
		
		var rid = player.rid;// 角色id
		g_db_api.findOne("pve", [{rid: rid}, {_id: 0}], function(err, ret) {

			if (err) {
				g_logger.print.error("查找pve数据库失败" + err);
				reject();
				return;
			}

			var cfg = {
				rid: rid
			};
			if (ret) {
				cfg = ret;
			}
			
			player.pve = new Pve(cfg);
			if (!ret) {
				player.pve.setPveData();
			}
			resolve();
		});
	});
}


//========================
//========================
//========================
//====  关卡副本开始游戏
//========================
//========================
//========================
PveMgr.prototype.startGame = function(player, data) {

	var msg = {
		id: g_CONST.PROTO.GAME_START,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	
	if (!data || !data.id) {
		g_logger.print.error("参数错误" + data);
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		msg.data.isBat = 0;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	var pve = player.pve;
	if (!pve) {
		g_logger.print.error("游戏数据错误" + player.rid);
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		msg.data.isBat = 0;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	var rid = player.rid;// 角色id
	var id = data.id;// 关卡id
	
	// 判断关卡是否开启
	if (!player.level.isOpenLevel(id) ) {
		msg.error = g_CONST.ERROR.LEVEL_NO_ONPEN;
		msg.data.isBat = 0;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	// 记录开始关卡时间
	// 验证选择的道具
	
	// 开始
	pve.startGame(player, id);

	// 返回玩家数据
	msg.data.isBat = 1;
	player.socket.send(JSON.stringify(msg) );
}
// 结束游戏
PveMgr.prototype.endGame = function(player, data) {

	var msg = {
		id: g_CONST.PROTO.GAME_END,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	if (!data || !data.id) {
		g_logger.print.error("参数错误" + data);
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	var pve = player.pve;
	if (!pve) {
		g_logger.print.error("游戏数据错误" + player.rid);
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	var id = data.id;// 关卡id
	var result = data.result;// 游戏结果
	var star = data.star || 0;// 通关星数
	var time = data.time || 0;// 通关时间
	var score = data.score || 0;// 通关积分
	var list = data.list || [];// 战斗消耗道具
	if (result) {
		pve.pveWin(player, id, star, time, score, list);
	} else {
		pve.pveLose(player, list);
	}
}


//=======================
//=======================
//=======================
//========    每日挑战
//=======================
//=======================
//=======================
PveMgr.prototype.startDayGame = function(player, data) {

	var msg = {
		id: g_CONST.PROTO.GAME_DAY_START,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	if (!data || !data.id) {
		g_logger.print.error("参数错误" + data);
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		msg.data.isBat = 0;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	var pve = player.pve;
	if (!pve) {
		g_logger.print.error("游戏数据错误" + player.rid);
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		msg.data.isBat = 0;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	var id = data.id;
	pve.startDayGame(player, id);

	msg.data.isBat = 1;
	player.socket.send(JSON.stringify(msg) );
}

PveMgr.prototype.endDayGame = function(player, data) {

	var msg = {
		id: g_CONST.PROTO.GAME_DAY_END,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	if (!data || !data.id) {
		g_logger.print.error("参数错误" + data);
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	var pve = player.pve;
	if (!pve) {
		g_logger.print.error("游戏数据错误" + player.rid);
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	var id = data.id;
	var result = data.result;
	var star = data.star;
	var time = data.time;
	var score = data.score;
	if (result) {
		pve.pveDayWin(player, id, star, time, score);
	} else {
		pve.pveDayLose();
	}
}


// 每日挑战倒计时
PveMgr.prototype.getPveDayResetTime = function(player) {

	if (!player || !player.pve) {
		g_logger.print.error("参数错误" + player);
		return 0;
	}

	var pve = player.pve;
	return pve.getStartNextTime();
}

module.exports = new PveMgr();


