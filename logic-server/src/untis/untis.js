
var crypto = require("crypto");

// =====================
// =====================
// =====================
// =====    工具部件
// =====================
// =====================
// =====================

// 判断是否生产环境
exports.isProduction = function() {
	var env = process.env.NODE_ENV;
	var arr = [];
	if (env) {
		arr = env.split("-");
	}
	if (arr[0] == g_cfg.env[1]) {
		return 1;
	}
	return 0;
};
// 判断是否内测环境
exports.isTest = function() {
	var env = process.env.NODE_ENV;
	var arr = [];
	if (env) {
		arr = env.split("-");
	}
	if (arr[0] == g_cfg.env[2]) {
		return 1;
	}
	return 0;
};

// 获取分支号
exports.getBranchNum = function() {
	var env = process.env.NODE_ENV;
	var arr = [];
	if (env) {
		arr = env.split("-");
	}
	if (arr[1]) {
		return arr[1];
	}
	return 0;
};

// 获取玩家离线后在游戏中缓存时长
exports.getCacheTime = function() {
	return 30 * 60 * 1000;
};
// 获取心跳间隔时长
exports.getHeartBeatTime = function() {
	return 5 * 1000;
};
// 获取玩家连续丢失最大包数判断为掉线状态
exports.getMaxLostPackage = function() {
	return 5;
};

// 获取当前时间是本月第几周
exports.getMonthWeek = function(a, b, c) {
	/* 
	a = d = 当前日期 
	b = 6 - w = 当前周的还有几天过完(不算今天) 
	a + b 的和在除以7 就是当天是当前月份的第几周 
	*/
	var date = new Date(a, parseInt(b) - 1, c), w = date.getDay(), d = date.getDate();
	return Math.ceil((d + 6 - w) / 7);
};
// 获取当前时间是本年第几周
exports.getYearWeek = function(a, b, c) {
	/* 
	date1是当前日期 
	date2是当年第一天 
	d是当前日期是今年第多少天 
	用d + 当前年的第一天的周差距的和在除以7就是本年第几周 
	*/
	var date1 = new Date(a, parseInt(b) - 1, c), date2 = new Date(a, 0, 1), 
	d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
	return Math.ceil((d + ((date2.getDay() + 1) - 1)) / 7);
};
// today=new Date();//获取当前时间
// var y = today.getYear();
// var m = today.getMonth()+1;
// var d = today.getDate();
// document.write( "今天是",m,"月的第 ", getMonthWeek(y, m, d), " 周" );

// ==================
// ==================
// ==================
// =====   加密模块
// ==================
// ==================
// ==================

// md5可选择是否加盐
exports.getMd5Str = function(str, salt) {
	if (str) {
		if (salt) {
			str = str + ":" + salt;
		}
		return crypto.createHash("md5").update(str).digest("hex");
	}
	return "";
};




