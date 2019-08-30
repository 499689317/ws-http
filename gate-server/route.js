
// 处理接口

var route = {};
module.exports = route;

// OpenResty健康检查
route["game/live"] = function(req, res, data) {
	// console.log(data);
	res.end(null);
};

// 注册玩家
route["login/register"] = function(req, res, data) {
	g_handle.login_mgr.register(req, res, data);
};

// 登录游戏
route["login/enter_game"] = function(req, res, data) {
	g_handle.login_mgr.enterGame(req, res, data);
};


// 游客登录
route["login/visitor"] = function(req, res, data) {
	g_handle.login_mgr.visitorLogin(req, res, data);
};


// 更新apk
route["update/apk"] = function(req, res, data) {
	g_handle.update_mgr.updateApkForClient(req, res, data);
};




// 更新逻辑服务器当前socket连接数
route["update/connect"] = function(req, res, data) {
	g_handle.login_mgr.updateConnect(req, res, data);
};

// 公告
route["game/notice"] = function(req, res, data) {
	g_handle.notice_mgr.getNotice(req, res, data);
};



