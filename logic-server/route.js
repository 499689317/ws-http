
// 处理接口

var route = {};
module.exports = route;


// 建立连接
route[g_CONST.PROTO.CONNECTE] = function(socket, msg) {
	socket.send(JSON.stringify({id: g_CONST.PROTO.CONNECTE, error: g_CONST.ERROR.SUCCESS, data: {} }) );
};
// 关闭连接
route[g_CONST.PROTO.CLOSE] = function(socket, msg) {
	if (!socket.player) {
		g_logger.print.error(socket.player);
		// socket未挂载玩家实例（玩家在在线队列中，心跳检测socket会进这个分支）
		g_logger.print.error("销毁玩家出严重错误了" + msg);
		return;
	};
	g_handle.player_mgr.destroy(socket.player.rid, msg);
};

// 登录
route[g_CONST.PROTO.LOGIN_LOGIN] = function(socket, msg) {
	g_handle.player_mgr.login(socket, msg);
};
// 创建新用户
route[g_CONST.PROTO.LOGIN_CREATE_PLAYER] = function(socket, msg) {
	g_handle.player_mgr.createPlayer(socket, msg);
};
// 进入游戏
route[g_CONST.PROTO.LOGIN_ENTERGAME] = function(socket, msg) {

	if (!socket || !socket.player) {
		g_logger.print.error(socket.player);
		// 玩家登录时在在线队列(玩家已在线或玩家频繁退出重进，可以考虑在这里销毁这个未挂载玩家的socket)
		g_logger.print.error("登录游戏出严重错误了");
		return;
	}
	socket.player.enterGame(msg);
};


// pve关卡
route[g_CONST.PROTO.GAME_START] = function(socket, msg) {
	g_handle.pve_mgr.startGame(socket.player, msg);
};
route[g_CONST.PROTO.GAME_END] = function(socket, msg) {
	g_handle.pve_mgr.endGame(socket.player, msg);
};
// 每日挑战
route[g_CONST.PROTO.GAME_DAY_START] = function(socket, msg) {
	g_handle.pve_mgr.startDayGame(socket.player, msg);
};
route[g_CONST.PROTO.GAME_DAY_END] = function(socket, msg) {
	g_handle.pve_mgr.endDayGame(socket.player, msg);
};


// 获取所有以开启章节id
route[g_CONST.PROTO.LEVEL_ALL_CHAPTER] = function(socket, msg) {
	g_handle.level_mgr.getAllChapter(socket.player, msg);
};

// 获取关卡列表
route[g_CONST.PROTO.LEVEL_LEVEL_LIST] = function(socket, msg) {
	g_handle.level_mgr.getLevelList(socket.player, msg);
};

// 开启新章节
route[g_CONST.PROTO.LEVEL_OPEN_CHAPTER] = function(socket, msg) {
	g_handle.level_mgr.openChapter(socket.player, msg);
};

// 结束新手引导
route[g_CONST.PROTO.GUIDE_END] = function(socket, msg) {
	g_handle.player_mgr.endGuild(socket.player, msg);
};
// 定时掉落
route[g_CONST.PROTO.ITEM_DROP] = function(socket, msg) {
	g_handle.player_mgr.getTimeDrop(socket.player, msg);
};

// 商城购买
route[g_CONST.PROTO.SHOP_BUY] = function(socket, msg) {
	g_handle.shop_mgr.userShopBuyMerch(socket.player, msg);
};
route[g_CONST.PROTO.SHOP_BUY_POWER] = function(socket, msg) {
	g_handle.shop_mgr.buyPower(socket.player, msg);
};
route[g_CONST.PROTO.SHOP_BUY_TIME] = function(socket, msg) {
	g_handle.shop_mgr.buyTime(socket.player, msg);
};

// 签到游戏数据
route[g_CONST.PROTO.SIGN_BASE_INFO] = function(socket, msg) {
	g_handle.sign_mgr.getBaseInfo(socket.player, msg);
};
// 签到
route[g_CONST.PROTO.SIGN_IN] = function(socket, msg) {
	g_handle.sign_mgr.signIn(socket.player, msg);
};
// 补签
route[g_CONST.PROTO.SIGN_LOSE] = function(socket, msg) {
	g_handle.sign_mgr.signLose(socket.player, msg);
};
// 领取广告奖励
route[g_CONST.PROTO.ADVERTIS_REWARD] = function(socket, msg) {
	g_handle.advertis_mgr.setAdvertisReward(socket.player, msg);
};

// gm
route["gm/open/level"] = function(req, res, data) {
	g_handle.gm_mgr.gmOpenLevel(req, res, data);
};
route["gm/player/info"] = function(req, res, data) {
	g_handle.gm_mgr.gmPlayerInfo(req, res, data);
};
route["gm/player/item"] = function(req, res, data) {
	g_handle.gm_mgr.gmPlayerItem(req, res, data);
};
route["gm/player/level"] = function(req, res, data) {
	g_handle.gm_mgr.gmPlayerLevel(req, res, data);
};
route["gm/statis/info"] = function(req, res, data) {
	g_handle.gm_mgr.gmStatisInfo(req, res, data);
};




