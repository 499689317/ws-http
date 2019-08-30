
var Const = {
	FIVE: "05:00:00",
	ZERO: "00:00:00",
	INT_FIVE: 5,
	INT_ZERO: 0,
};

function Log(res) {
	this.init(res);
}
Log.prototype.init = function(res) {
	this.registLogin = res.registLogin || {};// 当天登录距离注册间隔天数的玩家(当天重复登录的也统计了)
	this.loginLogin = res.loginLogin || {};// 当天登录距离上一次登录间隔天数的玩家(当天重复登录的也统计了)
	this.regist = res.regist || 0;// 累计总注册人数
}

Log.prototype.getLogCollection = function(time) {

	var now = null;
	if (!time) {
		now = new Date();
	} else {
		now = new Date(time);
	}
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	return year + "-" + month;
}

Log.prototype.getOnlineId = function() {
	return "online";
}
Log.prototype.getOnlineLogId = function(time) {
	return this.getOnlineId() + "-" + this.getCurrDate(time);
}
Log.prototype.getRegistId = function() {
	return "regist";
}
Log.prototype.getRegistLogId = function(time) {
	return this.getRegistId() + "-" + this.getCurrDate(time);
}
Log.prototype.getRegistLoginId = function() {
	return "regist-login";
}
Log.prototype.getRegistLoginLogId = function() {
	return this.getRegistLoginId() + "-" + this.getCurrDate();
}

Log.prototype.getLoginLoginId = function() {
	return "login-login";
}
Log.prototype.getLoginLoginLogId = function() {
	return this.getLoginLoginId() + "-" + this.getCurrDate();
}

Log.prototype.getCurrDate = function(time) {

	var now = null;
	if (!time) {
		now = new Date();
	} else {
		now = new Date(time);
	}
	var date = now.getDate();
	if (this.isInTime(time) ) {
		date -= 1;
	}
	return date;
}
Log.prototype.getCurrTime = function(time) {

	var now = null;
	if (!time) {
		now = new Date();
	} else {
		now = new Date(time);
	}
	var hour = now.getHours();
	var minu = now.getMinutes();
	return hour + "-" + minu;
}

// 插入数据
Log.prototype.setOnlineLog = function(data, cb) {

	if (!data || !data.time) {
		g_logger.print.error("参数错误");
		cb && cb(1);
		return;
	}

	var collection = this.getLogCollection(data.time);
	var logId = this.getOnlineLogId(data.time);
	var key = this.getCurrTime(data.time);
	var id = this.getOnlineId();
	g_logger.print.info(collection + logId + key);

	var con = {
	};
	var exec = "logs." + key;
	con[exec] = data;
	g_db_api.upsert(collection, {id: id, logId: logId}, {"$set": con }, function(err, result) {
		cb && cb(err);
	});
}

// 每日注册用户数据
Log.prototype.setRegistLog = function(data, cb) {

	if (!data || !data.time) {
		g_logger.print.error("参数错误");
		cb && cb(1);
		return;
	}

	var collection = this.getLogCollection(data.time);
	var logId = this.getRegistLogId(data.time);
	var id = this.getRegistId();
	this.regist++;
	
	g_logger.print.info(collection + logId);
	g_logger.print.info(this.regist);
	g_db_api.upsert(collection, {id: id, logId: logId}, {"$set": {count: this.regist} }, function(err, result) {
		cb && cb(err);
	});
}

//=========================
//=========================
//=========================
//===   登录游戏数据统计
//=========================
//=========================
//=========================

Log.prototype.isInTime = function(time) {

	var now = null;
	if (!time) {
		now = new Date();
	} else {
		now = new Date(time);
	}
	var hour = now.getHours();
	if (hour >= Const.INT_ZERO && hour < Const.INT_FIVE) {
		return 1;
	}
	return 0;
}

Log.prototype.getDays = function(time) {

	var now = new Date();// 当前时间
	var nowDate = now.getDate();
	if (this.isInTime() ) {
		nowDate -= 1;
	}
	var lastDate = new Date(time).getDate();
	// 初始时间也需要判断
	if (this.isInTime(time) ) {
		lastDate -= 1;
	}
	return nowDate - lastDate;
}

Log.prototype.setLoginLog = function(data, cb) {

	if (!data || !data.time || !data.type) {
		g_logger.print.error("参数错误");
		cb && cb(1);
		return;
	}

	var key = this.getDays(data.time);
	var collection = this.getLogCollection(data.time);
	var logId = "";
	var id = "";
	var con = {};
	var exec = "logs." + key;

	if (data.type == 1) {

		logId = this.getRegistLoginLogId();
		id = this.getRegistLoginId();
		if (!this.registLogin[key]) {
			this.registLogin[key] = 0;
		}
		this.registLogin[key]++;
		con[exec] = this.registLogin[key];
	} else if (data.type == 2) {

		logId = this.getLoginLoginLogId();
		id = this.getLoginLoginId();
		if (!this.loginLogin[key]) {
			this.loginLogin[key] = 0;
		}
		this.loginLogin[key]++;
		con[exec] = this.loginLogin[key];
	}
	g_logger.print.info(collection + logId + key);
	if (!logId || !id) {
		g_logger.print.error("记录登录用户出错了");
		cb && cb(1);
		return;
	}
	g_db_api.upsert(collection, {id: id, logId: logId}, {"$set": con }, function(err, result) {
		cb && cb(err);
	});
}

Log.prototype.setPlayerLoginLog = function(data, cb) {

	if (!data || !data.rid || !data.time || !data.type) {
		g_logger.print.error("参数错误");
		cb && cb(1);
		return;
	}

	//========================
	//========================
	//========================
	//======= 插入数据 =======
	//========================
	//========================
	//========================
	
	var rid = data.rid;
	var time = data.time;
	var type =  data.type;
	var con = {
		time: time,
		type: type
	};
	g_logger.print.info(type);
	g_db_api.upsert("player_login", {rid: rid}, {"$push": {logs: con} }, function(err, result) {
		cb && cb(err);
	});
}
Log.prototype.setAllPlayerLoginLog = function(data, cb) {

	if (!data || !data.rid || !data.time) {
		g_logger.print.error("参数错误");
		cb && cb(1);
		return;
	}

	var rid = data.rid;
	var time = data.time;
	var con = {
		time: time
	};
	g_logger.print.info(rid);
	g_db_api.upsert("all_player_login", {rid: rid}, {"$push": {logs: con} }, function(err, result) {
		cb && cb(err);
	});
}
module.exports = Log;



