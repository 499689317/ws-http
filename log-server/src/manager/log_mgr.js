
//=========================
//=========================
//=========================
//=======    log管理器
//=========================
//=========================
//=========================

var Log = require("../class/log.js");

function LogMgr() {
	this.log = null;
}

LogMgr.prototype.init = function() {

	return new Promise(function(resolve, reject) {
		var now = new Date();
		var year = now.getFullYear();
		var month = now.getMonth() + 1;
		var date = now.getDate();
		var col_name = year + "-" + month;
		var value1 = "regist-login-" + date;
		var value2 = "login-login-" + date;
		var value3 = "regist-" + date;
		g_logger.print.debug(col_name);
		g_logger.print.debug(value1 + value2 + value3);
		g_db_api.find(col_name, [{"$or": [{logId: value1}, {logId: value2}, {logId: value3}]}], function(err, list) {

			if (err) {
				g_logger.print.error("查找log数据库失败" + err);
				reject();
				return;
			}
			g_logger.print.info("初始化log服基本数据");
			g_logger.print.info(list);

			var res = {};
			if (list && list.length) {
				for (var i = 0; i < list.length; i++) {
					if (list[i].id == "regist-login") {
						res.registLogin = list[i].logs;
					} else if (list[i].id == "login-login") {
						res.loginLogin = list[i].logs;
					} else if (list[i].id == "regist") {
						res.regist = list[i].count;
					}
				}
			}
			if (!this.log) {
				this.log = new Log(res);
			}
			resolve();
		}.bind(this));
	}.bind(this));
}

LogMgr.prototype.calcOnline = function(req, res, data) {

	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: null,
	};
	if (!this.log) {
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}

	if (!data) {
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}

	// 日志入库
	this.log.setOnlineLog(data, function(err) {

		if (err) {
			msg.error = 1000;
		}
		res.end(JSON.stringify(msg) );
	});
}

LogMgr.prototype.calcRegist = function(req, res, data) {

	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: null,
	};
	if (!this.log) {
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}

	if (!data) {
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}

	// 日志入库
	this.log.setRegistLog(data, function(err) {

		if (err) {
			msg.error = 1000;
		}
		res.end(JSON.stringify(msg) );
	});
}

LogMgr.prototype.calcLogin = function(req, res, data) {

	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: null,
	};
	if (!this.log) {
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}

	if (!data) {
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}

	this.log.setLoginLog(data, function(err) {

		if (err) {
			msg.error = 1000;
		}
		res.end(JSON.stringify(msg) );
	});
}

LogMgr.prototype.calcPlayerLogin = function(req, res, data) {

	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: null,
	};
	if (!this.log) {
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}

	if (!data) {
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	
	// 日志入库
	this.log.setPlayerLoginLog(data, function(err) {

		if (err) {
			msg.error = 1000;
		}
		res.end(JSON.stringify(msg) );
	});
}
LogMgr.prototype.calcAllPlayerLogin = function(req, res, data) {
	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: null,
	};
	if (!this.log) {
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}

	if (!data) {
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}

	this.log.setAllPlayerLoginLog(data, function(err) {

		if (err) {
			msg.error = 1000;
		}
		res.end(JSON.stringify(msg) );
	});
}

module.exports = new LogMgr();



