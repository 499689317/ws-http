
var Login = require("../class/login.js");
var sdk_tx = require("../untis/sdk/sdk_tx.js");
// 玩家登录管理
function LoginMgr() {
	this.login = null;
}

LoginMgr.prototype.init = function() {
	g_logger.print.info("初始化登录模块数据");
	// 返回一个Promise对象
	return new Promise(function(resolve, reject) {
		
		g_db_api.find("login", [{}, {_id: 0}], function(err, list) {
			
			if (err) {
				g_logger.print.error("查找login数据错误" + err);
				reject();
				return;
			}
			
			g_logger.print.info(list);
			var cfg = {};
			if (list && list.length) {
				cfg.ridSeed = list[0].ridSeed;// ridSeed
			}
			this.login = new Login(cfg);
			// 初始化逻辑服务器列表
			this.login.initServerList();
			resolve();
		}.bind(this));
	}.bind(this));
}

// 注册
LoginMgr.prototype.register = function(req, res, data) {
	
	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	if (!this.login) {
		g_logger.print.error("账号模块数据错误");
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	if (!data.acc || !data.psw) {
		g_logger.print.error("参数错误");
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	var acc = data.acc + "";// 账号强制为字符串类型
	var psw = data.psw + "";// 密码强制为字符串类型
	// 检测是否已创建
	g_db_api.findOne("account", [{acc: acc}, {_id: 0}], function(err, ret) {

		if (err) {
			g_logger.print.error("查找account数据库失败" + err);
			return;
		}
		if (ret) {
			g_logger.print.debug("账号已被注册过" + acc);
			msg.error = g_CONST.ERROR.LOGIN_REGISTED_ERROR;
			msg.data.rid = ret.rid;
			res.end(JSON.stringify(msg) );
		} else {

			// ========================
			// ========================
			// ========================
			// ======    申请新账号
			// ========================
			// ========================
			// ========================
			
			// 获取逻辑服信息
			var logic = this.login.getLogicAddress();
			if (!logic) {
				msg.error = g_CONST.ERROR.LOGIN_ADDRESS_ERROR;
				res.end(JSON.stringify(msg) );
				return;
			}
			// rid未申请成功，不能入库，肯定哪里出问题了
			var rid = this.login.loginLogic();
			if (!rid) {
				msg.error = g_CONST.ERROR.LOGIN_RID_ERROR;
				res.end(JSON.stringify(msg) );
				return;
			}
			msg.data.rid = rid;
			var info = {
				rid: rid,
				hostname: logic.hostname,
				port: logic.port,
				// sid: logic.sid,
				acc: acc,
				psw: psw
			};
			this.createPlayer(info, function(err) {

				if (err) {
					// 创建失败
					res.end(JSON.stringify({error: g_CONST.ERROR.LOGIN_DATABASE_ERROR}) );
					return;
				}
				// 创建成功
				res.end(JSON.stringify(msg) );
			});
		}
	}.bind(this));
}

// 生成新玩家
LoginMgr.prototype.createPlayer = function(info, cb) {

	var rid = info.rid;
	var acc = info.acc || "";// 游客创建不需要账号密码
	var psw = info.psw || "";

	var nowTime = Date.now();
	var con = {
		rid: rid,
		acc: acc,
		psw: psw,
		createTime: nowTime,
		loginTime: nowTime
	};
	
	if (!this.login) {
		g_logger.print.error("登录模块错误");
		cb && cb(1);
		return;
	}
	this.login.setPlayerData(con, cb);
}

// 登录
LoginMgr.prototype.enterGame = function(req, res, data) {
	
	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};

	if (!this.login) {
		g_logger.print.error("账号模块数据错误");
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	if (!data.acc || !data.psw) {
		g_logger.print.error("参数错误");
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}

	var acc = data.acc.toString();
	var psw = data.psw.toString();
	// 检测是否已注册过此账号
	g_db_api.findOne("account", [{acc: acc}, {_id: 0}], function(err, ret) {

		if (err) {
			g_logger.print.error("查找account数据库失败" + err);
			return;
		}

		if (ret) {

			// 验证密码
			var password = ret.psw;
			var rid = ret.rid;
			if (psw != password) {
				g_logger.print.error("密码错误" + psw);
				msg.error = g_CONST.ERROR.LOGIN_PASSWORD_ERROR;
				res.end(JSON.stringify(msg) );
				return;
			}

			// 获取服务器地址
			var logic = this.login.getLogicAddress();
			if (!logic) {
				msg.error = g_CONST.ERROR.LOGIN_ADDRESS_ERROR;
				res.end(JSON.stringify(msg) );
				return;
			}
			// 更新进入游戏时间
			this.login.setLoginTime(rid);
			g_logger.print.info("进入游戏ok" + acc);
			msg.data = {
				rid: rid,
				hostname: logic.hostname,
				port: logic.port
			};
			g_logger.print.info(msg);
			res.end(JSON.stringify(msg) );
		} else {
			// 账号未注册
			g_logger.print.info("账号还未注册" + acc);
			msg.error = g_CONST.ERROR.LOGIN_NOREGIST_ERROR;
			res.end(JSON.stringify(msg) );
		}
	}.bind(this));
}


// 游客登录
// 只有一个账号(使用用户设备唯一标识)
// 没有密码
LoginMgr.prototype.visitorLogin = function(req, res, data) {
	
	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: {},
	};
	if (!this.login) {
		g_logger.print.error("账号模块数据错误");
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	if (!data || !data.rid) {
		g_logger.print.error("参数错误");
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	var rid = data.rid + "";

	// 发送消息到log服务器，记录点过游戏的玩家
	var path = this.login.getLogServer() + "game/all/login";
	g_logger.print.info(path);
	var info = {
		rid: rid,
		time: Date.now()
	};
	g_http.post(path, JSON.stringify(info), function(opt, msg) {
    });

	// 检测是否已注册过此账号
	g_db_api.findOne("account", [{rid: rid}, {_id: 0}], function(err, ret) {

		if (err) {
			g_logger.print.error("查找account数据库失败" + err);
			return;
		}
		// 获取服务器地址
		var logic = this.login.getLogicAddress();
		if (!logic) {
			msg.error = g_CONST.ERROR.LOGIN_ADDRESS_ERROR;
			res.end(JSON.stringify(msg) );
			return;
		}
		if (ret) {
			
			// 更新进入游戏时间
			this.login.setLoginTime(rid);
			msg.data = {
				rid: rid,
				hostname: logic.hostname,
				port: logic.port
			};
			g_logger.print.info(msg);
			res.end(JSON.stringify(msg) );
		} else {
			
			msg.data = {
				rid: rid,
				hostname: logic.hostname,
				port: logic.port
			};
			this.createPlayer(msg.data, function(err) {

				if (err) {
					// 创建失败
					res.end(JSON.stringify({error: g_CONST.ERROR.LOGIN_DATABASE_ERROR}) );
					return;
				}
				// 创建成功
				res.end(JSON.stringify(msg) );
			});
		}
	}.bind(this));
}



// ======================
// ======================
// ======================
// =======    腾讯登录
// ======================
// ======================
// ======================

LoginMgr.prototype.txLogin = function(req, res, data) {
	
	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: {},
	};
	if (!this.login) {
		g_logger.print.error("账号模块数据错误");
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	if (!data || !data.info) {
		g_logger.print.error("参数错误");
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	g_logger.print.info(data.info);

	// 发送消息到log服务器，记录点过游戏的玩家

	// 验证账号
	var info = data.info;
	sdk_tx.login(info, function(msg) {

		// 验证完成后回调
		if (!msg || g_untis.isError(msg) ) {
			g_logger.print.error("账号验证失败");
			return;
		}
		
		// 将token保存进数据库
		this.login.setToken(msg);

		// 验证成功可登录游戏
		
	});
}


//=================
//=================
//=================
//=更新逻辑服连接数
//=================
//=================
//=================

LoginMgr.prototype.updateConnect = function(req, res, data) {

	if (!this.login) {
		g_logger.print.error("账号模块数据错误");
		return;
	}
	if (!data || !data.sid || typeof data.count !== "number") {
		g_logger.print.error("参数错误");
		return;
	}
	
	var sid = data.sid;
	var count = data.count;
	g_logger.print.info(sid + "服务器当前连接人数：" + count);
	this.login.updateConnection(sid, count);
}


module.exports = new LoginMgr();



