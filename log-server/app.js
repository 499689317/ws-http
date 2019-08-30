
global.g_cfg     =   null;// 各配置文件信息
global.g_db      =   null;// 数据库对象
global.g_db_api  =   null;// sql api
global.g_proto   =   null;// 网络模块
global.g_logger  =   null;// log打印对象
global.g_CONST   =   null;// 全局常量对象
global.g_untis   =   null;// 全局方法
global.g_data    =   {};  // 静态数据表
global.g_handle  =   {};  // 全局模块对象
var fs           =   require("fs");
var path         =   require("path");
var co           =   require("co");
g_cfg            =   JSON.parse(fs.readFileSync("./config.json", "utf-8") );
g_untis          =   require("./src/untis/untis.js");
g_logger         =   require("./node/lib/logger.js");
g_db_api         =   require("./node/lib/db_api.js");
g_CONST          =   require("./const.js");
var main         =   require("./node/main.js");

// ==================================
// ==================================
// ==================================
// ====== 账号服
// ==================================
// ==================================
// ==================================

// 加载启动配置
// function loadCfgStatus() {
// 	g_cfg = JSON.parse(fs.readFileSync("./config.json", "utf-8") );
// }

// 加载静态数据表
function loadDataStatus() {
	
}

// 加载工程模块
function loadFileStatus() {

	g_handle.log_mgr = require("./src/manager/log_mgr.js");
	g_handle.gm_mgr = require("./src/manager/gm_mgr.js");
	g_handle.detail_log_mgr = require("./src/manager/detail_log_mgr.js");
}

// 初始化项目模块
function init() {

	// 用generator函数模拟同步加载
	co(function* () {
		
		yield g_handle.log_mgr.init();
		yield g_handle.gm_mgr.init();
		yield g_handle.detail_log_mgr.init();
	}).then(function() {

		g_logger.print.info("=================================");
		g_logger.print.info("=================================");
		g_logger.print.info("==========log server ok==========");
		g_logger.print.info("=================================");
		g_logger.print.info("=================================");
	});
}

// 服务器启动
(function run() {

	// 1. 加载配置文件(静态数据表，服务器配置表)
	// loadCfgStatus();

	// 2. 加载游戏数据表
	loadDataStatus();

	// 3. 开启主要服务
	main.start(function() {

		// 4. 引入项目模块
		loadFileStatus();

		// 5. 初始化项目模块
		init();
	});
})();


process.on('uncaughtException', function (err) {
  
  // 打印出错误的调用栈方便调试
  g_logger.print.error(err.stack);
});

