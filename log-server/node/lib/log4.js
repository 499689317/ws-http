// 日志管理

/**
 * npm install log4js
 *
 * 弃用log4js
 */
var log4js = require("log4js");
var fs = require("fs");
var path = require("path");
var mod = {};


/**
 * configure方法为配置log4js对象，内部有levels、appenders、categories三个属性
 * levels:
 * 配置日志的输出级别,共
 * ALL<TRACE<DEBUG<INFO<WARN<ERROR<FATAL<MARK<OFF八个级别
 * default level is OFF
 * 只有大于等于日志配置级别的信息才能输出出来，
 * 可以通过category来有效的控制日志输出级别
 * appenders:
 * 配置文件的输出源，一般日志输出type共有console、file、dateFile三种
 * console:普通的控制台输出
 * file:输出到文件内，以文件名-文件大小-备份文件个数的形式rolling生成文件
 * dateFile:输出到文件内，以pattern属性的时间格式，以时间的生成文件
 * replaceConsole:
 * 是否替换控制台输出，当代码出现console.log，表示以日志type=console的形式输出
 */

// var config = JSON.parse(fs.readFileSync("../log4js.json", "utf-8") );
// console.log(config)
// 配置打印信息
// log4js.configure(config);

/**
 * log4js v2版本配置
 * appenders:
 * 一个JS对象，key为上面的category，value是一些其他属性值
 * categories：
 * default表示log4js.getLogger()获取找不到对应的category时，使用default中的日志配置    
 */
log4js.configure({
	appenders: {
		file: {
			type: 'file',
			filename: './logs/log.log', //文件目录，当目录文件或文件夹不存在时，会自动创建
			maxLogSize: 10, //文件最大存储空间，当文件内容超过文件存储空间会自动生成一个文件test.log.1的序列自增长的文件
			backups: 3, //当文件内容超过文件存储空间时，备份文件的数量
			//compress : true,//是否以压缩的形式保存新文件,默认false。如果true，则新增的日志文件会保存在gz的压缩文件内，并且生成后将不被替换，false会被替换掉
			encoding: 'utf-8', //default "utf-8"，文件的编码
			category: 'log_file',
			numBackups: 5, // keep five backup files
			compress: true, // compress the backups
			encoding: 'utf-8'
		},
		dateFile: {
			type: 'dateFile',
			filename: './logs/log2.log',
			pattern: 'yyyy-MM-dd-hh',
			compress: true
		},
		out: {
			type: 'stdout'
		}
	},
	categories: {
		default: {
			appenders: ['file', 'dateFile', 'out'],
			level: 'trace'
		}
	}
});


// ==================================
// ==================================
// ==================================
// ========= 堆栈错误获取文件名与行数
// ==================================
// ==================================
// ==================================
Object.defineProperty(global, '__stack', {
  get: function(){
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});
Object.defineProperty(global, '__line', {
  get: function(){
    return __stack[1].getLineNumber();
  }
});
Object.defineProperty(global, '__file', {
  get: function(){
    return __stack[1].getFileName().split('/').slice(-1)[0];
  }
});



// ================================
// ================================
// ================================
// ======== api
// ================================
// ================================
// ================================


var logger = log4js.getLogger();

// logger.info(__file, __line);
mod.debug = function(msg, arg1, arg2) {

	var space = " ";
	if (!arg1 || !arg2) {
		space = arg1 = arg2 = "";
	}
	logger.debug(arg1 + space + arg2 + space + msg);
}
mod.info = function(msg, arg1, arg2) {

	var space = " ";
	if (!arg1 || !arg2) {
		space = arg1 = arg2 = "";
	}
	logger.info(arg1 + space + arg2 + space + msg);
}


module.exports = mod;