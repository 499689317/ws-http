
// ================
// ================
// ================
// 广告奖励
// ================
// ================
// ================
var Advertis = require("../class/advertis.js");
function AdvertisMgr() {
	
};


AdvertisMgr.prototype.init = function(player) {
	
	g_logger.print.info("初始化广告奖励系统");
	return new Promise(function(resolve, reject) {
		player.advertis = new Advertis();
		resolve();
	});
};

// 同步广告奖励
AdvertisMgr.prototype.setAdvertisReward = function(player, data) {

	var msg = {
		id: g_CONST.PROTO.ADVERTIS_REWARD,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	if (!data || !data.type) {
		g_logger.print.error("参数错误");
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	var advertis = player.advertis;
	if (!advertis) {
		g_logger.print.error("游戏模块错误");
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	var type = data.type;
	g_logger.print.info(type);
	if (type == 3) {
		var isShowAd = advertis.calcRandom(type);
		g_logger.print.info(isShowAd);
		// 体力返回一点
		// =========
		// =========广告=======
		var rew = [{
			iid: g_handle.item_mgr.getCurrencyId("power"),
			num: 1
		}];
		advertis.cacheAdvertisRew(type, rew);
	}

	if (!advertis.isShowAdvertis() ) {
		g_logger.print.error("未展示过广告");
		msg.error = g_CONST.ERROR.ADVERTIS_NO_SHOW;
		player.socket.send(JSON.stringify(msg) );
		return ;
	}
	
	var reward = advertis.setAdvertisRew(player);
	msg.data.reward = reward;
	player.socket.send(JSON.stringify(msg) );
};

module.exports = new AdvertisMgr();


