
var Level = require("../class/temp_level.js");

// 关卡管理类

function LevelMgr() {

}

LevelMgr.prototype.init = function(player) {

	g_logger.print.info("初始化玩家关卡数据");
	return new Promise(function(resolve, reject) {
		
		var rid = player.rid;// 角色id
		g_db_api.findOne("level", [{rid: rid}, {_id: 0}], function(err, ret) {

			if (err) {
				g_logger.print.error("查找level数据库失败" + err);
				reject();
				return;
			}

			var cfg = {
				rid: rid
			};
			if (ret) {
				cfg = ret;
			}
			
			player.level = new Level(cfg);
			resolve();
		});
	});
}
// 检测星星
LevelMgr.prototype.checkStar = function(player, id, star) {

	if (!id || typeof star != "number") {
		g_logger.print.error("参数错误" + id);
		return;
	}

	var level = player.level;
	if (!level) {
		g_logger.print.error("玩家关卡错误" + id);
		return
	}

	var data = level.getLevelById(id);
	if (!data) {
		g_logger.print.error("关卡数据错误" + id);
		return;
	}

	if (data.star >= star) {
		g_logger.print.debug("不更新星星数" + data.star);
		return;
	}
	// 更新星星数
	data.star = star;
	level.setLevelFeild(id, "star", data.star);
}
// 检测时间
LevelMgr.prototype.checkTime = function(player, id, time) {

	if (!id || typeof time != "number") {
		g_logger.print.error("参数错误" + id);
		return;
	}

	var level = player.level;
	if (!level) {
		g_logger.print.error("玩家关卡错误" + id);
		return
	}

	var data = level.getLevelById(id);
	if (!data) {
		g_logger.print.error("关卡数据错误" + id);
		return;
	}

	data.totalTime += time;
	level.setLevelFeild(id, "totalTime", data.totalTime);

	if (data.time != 0 && data.time <= time) {
		g_logger.print.debug("不更新时间" + data.time);
		return;
	}
	// 更新星星数
	data.time = time;
	level.setLevelFeild(id, "time", data.time);
}
LevelMgr.prototype.checkScore = function(player, id, score) {

	if (!id || typeof score != "number") {
		g_logger.print.error("参数错误" + id);
		return;
	}

	var level = player.level;
	if (!level) {
		g_logger.print.error("玩家关卡错误" + id);
		return
	}

	var data = level.getLevelById(id);
	if (!data) {
		g_logger.print.error("关卡数据错误" + id);
		return;
	}

	if (data.score >= score) {
		g_logger.print.debug("不更新积分" + data.score);
		return;
	}
	// 更新星星数
	data.score = score;
	level.setLevelFeild(id, "score", data.score);
}
// 记录游戏总次数
LevelMgr.prototype.setTotalCount = function(player, id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return;
	}

	var level = player.level;
	if (!level) {
		g_logger.print.error("玩家关卡错误" + id);
		return
	}

	var data = level.getLevelById(id);
	if (!data) {
		g_logger.print.error("关卡数据错误" + id);
		return;
	}

	data.total++;
	level.setLevelFeild(id, "total", data.total);
}
// 记录游戏胜利次数(分开统计，1星，2星，3星)
LevelMgr.prototype.setWinCount = function(player, id, star) {

	if (!id || !star) {
		g_logger.print.error("参数错误" + id);
		return;
	}

	var level = player.level;
	if (!level) {
		g_logger.print.error("玩家关卡错误" + id);
		return
	}

	var data = level.getLevelById(id);
	if (!data) {
		g_logger.print.error("关卡数据错误" + id);
		return;
	}

	var exec = "";
	var count = 0;
	if (star == 1) {

		exec = "oneStar";
		data.oneStar++;
		count = data.oneStar;
	} else if (star == 2) {

		exec = "twoStar";
		data.twoStar++;
		count = data.twoStar;
	} else if (star == 3) {

		exec = "threeStar";
		data.threeStar++;
		count = data.threeStar;
	}
	g_logger.print.info(exec + count);
	if (exec && count) {
		level.setLevelFeild(id, exec, count);
	}
}
// 开启新关卡
LevelMgr.prototype.openNextLevel = function(player, id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return;
	}

	var level = player.level;
	if (!level) {
		g_logger.print.error("玩家关卡错误" + id);
		return
	}
	// 返回新开的关卡
	return level.openLevels(id);
}


//==========================
//==========================
//==========================
//=======    关卡接口
//==========================
//==========================
//==========================

LevelMgr.prototype.getAllChapter = function(player, data) {

	var msg = {
		id: g_CONST.PROTO.LEVEL_ALL_CHAPTER,
		data: {},
	};
	if (!data || !data.type) {
		g_logger.print.error("参数错误" + data);
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	var level = player.level;
	if (!level) {
		g_logger.print.error("模块数据错误");
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	var type = data.type;
	// 过滤章节开启
	// if (type != 1 && !level.isLevelProgress(type - 1) ) {
	// 	g_logger.print.error("关卡进度不足" + type);
	// 	msg.error = g_CONST.ERROR.LEVEL_NO_PROGRESS;
	// 	player.socket.send(JSON.stringify(msg) );
	// 	return;
	// }

	var list = level.calcAllSid(type);
	g_logger.print.info(type);
	g_logger.print.info(list);
	if (!list) {
		g_logger.print.error("该难度下章节未开启" + type);
		msg.error = g_CONST.ERROR.LEVEL_NO_CHAPTER;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	msg.error = g_CONST.ERROR.SUCCESS;
	msg.data = {
		sid: list
	};
	player.socket.send(JSON.stringify(msg) );
}
LevelMgr.prototype.getLevelList = function(player, data) {

	var msg = {
		id: g_CONST.PROTO.LEVEL_LEVEL_LIST,
		data: {},
	};
	if (!data || !data.type || !data.sid) {
		g_logger.print.error("参数错误" + data);
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	var level = player.level;
	if (!level) {
		g_logger.print.error("模块数据错误");
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	var type = data.type;
	var sid = data.sid;
	var list = level.calcLevels(type, sid);
	g_logger.print.info(list);
	if (!list || !list.length) {
		g_logger.print.error("获取关卡失败" + type + sid);
		msg.error = g_CONST.ERROR.LEVEL_GET_FAILE;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	msg.error = g_CONST.ERROR.SUCCESS;
	msg.data = {
		list: list
	};
	player.socket.send(JSON.stringify(msg) );
}

LevelMgr.prototype.openChapter = function(player, data) {

	var msg = {
		id: g_CONST.PROTO.LEVEL_OPEN_CHAPTER,
		data: {},
	};
	if (!data || !data.sid) {
		g_logger.print.error("参数错误" + data);
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	var level = player.level;
	if (!level) {
		g_logger.print.error("模块数据错误");
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	var sid = data.sid;

	// 判断解锁条件是否满足
	if (!level.isCanOpenChapter(sid) ) {
		g_logger.print.error("解锁条件不满足" + sid);
		msg.error = g_CONST.ERROR.LEVEL_CANNOT_OPEN;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	// 条件
	if (!level.isCdtEnough(player, sid) ) {
		msg.error = g_CONST.ERROR.LEVEL_NO_DENROS;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	// 消耗
	level.delCdt(player, sid);
	// 收益
	var lev = level.openChapter(sid);
	// 入库
	// level.setChapterData(sid);
	msg.error = g_CONST.ERROR.SUCCESS;
	msg.data.level = {
	};
	msg.data.level[sid] = lev ? lev.id : null;
	player.socket.send(JSON.stringify(msg) );
}

// 领取关卡奖励
LevelMgr.prototype.getLevelRew = function(player, data) {

	if (!data || !data.id || !data.star) {
		g_logger.print.error("参数错误" + data);
		return;
	}

	var level = player.level;
	if (!level) {
		g_logger.print.error("模块数据错误");
		return;
	}
	var id = data.id;
	var star = data.star;

	// 计算发放奖励物品
	var drops = level.calcLevelRew(id);
	var golds = level.calcLevelGold(id, star);
	drops = drops.concat(golds);
	// 同步奖励数据
	level.setFirstRew(id, star);
	player.setItem(drops, false, id + "关卡掉落");
	return drops;
}

// 验证消耗的物品道具
LevelMgr.prototype.checkItem = function(player, list) {

	if (!player || !list) {
		g_logger.print.error("参数错误");
		return 0;
	}
	if (!g_handle.item_mgr.isItemEnough(player, list) ) {
		g_logger.print.error("道具不足，玩家id：" + player.rid);
		return 0;
	}

	// 扣除玩家消耗道具
	if (list.length) {
		player.setItem(list, true, "玩家战斗内消耗道具");
	} else {
		g_logger.print.info("玩家未使用道具");
	}
	return 1;
}

//========================
//========================
//========================
//=======   验证(这里....)
//========================
//========================
//========================

LevelMgr.prototype.checkChapter = function* (player, id) {

	// 记录章节
	if (!player || !id) {
		g_logger.print.error("参数错误");
		return;
	}
	if (!player.level) {
		g_logger.print.error("关卡模块错误");
		return;
	}
	g_logger.print.info("离线章节id" + id);
	var isopen = player.level.openChapter(id, true);
	if (isopen) {
		player.level.setChapterData(id);
	}
}

LevelMgr.prototype.checkLevel = function* (player, sid, id, data) {

	if (!player || !sid || !id || !data) {
		g_logger.print.error("参数错误" + sid + id);
		g_logger.print.info(data);
		return;
	}
	if (!player.level) {
		g_logger.print.error("关卡模块错误");
		return;
	}
	
	var star = data.star;
	var time = data.time;
	var score = data.score;
	var rew = data.rew;
	if (star > 0) {// 通关关卡
		g_logger.print.info("离线通关关卡id" + id);
		// 判断cheat
		// if (this.isCheat(player, id, star, rew) ) {
		// 	g_logger.print.info("关卡作弊" + id);
		// 	g_logger.cout.log("======作弊数据=======");
		// 	g_logger.cout.log(player.rid);
		// 	g_logger.cout.log(id);
		// 	g_logger.cout.log(JSON.stringify(rew) );
		// 	g_logger.cout.log("====做人要有底线=====");
		// 	return;
		// } else {
			// 同步奖励
			player.level.setFirstRew(id, star);
			player.setItem(rew, false, id + "离线关卡掉落");
		// }

		// 判断之前是否已通关
		if (player.level.isPassLevel(id) ) {

			// g_logger.print.debug("已通关关卡" + id);
			//星数/时间/积分/奖励更新
			this.checkStar(player, id, star);
			this.checkTime(player, id, time);
			this.checkScore(player, id, score);
		} else {

			// g_logger.print.debug("未通关关卡" + id);
			var level = player.level.getInitLevel(id);
			level.star = star;
			level.time = time;
			level.score = score;

			if (player.level.isOpenChapter(sid) ) {
				player.level.openChapter(sid);
			}
			player.level.levels[sid][id] = level;
			player.level.setNextLevel(sid, id, level);
		}
		this.setTotalCount(player, id);
		this.setWinCount(player, id, star);
	} else {// 新开启的关卡
		g_logger.print.info("未开启关卡id" + id);
		player.level.createLevel(id);
	}
}
// 判断是否作弊/所有异常全部按作弊处理
LevelMgr.prototype.isCheat = function(player, id, star, rews) {

	if (!id || !star || !rews) {
		g_logger.print.error("参数错误");
		return 1;
	}
	if (!player.level) {
		g_logger.print.error("关卡模块错误");
		return 1;
	}
	var data = player.level.getRewardStr(id);
	var count = 0;
	for (var i = 0; i < rews.length; i++) {
		var iid = rews[i].iid;
		var num = rews[i].num;
		if (g_handle.item_mgr.isElement(iid) ) {
			// 元素
			var debris = data.debris;
			var debris_num = data.debris_num;
			var deList = player.level.parseLevelRew(debris, debris_num);
			// g_logger.print.debug(deList);
			if (this.isRewOk(deList, iid, num) ) {
				count++;
			}
		} else if (g_handle.item_mgr.isProp(iid) ) {
			// 道具
			var drops = data.drops;
			var drops_num = data.drops_num;
			var drList = player.level.parseLevelRew(drops, drops_num);
			if (this.isRewOk(drList, iid, num) ) {
				count++;
			}
		} else if (g_handle.item_mgr.isGold(iid) ) {
			var gdList = player.level.calcLevelGold(id, star, true);
			if (this.isRewOk(gdList, iid, num) ) {
				count++;
			}
		}
	}
	// g_logger.print.debug(count);
	// g_logger.print.debug(rews.length);
	if (count >= rews.length) {
		return 0;
	}
	return 1;
}
LevelMgr.prototype.isRewOk = function(list, iid, num) {

	if (!list || !iid || !num) {
		g_logger.print.error("参数错误");
		return 0;
	}
	for (var i = 0; i < list.length; i++) {
		var max = list[i].max ? list[i].max : list[i].num;
		if (iid == list[i].iid && num <= Number(max) ) {
			return 1;
		}
	}
	// g_logger.print.debug("最大可获得个数" + max);
	return 0;
}

module.exports = new LevelMgr();


