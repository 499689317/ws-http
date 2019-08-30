
var Const = {
	PVE_DAY_COUNT: 1,// 每日挑战上限(抽出来是因为后期可能会加次数)
	PVE_DAY_RESET_TIME: "05:00:00",// 每天凌晨5点重置
};

//===========================
//===========================
//===========================
//=========     pve游戏
//===========================
//===========================
//===========================

function Pve(res) {
	this.rid = res.rid || 0;
	this.startTime = 0;// 普通pve开始游戏时间
	this.pveDayTime = res.pveDayTime || 0;// 每日挑战时间
	this.pveDayCount = res.pveDayCount || 0;// 每日挑战次数
}

Pve.prototype.init = function() {

}
Pve.prototype.startGame = function(player, id) {

	var msg = {
		id: g_CONST.PROTO.GAME_START,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};

	if (!id) {
		g_logger.print.error("参数错误" + id);
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	this.startTime = 0;
	this.startTime = Date.now();// 记录开始时间

	// 精力过滤
	if (!this.isPvePowerEnough(player, id) ) {
		g_logger.print.error("玩家精力不足");
		msg.error = g_CONST.ERROR.GAME_POWER_NO_ENOUGH;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	// 扣除消耗
	var data = this.getPveData();
	var powerCost = Number(data.power_cost);
	player.setPower(-powerCost, id + "关卡扣除精力");
	g_logger.print.info(id + "关卡扣除精力：" + powerCost);

	// 记录游戏次数(开始游戏总次数)
	g_handle.level_mgr.setTotalCount(player, id);
}

// 游戏通关
Pve.prototype.pveWin = function(player, id, star, time, score, list) {

	var msg = {
		id: g_CONST.PROTO.GAME_END,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	if (!player || !id || !star || !time || !score || !list) {
		g_logger.print.error("参数错误");
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	
	// 暂时先用客户端回传的时间
	// var nowTime = Date.now();
	// var useTime = nowTime - this.startTime;
	// 如果useTime在一个合理的范围内
	// useTime一定>= time且<= 关卡最大过关时间
	// 验证星星数是否正确
	g_logger.print.debug("当前关卡" + id);
	var useTime = time;

	// 检测玩家消耗物品
	if (!g_handle.level_mgr.checkItem(player, list) ) {
		g_logger.print.error("有人作弊");
		msg.error = g_CONST.ERROR.LEVEL_USEITEM_CHEAT;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	
	// 保存星星
	g_handle.level_mgr.checkStar(player, id, star);

	// 保存时间
	g_handle.level_mgr.checkTime(player, id, useTime);

	// 保存分数
	g_handle.level_mgr.checkScore(player, id, score);

	// 记录通关游戏次数
	g_handle.level_mgr.setWinCount(player, id, star);

	// 发放关卡奖励
	var drops = g_handle.level_mgr.getLevelRew(player, {id: id, star: star});
	// 返还玩家精力
	var data = this.getPveData();
	var powerCost = Number(data.power_cost);
	player.setPower(powerCost, id + "关卡返还精力");
	g_logger.print.info(id + "关卡返还精力：" + powerCost);
	drops.push({
		iid: g_handle.item_mgr.getCurrencyId("power"),
		num: powerCost
	});
	
	// =========
	// =========广告=======
	var adType = 4;
	var isShowAd = player.advertis.calcRandom(adType);
	if (isShowAd) {
		player.advertis.cacheAdvertisRew(adType, drops);
	}

	// 开启新关卡
	var nextLevel = g_handle.level_mgr.openNextLevel(player, id);
	var level = {};
	if (nextLevel && nextLevel.length) {
		for (var i = 0; i < nextLevel.length; i++) {
			var id = nextLevel[i].id;
			var sid = player.level.getSidByLevelId(id);
			level[sid] = id;
		}
	}
	// g_logger.print.info(drops);
	// g_logger.print.info(nextLevel);
	// g_logger.print.info(level);
	// 回传领取成功消息
	msg.error = g_CONST.ERROR.SUCCESS;
	var lst = [];
	for (var i = 0; i < list.length; i++) {
		
		var iid = list[i].iid;
		var num = player.items[iid] ? player.items[iid].num : 0;
		lst.push({
			iid: iid,
			num: num
		});
	}
	msg.data.lst = lst;
	msg.data.drops = drops;
	msg.data.level = level;
	msg.data.isShowAd = isShowAd;
	player.socket.send(JSON.stringify(msg) );
}
// 游戏失败
Pve.prototype.pveLose = function(player, list) {

	var msg = {
		id: g_CONST.PROTO.GAME_END,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	if (!player || !list) {
		g_logger.print.error("参数错误");
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	
	// 检测玩家消耗物品
	if (!g_handle.level_mgr.checkItem(player, list) ) {
		g_logger.print.error("有人作弊");
		msg.error = g_CONST.ERROR.LEVEL_USEITEM_CHEAT;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	var lst = [];
	for (var i = 0; i < list.length; i++) {
		
		var iid = list[i].iid;
		var num = player.items[iid] ? player.items[iid].num : 0;
		lst.push({
			iid: iid,
			num: num
		});
	}
	msg.data.lst = lst;
	msg.data.drops = [];
	msg.data.level = {};
	player.socket.send(JSON.stringify(msg));
}


// 开始游戏前需实时计算游戏难度
Pve.prototype.calcPveLevel = function() {

}
Pve.prototype.getPveData = function() {
	return {
		power_cost: 1
	};
}
// 判断pve战斗精力是否足够
Pve.prototype.isPvePowerEnough = function(player, id) {

	if (!player) {
		g_logger.print.error("参数错误");
		return 0;
	}
	var data = this.getPveData();
	var powerCost = Number(data.power_cost);
	var curPower = player.getCurPower();
	if (curPower >= powerCost) {
		return 1;
	}
	return 0;
}


//======================
//======================
//======================
//=== 日常挑战是否完成
//======================
//======================
//======================
Pve.prototype.isPveDayDone = function() {
	var maxDayCount = Const.PVE_DAY_COUNT;// 这里方便拓展
	return this.pveDayCount >= maxDayCount;
}
Pve.prototype.startDayGame = function(player, id) {

	// 每天5点开始算，挑战重置为可挑战状态
	// 玩家挑战失败不记录挑战
	// 当玩家挑战成功后，开始记录时间，并显示到下一次可挑战间的时间
	this.startTime = 0;
	this.startTime = Date.now();

	g_logger.print.debug("开始每日挑战" + id);

	// 统计pveDay模式数据
	g_handle.statistics_mgr.calcEvent(player, "pveDayTotal", 1);
}
Pve.prototype.pveDayWin = function(player, id, star, time, score) {

	if (!player || !id || !star || !time || !score) {
		g_logger.print.error("参数错误");
		return;
	}
	// 验证游戏时间
	// var nowTime = Date.now();
	// var useTime = this.nowTime = this.startTime;
	// this.pveDayTime = nowTime;// 每日挑战过关时间

	this.pveDayTime = time;
	this.pveDayCount++;
	this.setDayTime();// 记录当天挑战用时
	this.setDayCount();// 记录当天挑战次数

	// 统计
	g_handle.statistics_mgr.calcEvent(player, "pveDayWin", 1);
	g_handle.statistics_mgr.calcEvent(player, "pveDayStar", star);
	g_handle.statistics_mgr.calcEvent(player, "pveDayScore", score);

	// 获取收益
	var drops = this.getReward(id);
	player.setItem(drops, false, "同步每日挑战掉落物品");
	// 获取倒计时
	var time = this.getStartNextTime();

	// =========
	// =========广告=======
	var adType = 1;
	var isShowAd = player.advertis.calcRandom(adType);
	if (isShowAd) {
		player.advertis.cacheAdvertisRew(adType, drops);
	}

	var msg = {
		id: g_CONST.PROTO.GAME_DAY_END,
		error: g_CONST.ERROR.SUCCESS,
		data: {
			drops: drops,
			time: time,
			isShowAd: isShowAd
		}
	};
	player.socket.send(JSON.stringify(msg) );
}
Pve.prototype.pveDayLose = function() {
	// 
}

// 根据id获取每日挑战表数据
Pve.prototype.getDailyTableById = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return null;
	}
	var data = g_data.module.DailyTemplateData.RECORDS;
	for (var i = 0; i < data.length; i++) {
		if (id == data[i].ID) {
			return data[i];
		}
	}
	return null;
}
// 每日挑战收益
Pve.prototype.getReward = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return null;
	}

	var data = this.getDailyTableById(id);
	if (!data) {
		g_logger.print.error("每日挑战表数据错误" + id);
		return null;
	}
	// 返回掉落物口
	var awardID = data.awardID;
	var awardNum = data.awardNum;
	var list = this.parseRew(awardID, awardNum);
	return this.calcDailyRew(list);
}
// 解析奖励
Pve.prototype.parseRew = function(strId, strNum) {

	if (!strId || !strNum || strId == "0" || strNum == "0") {
		g_logger.print.error("参数错误");
		return null;
	}

	var ids = strId.split(":");
	var num = strNum.split(":");
	var list = [];
	for (var i = 0; i < ids.length; i++) {
		var nums = num[i].split(",");
		list.push({
			iid: ids[i],
			max: nums[0],
			min: nums[1],
			pro: nums[2],
		});
	}
	return list;
}
// 计算每日挑战奖励获取
Pve.prototype.calcDailyRew = function(list) {

	if (!list || !list.length) {
		g_logger.print.error("参数错误" + list);
		return null;
	}
	var rews = [];
	for (var i = 0; i < list.length; i++) {
		var iid = list[i].iid;
		var pro = Number(list[i].pro);
		var max = Number(list[i].max);
		var min = Number(list[i].min);
		// random是否获取该物品
		var random = Math.floor(Math.random() * 10000);
		// g_logger.print.debug("random" + random + "pro" + pro);
		if (random < pro) {
			var num = Math.floor(Math.random() * (max - min) ) + min;
			if (num) {
				rews.push({
					iid: iid,
					num: num,
				});
			}
		}
	}
	return rews;
}
// 获取距下一次挑战重置倒计时(重置时间点读表也行)
Pve.prototype.getStartNextTime = function() {
	// 战斗没完成没有倒计时
	if (!this.isPveDayDone() ) {
		return 0;
	}
	// 今天的下一天凌晨5点
	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth();
	var date = now.getDate();
	var hour = now.getHours();
	g_logger.print.info(date);
	var temp_date = 0;
	if (hour >= 0 && hour <= 5) {
		temp_date = date;
	} else {
		// temp_date = date + 1;// 处理不了每月最后一天逻辑
		// fix每月最后一天情况
		var next_time = this.getTimeByCount(1);
		year = next_time.getFullYear();
		month = next_time.getMonth();
		temp_date = next_time.getDate();
	}
	var time = year + "-" + (month + 1) + "-" + temp_date + " " + Const.PVE_DAY_RESET_TIME;
	g_logger.print.info(time);

	// 当天(最后一次)过关时间
	var nowTime = now.getTime();
	var nextTime = new Date(time).getTime();
	var surpTime = nextTime - nowTime;
	if (surpTime <= 0) {
		return 0;
	}
	return surpTime;
}

// 每个月最后一天用js的setDate方法处理天数
Pve.prototype.getTimeByCount = function(count) {

	var time = new Date();
	var date = time.getDate();
	if (!count) {
		g_logger.print.error("参数错误");
		return date;
	}
    time.setDate(date + count);
    return time;
}

//=========================
//=========================
//=========================
//=========    数据入库
//=========================
//=========================
//=========================
Pve.prototype.setPveData = function() {
	g_db_api.upsert("pve", {rid: this.rid}, {"$set": this });
}
// 每日挑战数据
Pve.prototype.setDayTime = function() {
	g_db_api.update("pve", {rid: this.rid}, {"$set": {pveDayTime: this.pveDayTime}});
}
Pve.prototype.setDayCount = function() {
	g_db_api.update("pve", {rid: this.rid}, {"$set": {pveDayCount: this.pveDayCount}});
}
// 销毁pve模块
Pve.prototype.destroy = function() {
	this.rid = 0;
	this.startTime = 0;
	this.pveDayTime = 0;
	this.pveDayCount = 0;
}

module.exports = Pve;


