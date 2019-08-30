
global.g_cfg     =   null;// 各配置文件信息
global.g_db      =   null;// 数据库对象
global.g_db_api  =   null;// sql api
global.g_proto   =   null;// 网络模块
global.g_logger  =   null;// log打印对象
global.g_CONST   =   null;// 全局常量对象
global.g_untis   =   null;// 全局方法
global.g_http    =   null;// http脚手架
global.g_data    =   {};  // 静态数据表
global.g_handle  =   {};  // 全局模块对象
var fs           =   require("fs");
var path         =   require("path");
var co           =   require("co");
g_cfg            =   JSON.parse(fs.readFileSync("./config.json", "utf-8") );
g_http           =   require("./node/lib/http_client.js");
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

	var dataPath = "./data";
	var jsons = fs.readdirSync(dataPath);
	if (jsons && jsons.length) {
		
		for (var i = 0; i < jsons.length; i++) {

			var file = jsons[i];
			var suffix = path.extname(path.basename(file) );// 读取文件名后缀
			var name = path.basename(file, suffix);
			if (suffix == ".json") {
				
				var url = dataPath + "/" + jsons[i];// 文件相对路径
				g_logger.print.info(url);
				g_data[name] = JSON.parse(fs.readFileSync(url, "utf-8") );
			}
		}
	}
}

// 加载工程模块
function loadFileStatus() {

	g_handle.login_mgr      =    require("./src/manager/login_mgr.js");
	g_handle.update_mgr     =    require("./src/manager/update_mgr.js");
	g_handle.notice_mgr     =    require("./src/manager/notice_mgr.js");
}

// 初始化项目模块
function init() {

	// 用generator函数模拟同步加载
	co(function* () {

		// 模块
		yield g_handle.login_mgr.init();
		yield g_handle.notice_mgr.init();
	}).then(function() {

		g_logger.print.info("=================================");
		g_logger.print.info("=================================");
		g_logger.print.info("=========gate server ok==========");
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

