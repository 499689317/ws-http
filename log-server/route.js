
var route = {};
module.exports = route;

// 当前服务器在线人数
route["online/count"] = function(req, res, data) {
	g_handle.log_mgr.calcOnline(req, res, data);
};
// 注册游戏人数
route["game/regist"] = function(req, res, data) {
	g_handle.log_mgr.calcRegist(req, res, data);
};
// 从逻辑服务器获取当前登录游戏人数
route["game/login"] = function(req, res, data) {
	g_handle.log_mgr.calcLogin(req, res, data);
};
// 从账号服务器获取登录游戏人数
route["game/all/login"] = function(req, res, data) {
	g_handle.log_mgr.calcAllPlayerLogin(req, res, data);
};
// 玩家登录游戏详细
route["player/login"] = function(req, res, data) {
	g_handle.log_mgr.calcPlayerLogin(req, res, data);
};

// 记录游戏详细数据
route["game/detail"] = function(req, res, data) {
	g_handle.detail_log_mgr.updateLogData(req, res, data);
}

route["get/player/login"] = function(req, res, data) {
	g_handle.gm_mgr.getPlayerLogin(req, res, data);
};
route["get/online"] = function(req, res, data) {
	g_handle.gm_mgr.getOnline(req, res, data);
};
route["get/go/back"] = function(req, res, data) {
	g_handle.gm_mgr.getGoBack(req, res, data);
};
route["get/go/leave"] = function(req, res, data) {
	g_handle.gm_mgr.getGoLeave(req, res, data);
};
route["get/regist"] = function(req, res, data) {
	g_handle.gm_mgr.getRegist(req, res, data);
};





