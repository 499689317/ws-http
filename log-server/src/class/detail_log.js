
var coll_names = {
	1: "update_version_log",// 更新
	2: "login_log",// 登录-----
	3: "load_log",// 加载状态
	4: "guide_log",// 新手引导-----
	5: "enter_game_log",// 进入关卡------
	6: "end_game_log",// 结束关卡（成功或失败）----
	7: "battle_log",// 战斗内点击（摆放方块等操作）
	8: "clear_log",// 结算后操作（下一关、重玩、关闭）
	9: "ten_level_log",// 第十关特殊统计（结算、结算后操作）
	10:	"unlock_chapter_log",// 章节解锁
	11:	"click_level_log",// 关卡点击
	12:	"click_item_log",// 道具栏点击
	13:	"first_back_level_log",// 初次点击返回时所处章节与关卡
	14:	"cost_chip_log",// 碎片消耗-----
	15:	"low_color_log",// 色弱模式（开启或关闭）
	16:	"sign_log",// 签到
	17:	"enter_daypve_log",// 进入每日挑战----
	18:	"end_daypve_log",// 结束每日挑战（成功或失败）
	19:	"first_enter_layer_log",// 第一次进入大厅
	20:	"first_enter_chapter_log",// 第一次进入章节
	21:	"first_enter_battle_log",// 第一次进入战斗
	22:	"battle_offline_log",// 战斗内掉线
	23:	"game_perf_log",// 游戏性能统计（FPS、内存、延迟等）------
};

// 游戏内详细日志记录
function DetailLog(res) {

	// if (!res) {
	// 	res = {};
	// }
	// this.init(res);
}

DetailLog.prototype.init = function(res) {

}

// 获取log表名
DetailLog.prototype.getCollNameById = function(id) {

	if (!coll_names[id]) {
		return "";
	}
	return coll_names[id];
}

// 单个设备状态
DetailLog.prototype.updateLog = function(data, cb) {

	if (!data || !data.rid || !data.logId || !data.time) {
		g_logger.print.error("参数错误");
		return;
	}

	var rid = data.rid;
	var logId = data.logId;
	var time = data.time;
	var state = data.state;
	var coll_name = this.getCollNameById(logId);
	if (!coll_name) {
		g_logger.print.error("logId错误" + logId);
		return;
	}

	var con = {};
	con[time] = {
		state: state
	};
	
	g_db_api.upsert(coll_name, {rid: rid}, {"$set": con }, function(err, result) {
		cb && cb(err);
	});
}


// 1. 版本更新：（记录更新版本成功人数）
// 3. 第一次进入大厅成功率：（记录第一次成功进入大厅人数）
// 4. 第一次进入章节成功率：（记录第一次成功进入章节人数）
// 5. 第一次进入战斗成功率：（记录第一次成功进入游戏人数）
// 6. 游戏状态：（分别记录联网/单机玩家人数）
// 7. 每日挑战第一次成功率（第一次成功人数）
// 8. 每日挑战第一次失败率（第一次失败人数）
// 10. 每日挑战平均成功率（总成功次数/总挑战次数）
// 11. 每日挑战平均失败率（总失败次数/总挑战次数）
// 21. 关卡点击：（每点击一次关卡记录一次）
// 22. 准备界面点击：（每点击一次准备界面记录一次）
// 23. 道具栏点击：（每点击一次道具栏记录一次）
// 24. 战斗外功能点击：（每点击一次战斗外功能记录一次）
// 25. 设置色盲点击次数：（每设置一次色盲记录一次）
// 26. 增加货币点击次数：（每点击一次增加货币按钮记录一次）
// 2. 加载状态：（进入游戏成功率与失败率）
// 9. 每日挑战当日总次数（当天进入每日挑战次数）
// 27. 关卡成功率：（已通关关卡/总关卡）
// 14. 新手引导
// 第1步到第5步
// 结算界面
// {
// 		step: [
// 			{
// 				time: 0
// 			}
// 		],
// 		next: {
// 			step: 0,
// 			time: 0
// 		}
// }

// 新手引导
DetailLog.prototype.guideLog = function(data, cb) {

	if (!data || !data.rid || !data.time) {
		g_logger.print.error("参数错误");
		return;
	}

	var rid = data.rid;
	var time = data.time;
	var state = data.state;
	var con = {};
	con[time] = {
		time: time,
		state: state
	};
	
	g_db_api.upsert("guide_log", {rid: rid}, {"$set": con }, function(err, result) {
		cb && cb(err);
	});
}


// 15. 关卡数据
// 转动（转动次数/频率）
// 点击（点击次数/频率）
// 结算后操作（退出/重玩/下一关）
// 平均操作间隔时间
// {
// 		turn: [],
// 		click: [],
// 		next: {
// 			result: 0,
// 			step: 0,
// 			time: 0
// 		},
// 		aver: 0
// }

// 关卡数据
DetailLog.prototype.levelLog = function(data, cb) {

	if (!data || !data.rid || !data.time) {
		g_logger.print.error("参数错误");
		return;
	}

	var rid = data.rid;
	var time = data.time;
	var sid = data.sid;// 章节id
	var lid = data.lid;// 关卡id
	var state = data.state;
	var con = {};
	con[sid + "." + lid] = {
		time: time,
		state: state
	};
	
	g_db_api.upsert("level_log", {rid: rid}, {"$set": con }, function(err, result) {
		cb && cb(err);
	});
}


// 16. 解锁章节
// 一次性解锁章节数量
// 解锁的章节是否按顺序解锁
// 非顺序解锁章节比例（非顺序解锁章节个数/章节总个数）
// 解锁章节后进入关卡间隔时间
// 进入新解锁章节并进入游戏间隔时间
// {
// 		sid: 0,
// 		time: 0,
// 		isOrder: 0,
// 		enterLevelTime: 0,
// 		enterGameTime: 0
// }

// 解锁章节
DetailLog.prototype.unlockLog = function(data, cb) {

	if (!data || !data.rid || !data.time) {
		g_logger.print.error("参数错误");
		return;
	}

	var rid = data.rid;
	var time = data.time;
	var sid = data.sid;// 章节id
	var state = data.state;
	var con = {};
	con[sid] = {
		time: time,
		state: state
	};
	
	g_db_api.upsert("level_log", {rid: rid}, {"$set": con }, function(err, result) {
		cb && cb(err);
	});
}


// 18. 资源加载
// 开始加载资源
// 配置文件加载完成
// 资源文件加载完成
// 帐号信息验证
// 连接正式服务器失败/成功
// {
// 		"time": {
// 			1: 0,
// 			2: 0,
// 			3: 0,
// 			4: 0,
// 			5: 0
// 		}
// }

DetailLog.prototype.loadLog = function(data, cb) {

	if (!data || !data.rid || !data.time) {
		g_logger.print.error("参数错误");
		return;
	}

	var rid = data.rid;
	var time = data.time;
	var state = data.state;
	var con = {};
	con[time] = {
		time: time,
		state: state
	};
	
	g_db_api.upsert("load_log", {rid: rid}, {"$set": con }, function(err, result) {
		cb && cb(err);
	});
}


// 19. 定时同步记录
// 帧率统计
// 内存统计
// 延时统计
// [
// 		{
// 			time: 0,
// 			mem: 0,
// 			fps: 0,
// 			pending: 0
// 		}
// ]

DetailLog.prototype.intervalLog = function(data, cb) {

	if (!data || !data.rid || !data.time) {
		g_logger.print.error("参数错误");
		return;
	}

	var rid = data.rid;
	var time = data.time;
	var state = data.state;
	var con = {};
	con[time] = {
		state: state
	};
	
	g_db_api.upsert("interval_log", {rid: rid}, {"$set": con }, function(err, result) {
		cb && cb(err);
	});
}



module.exports = DetailLog;



