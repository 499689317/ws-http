
var Sign = require("../class/sign.js");

// 签到系统
function SignMgr() {

}

SignMgr.prototype.init = function(player) {

	g_logger.print.info("初始化玩家签到数据");
	return new Promise(function(resolve, reject) {
		
		var rid = player.rid;// 角色id
		g_db_api.findOne("user_sign", [{rid: rid}, {_id: 0}], function(err, ret) {

			if (err) {
				g_logger.print.error("查找user_sign数据库失败" + err);
				reject();
				return;
			}
			let cfg = {rid: rid};
			if (ret) {
				cfg = ret;
			}		
			player.sign = new Sign(cfg);
			resolve();
		});
	});
}

SignMgr.prototype.getBaseInfo = function(player, data) {

	var msg = {
		id: g_CONST.PROTO.SIGN_BASE_INFO,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};

	var sign = player.sign;
	if (!sign) {
		g_logger.print.error("模块数据错误");
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	var month = sign.getCurrMonth();
	var list = sign.getBonusByMonth(month);
	g_logger.print.info(list);
	msg.data.list = list;
	player.socket.send(JSON.stringify(msg) );
}

// 签到接口
SignMgr.prototype.signIn = function(player, data) {

	var msg = {
		id: g_CONST.PROTO.SIGN_IN,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	var sign = player.sign;
	if (!sign) {
		g_logger.print.error("模块数据错误");
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	// 签到条件不满足
	if (!sign.isCanSignIn() ) {
		g_logger.print.error("签到条件不满足");
		msg.error = g_CONST.ERROR.SIGN_NO_IN;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	var rew = sign.setSignRew(player, false);

	// =========
	// =========广告=======
	var adType = 2;
	var isShowAd = player.advertis.calcRandom(adType);
	if (isShowAd) {
		player.advertis.cacheAdvertisRew(adType, rew);
	}

	sign.setSignIn();
	sign.setDaySign();
	sign.setSignNum(false);
	sign.setSignList(false);
	msg.data.rew = rew;
	msg.data.isShowAd = isShowAd;
	player.socket.send(JSON.stringify(msg) );
}


// 补签接口
SignMgr.prototype.signLose = function(player, data) {

	var msg = {
		id: g_CONST.PROTO.SIGN_LOSE,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	var sign = player.sign;
	if (!sign) {
		g_logger.print.error("模块数据错误");
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	// 补签条件不满足
	if (!sign.isCanLoseSign() ) {
		g_logger.print.error("补签条件不满足");
		msg.error = g_CONST.ERROR.SIGN_NO_IN;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	sign.setSignRew(player, true);
	sign.setLoseSign();
	sign.setSignNum(true);
	sign.setSignList(true);
	player.socket.send(JSON.stringify(msg) );
}


module.exports = new SignMgr();




