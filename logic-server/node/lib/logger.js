
// =========================
// =========================
// =========================
// ===== log打印/日志管理
// =========================
// =========================
// =========================

// test
// logger.log('hello');
// logger.trace('hello', 'world');
// logger.debug('hello %s',  'world', 123);
// logger.info('hello %s %d',  'world', 123, {foo:'bar'});
// logger.warn('hello %s %d %j', 'world', 123, {foo:'bar'});
// logger.error('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4], Object);
var fs = require("fs");
var tracer = require("tracer");
var mod = {};

// 配置文件
// 设置level值可以按置log打印
function getDayTime() {

	var nowTime = new Date();
	var year = nowTime.getFullYear();
	var month = nowTime.getMonth() + 1;
	var date = nowTime.getDate();
	return year + "-" + month + "-" + date;
};
function getPrintCfg() {
	if (g_untis.isProduction() ) {// process.env.NODE_ENV == "production"
        return {
        	level: "error",
        	transport : function(data) {
				var fileName = "./logs/" + getDayTime() + ".log";
				console.log(data.output);
				fs.appendFile(fileName, data.output + '\n', (err) => {
					if (err) throw err;
				});
			}
        };
    } else if (g_untis.isTest() ) {// process.env.NODE_ENV == "test"
        return {
        	level: "log",
        	transport : function(data) {
				var fileName = "./logs/" + getDayTime() + ".log";
				console.log(data.output);
				fs.appendFile(fileName, data.output + '\n', (err) => {
					if (err) throw err;
				});
			}
        };
    } else {
        return {
        	level: "log"
        };
    }
};
function getPrint2Cfg() {
	if (g_untis.isProduction() ) {// process.env.NODE_ENV == "production"
        return {
        	level: "error",
        	transport : function(data) {
				var fileName = "./logs/" + getDayTime() + ".log";
				console.log(data.output);
				fs.appendFile(fileName, data.output + '\n', (err) => {
					if (err) throw err;
				});
			}
        };
    } else if (g_untis.isTest() ) {// process.env.NODE_ENV == "test"
        return {
        	level: "log",
        	transport : function(data) {
				var fileName = "./logs/" + getDayTime() + ".log";
				console.log(data.output);
				fs.appendFile(fileName, data.output + '\n', (err) => {
					if (err) throw err;
				});
			}
        };
    } else {
        return {
        	level: "log"
        };
    }
};
function getCoutCfg() {
	if (g_untis.isProduction() ) {// process.env.NODE_ENV == "production"
        return {
        	root:'./logs',
			maxLogFiles: 366,
			allLogsFileName: 'production'
        };
    } else if (g_untis.isTest() ) {// process.env.NODE_ENV == "test"
        return {
        	root:"./logs",
			maxLogFiles: 366,
			allLogsFileName: 'test'
        };
    } else {
        return {
        	root:"./logs",
			maxLogFiles: 366,
			allLogsFileName: "dev"
        };
    }
};

//============================
//============================
//============================
//====== 1. 普通打印，不带彩色
//====== 2. 彩色打印
//====== 3. 日志输出
//============================
//============================
//============================
mod.print2 = tracer.console(getPrint2Cfg() );
mod.print = tracer.colorConsole(getPrintCfg() );
mod.cout = tracer.dailyfile(getCoutCfg() );

module.exports = mod;



