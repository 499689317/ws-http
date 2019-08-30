
global.g_cfg     =   null;// 各配置文件信息
global.g_db      =   null;// 数据库对象
global.g_db_api  =   null;// sql api
global.g_logger  =   null;// log打印对象
global.g_CONST   =   null;// 全局常量
global.g_worker  =   null;
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
// ====== 逻辑服
// ==================================
// ==================================
// ==================================

// 加载启动配置
// function loadCfgStatus() {
// 	g_cfg = JSON.parse(fs.readFileSync("./config.json", "utf-8") );
// }

// 加载静态数据表(后期可能会移到cdn)
function loadDataStatus() {

	// 0. data文件夹路径
	var dataPath = "./data/";

	// 1. 读取data文件夹下的所有子文件夹(jsons/levels)
	var dirs = fs.readdirSync(dataPath);
	g_logger.print.info(dirs);

	// 2. 加载json文件
	for (var i = 0; i < dirs.length; i++) {

		var jsons = fs.readdirSync(dataPath + dirs[i]);
		g_data[dirs[i]] = {};
		if (jsons && jsons.length) {

			// 读取文件夹下的所有文件
			for (var j = 0; j < jsons.length; j++) {

				var file = jsons[j];
				var suffix = path.extname(path.basename(file) );// 读取文件名后缀
				var name = path.basename(file, suffix);
				if (suffix == ".json") {
					
					var url = dataPath + dirs[i] + "/" + jsons[j];// 文件相对路径
					g_logger.print.info(url);
					g_data[dirs[i]][name] = JSON.parse(fs.readFileSync(url, "utf-8") );
				}
			}
		}
	}
}

// 加载工程模块
function loadFileStatus() {

	// 各模块管理类
	g_handle.player_mgr     =    require("./src/manager/player_mgr.js");
	g_handle.level_mgr      =    require("./src/manager/level_mgr.js");
	g_handle.pve_mgr        =    require("./src/manager/pve_mgr.js");
	g_handle.item_mgr       =    require("./src/manager/item_mgr.js");
	g_handle.shop_mgr       =    require("./src/manager/shop_mgr.js");
	g_handle.sign_mgr       =    require("./src/manager/sign_mgr.js");
	g_handle.statistics_mgr =    require("./src/manager/statistics_mgr.js");
	g_handle.gm_mgr         =    require("./src/manager/gm_mgr.js");
	g_handle.advertis_mgr   =    require("./src/manager/advertis_mgr.js");
}

// 全服数据加载
function init() {

	// 用generator函数模拟同步加载
	co(function* () {

		// 玩家管理模块
		yield g_handle.player_mgr.init();
		// 游戏gm
		yield g_handle.gm_mgr.init();
	}).then(function() {

		g_logger.print.info("=================================");
		g_logger.print.info("=================================");
		g_logger.print.info("=========logic server ok=========");
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

	// 3.0 . 开启主要服务
	main.start(function() {

		// 3.1 . 引入项目模块
		loadFileStatus();

		// 3.2 . 初始化项目模块
		init();
	});
})();

process.on('uncaughtException', function (err) {
  
  // 打印出错误的调用栈方便调试
  g_logger.print.error(err.stack);
});

