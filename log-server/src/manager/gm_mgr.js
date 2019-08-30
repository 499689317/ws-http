
var Gm = require("../class/gm.js");

function GmMgr() {
	this.gm = null;
}

GmMgr.prototype.init = function() {

	return new Promise(function(resolve, reject) {
		
		g_db_api.find("gm", [{}], function(err, list) {

			if (err) {
				g_logger.print.error("查找gm数据库失败" + err);
				reject();
				return;
			}
			if (!this.gm) {
				this.gm = new Gm();
			}
			resolve();
		}.bind(this));
	}.bind(this));
}

GmMgr.prototype.getPlayerLogin = function(req, res, data) {

	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: null,
	};
	if (!this.gm) {
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	if (!data) {
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	data = JSON.parse(data);
	this.gm.getPlayerLogin(data, function(err, data) {

		if (err) {
			msg.error = 1000;
		}
		msg.data = data;
		res.end(JSON.stringify(msg) );
	});
}

GmMgr.prototype.getOnline = function(req, res, data) {

	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: null,
	};
	if (!this.gm) {
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	if (!data) {
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}

	data = JSON.parse(data);
	this.gm.getOnline(data, function(err, data) {
		
		if (err) {
			msg.error = 1000;
		}
		msg.data = data;
		res.end(JSON.stringify(msg) );
	});
}

GmMgr.prototype.getRegist = function(req, res, data) {

	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: null,
	};
	if (!this.gm) {
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	if (!data) {
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	data = JSON.parse(data);
	this.gm.getRegist(data, function(err, data) {

		if (err) {
			msg.error = 1000;
		}
		msg.data = data;
		res.end(JSON.stringify(msg) );
	});
}

GmMgr.prototype.getGoBack = function(req, res, data) {

	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: null,
	};
	if (!this.gm) {
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	if (!data) {
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	data = JSON.parse(data);
	this.gm.getGoBack(data, function(err, data) {

		if (err) {
			msg.error = 1000;
		}
		msg.data = data;
		res.end(JSON.stringify(msg) );
	});
}
GmMgr.prototype.getGoLeave = function(req, res, data) {

	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: null,
	};
	if (!this.gm) {
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	if (!data) {
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	data = JSON.parse(data);
	this.gm.getGoLeave(data, function(err, data) {

		if (err) {
			msg.error = 1000;
		}
		msg.data = data;
		res.end(JSON.stringify(msg) );
	});
}


module.exports = new GmMgr();



