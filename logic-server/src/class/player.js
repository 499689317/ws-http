
var co = require("co");

// =====================
// =====================
// =====================
// =======   玩家实例
// =====================
// =====================
// =====================

function Player(res) {

	this.rid = res.rid || "";// 角色id
	this.acc = res.acc || "";// 账号
	this.name = res.name || "";// 玩家昵称
	this.gold = res.gold || 0;// 金币
	this.jewel = res.jewel || 0; // 钻石
	this.power = res.power || 0; // 精力
	this.createTime = res.createTime || 0;// 角色创建时间
	this.loginTime = res.loginTime || 0;// 角色登录时间
	this.isEndGuide = res.isEndGuide || {};// 是否已经新手引导

	// 上一次领取物品的时间
	this.dropItemTime = res.dropItemTime || 0;
	// 恢复精力时间
	this.restorePowerTime = res.restorePowerTime || 0;

	this.isLine = 1;// 标识玩家离线或在线状态，初始化玩家后默认为在线状态
	this.offTime = 0;// 最近离线时间
	this.isCheat = 0;// 玩家离线数据是否异常
}

Player.prototype.init = function() {

	//=========================
	//=========================
	//=========================
	//===  初始化玩家个人属性
	//=========================
	//=========================
	//=========================
	
	this.level = null;// 关卡数据
	this.items = null;// 玩家道具
	this.pve = null;// pve数据
	this.statistics = null;// 统计数据
	this.shops = null;// 玩家商城
	this.sign = null;// 玩家签到
	this.advertis = null;// 广告模块
}

Player.prototype.enterGame = function(data) {

	// 部分玩家个人数据初始化
	var self = this;
	co(function* () {

		// 玩家关卡数据
		if (!self.level) yield g_handle.level_mgr.init(self);
		// 玩家背包道具
		if (!self.items) yield g_handle.item_mgr.init(self);
		// pve战场
		if (!self.pve) yield g_handle.pve_mgr.init(self);
		// 玩家统计数据
		if (!self.statistics) yield g_handle.statistics_mgr.init(self);
		// 玩家商城数据
		if (!self.shops) yield g_handle.shop_mgr.init(self);
		// 玩家签到数据
		if (!self.sign) yield g_handle.sign_mgr.init(self);
		if (!self.advertis) yield g_handle.advertis_mgr.init(self);
		// 同步玩家离线数据
		yield self.checkOfflineData(data);
	}).then(function() {

		g_logger.print.info("用户进入游戏ok");
		var stars = g_handle.statistics_mgr.calcTotalStar(self);// 计算总星数
		var day_pve_time = g_handle.pve_mgr.getPveDayResetTime(self);
		var drop_reset_time = self.getDropResetTime();
		var power = self.getCurPower();
		var goldShop = g_handle.shop_mgr.getGoldShopInfo(self);
		var jewelShop = g_handle.shop_mgr.getJewelShopInfo(self);
		var themeShop = g_handle.shop_mgr.getThemeShopInfo(self);
		// 返回客户端数据
		var data = {
			rid: self.rid,// 玩家角色id
			acc: self.acc,// 玩家账号
			name: self.name,// 玩家昵称
			gold: self.gold,// 玩家金币数
			jewel: self.jewel,// 玩家钻石数
			power: power,// 玩家精力值
			stars: stars,// 通关获得总星数
			items: self.items,// 背包道具
			day_pve_time: day_pve_time,// 每日挑战倒计时
			drop_reset_time: drop_reset_time,// 领取定时物品重置倒计时
			restore_power_time: self.restorePowerTime,// 精力恢复倒计时时间戳
			isEndGuide: self.isEndGuide,// 标识新手引导
			isCheat: self.isCheat,// 玩家离线数据是否异常
			goldShop: goldShop,// 金币商店
			jewelShop: jewelShop,// 钻石商店
			themeShop: themeShop,// 主题商店
			sign: self.sign.list,// 玩家签到数据
		};
		
		var msg = {
			id: g_CONST.PROTO.LOGIN_ENTERGAME,
			error: g_CONST.ERROR.SUCCESS,
			data: data
		};
		// g_logger.print.info(msg);
		self.socket.send(JSON.stringify(msg) );
	});
}

// 玩家金币是否足够
Player.prototype.isGoldEnough = function(num) {
	if (typeof num != "number") {
		g_logger.print.info("参数错误" + num);
		return 0;
	}
	if (this.gold >= num) {
		return 1;
	}
	return 0;
}
// 玩家钻石是否足够
Player.prototype.isJewelEnough = function(num) {
	if (typeof num != "number") {
		g_logger.print.info("参数错误" + num);
		return 0;
	}
	if (this.jewel >= num) {
		return 1;
	}
	return 0;
}
// 玩家精力是否足够
Player.prototype.isPowerEnough = function(num) {
	if (typeof num != "number") {
		g_logger.print.info("参数错误" + num);
		return 0;
	}
	if (this.power >= num) {
		return 1;
	}
	return 0;
}

// 设置玩家金币
Player.prototype.setGold = function(num, des) {
	if (typeof num != "number") {
		g_logger.print.error("参数错误" + num);
		return;
	}
	this.gold += num;
	if (this.gold < 0) {
		this.gold = 0;
	}
	g_logger.cout.log(this.rid + "||" + des + "金币收支数目：" + num);
	this.setPlayerFeild("gold", this.gold);
}
// 设置玩家钻石
Player.prototype.setJewel = function(num, des) {
	if (typeof num != "number") {
		g_logger.print.error("参数错误" + num);
		return;
	}
	this.jewel += num;
	if (this.jewel < 0) {
		this.jewel = 0;
	}
	g_logger.cout.log(this.rid + "||" + des + "钻石收支数目：" + num);
	this.setPlayerFeild("jewel", this.jewel);
}
// 设置玩家精力
Player.prototype.setPower = function(num, des) {
	if (typeof num != "number") {
		g_logger.print.error("参数错误" + num);
		return;
	}
	this.power += num;

	if (num < 0) {
		// 先扣体力再判断是否恢复
		this.startRestorePower();
	} else {
		// 判断到达极限上限情况
		var data = this.getPowerData();
		var limitTop = Number(data.limit_top);
		if (this.power >= limitTop) {
			this.power = limitTop;
			g_logger.print.debug("精力已达极限上限" + this.power);
		}
	}

	if (this.power < 0) {
		this.power = 0;
	}
	g_logger.cout.log(this.rid + "||" + des + "精力收支数目：" + num);
	this.setPlayerFeild("power", this.power);
}

// 移除玩家内存的道具
Player.prototype.delItem = function(iid) {

	if (this.items[iid]) {
		delete this.items[iid];
	}
}

//==========================
//==========================
//==========================
//======   玩家精力系统
//==========================
//==========================
//==========================

Player.prototype.getPowerData = function() {
	var data = g_data.module.GlobalTemplateData.RECORDS;
	for (var i = 0; i < data.length; i++) {
		if (data[i].ID == "restore_power") {
			return {
				common_top: data[i].param,
				limit_top: data[i].param1,
				restore_time: data[i].param2,
				restore_count: data[i].param3
			};
		}
	}
	return null;
}
// 判断精力是否达到标准上限
Player.prototype.isPowerCommonTop = function(num) {
	if (num === undefined) {
		g_logger.print.error("参数错误");
		return 1;// 以达上限处理
	}
	var data = this.getPowerData();
	var top = Number(data.common_top);
	if (top <= num) {
		return 1;
	}
	return 0;
}
// 判断精力是否达到极限上限
Player.prototype.isPowerLimitTop = function(num) {
	if (num === undefined) {
		g_logger.print.error("参数错误");
		return 1;// 以达上限处理
	}
	var data = this.getPowerData();
	var top = Number(data.limit_top);
	if (top <= num) {
		return 1;
	}
	return 0;
}
// 获取当前可恢复的精力值
Player.prototype.getRestorePower = function() {
	
	var startTime = this.restorePowerTime;// 开始恢复时间
    var nowTime = Date.now();
    var subTime = nowTime - startTime;
    if (!startTime || subTime <= 0) {
        g_logger.print.debug("恢复时间" + startTime);
        return 0;
    }
    var data = this.getPowerData();
    var restoreTime = Number(data.restore_time) * 1000;// 每次时间间隔
    var restoreCount = Number(data.restore_count);// 每次恢复个数
    if (!restoreTime) {
        g_logger.print.error("恢复时间数据表错误" + restoreTime);
        return 0;
    }
    return Math.floor(subTime / restoreTime) * Number(restoreCount);
}
// 获取当前玩家精力值
Player.prototype.getCurPower = function() {

	// 恢复精力+当前精力
	var data = this.getPowerData();
	var count = this.getRestorePower();
	var curPower = count;
	// g_logger.print.info(this.power);
	// g_logger.print.info(curPower);
	// 先同步精力
	if (this.isPowerCommonTop(this.power) ) {
		g_logger.print.info("精力已达标准上限" + this.power);
		// 达上限后将不继续走恢复机制
		this.restorePowerTime = 0;
		return this.power;
	} else {

		var topPower = Number(data.common_top);
		var totalPower = this.power + count;
		// 计算到上限体力还差多少
		if (totalPower >= topPower) {
			curPower = topPower - this.power;
		}
		if (!curPower) {
			g_logger.print.info("无可恢复精力值");
			return this.power;
		}
	}
	this.setPower(curPower, "精力恢复");
	g_logger.print.info(this.power);
	if (this.isPowerCommonTop(this.power) ) {
		this.restorePowerTime = 0;
	} else {
		// 恢复一次用时(毫秒)
		var restoreTime = Number(data.restore_time) * 1000;
		var curTime = curPower * restoreTime;
		this.restorePowerTime += curTime;
	}
	this.setPlayerFeild("restorePowerTime", this.restorePowerTime);
	return this.power;
}
// 消耗精力处理
Player.prototype.startRestorePower = function() {
	// 有消耗精力的地方都走这个方法
	// 过滤超出标准上限的情况
	if (!this.restorePowerTime && !this.isPowerCommonTop(this.power) ) {
		this.restorePowerTime = Date.now();
		this.setPlayerFeild("restorePowerTime", this.restorePowerTime);
		return;
	}
	g_logger.print.info("不同步恢复时间");
}

//==========================
//==========================
//==========================
//======   临时领取物品需求
//==========================
//==========================
//==========================

Player.prototype.getDropTime = function() {
	
	var data = g_data.module.GlobalTemplateData.RECORDS;
	for (var i = 0; i < data.length; i++) {
		if (data[i].ID == "drop_reset_time") {
			return Number(data[i].param) * 1000;
		}
	}
	return 0;
}
// 判断当前是否可领取物品
Player.prototype.isCanGetDropItem = function() {

	// 如果是首次进入游戏，置为可领取状态
	if (this.dropItemTime === 0) {
		return 1;
	}
	var nowTime = Date.now();
	var spaceTime = nowTime - this.dropItemTime;// 从上一次领取到当前时间段

	if (spaceTime >= this.getDropTime() ) {
		return 1;
	}
	g_logger.print.debug(this.dropItemTime);
	return 0;
}
// 免费领取物品逻辑
Player.prototype.getDropItem = function() {

	var nowTime = Date.now();
	this.dropItemTime = nowTime;// 记录当前领取物品时间
	this.setPlayerFeild("dropItemTime", this.dropItemTime);

	// 领取收益
	var drop = this.calcDropItem();
	return this.randomDrop(drop);
}
// 领取免费物品倒计时
Player.prototype.getDropResetTime = function() {

	var nowTime = Date.now();
	var costTime = this.getDropTime();
	var useTime = nowTime - this.dropItemTime;
	var resetTime = costTime - useTime;
	if (resetTime < 0) {
		resetTime = 0;
	}
	return resetTime;
}
// 免费物品掉落
Player.prototype.calcDropItem = function() {
	var data = g_data.module.DropTemplateData.RECORDS;
	var drop = [];
	for (var i = 0; i < data.length; i++) {
		var iid = data[i].ID;
		var mins = data[i].min.split(",");
		var maxs = data[i].max.split(",");
		var pros = data[i].pro.split(",");
		for (var j = 0; j < pros.length; j++) {
			var minPro = pros[j - 1];
			var maxPro = pros[j];
			if (!minPro) {
				minPro = 0;
			}
			drop.push({
				iid: iid,
				minPro: Number(minPro),
				maxPro: Number(maxPro),
				minNum: Number(mins[j]),
				maxNum: Number(maxs[j])
			});
		}
	}
	return drop;
}
Player.prototype.randomDrop = function(list) {
	// g_logger.print.info(list);
	var random = Math.floor(Math.random() * 10000);
	// g_logger.print.info(random);
	var dropList = [];
	for (var i = 0; i < list.length; i++) {
		if (random >= list[i].minPro && random < list[i].maxPro) {
			var iid = list[i].iid;
			var num = Math.floor(Math.random() * (list[i].maxNum - list[i].minNum) ) + list[i].minNum;
			if (num) {
				dropList.push({
					iid: iid,
					num: num,
				});
			}
		}
	}
	return dropList;
}

// =========================
// =========================
// =========================
// 验证玩家离线数据
// 关卡/道具
// =========================
// =========================
// =========================
Player.prototype.checkOfflineData = function* (data) {
	// {
	// "isEndGuide": {},
	// 	"cost": [
	// 		{
	// 			iid: 
	// 			num:
	// 		}
	// 	],
	// 	"stages": {
	// 		"stageId": {// 章节id
	// 		
	// 			"levelId": [// 关卡id
		// 			{
		// 				"time": // 通关时间
		// 				"star": // 获得星数
		// 				"score": // 获得的积分
		// 				"rew": [
		// 					{
		// 						iid: // 获得的奖励id
		// 						num: // 奖励数量
		// 					}
		// 				]
		// 			}
	// 			]
	// 		}
	// 	}
	// }
	// g_logger.print.info(data);
	// g_logger.print.info(JSON.stringify(data) );
	if (!data || !this.level) {
		g_logger.print.debug("数据拒绝同步");
		return;
	}

	// 离线新手引导字段
	if (data.isEndGuide) {
		g_logger.print.debug("同步离线新手引导");
		this.setPlayerFeild("isEndGuide", data.isEndGuide);
	}

	// 遍历消耗的物品
	if (data.cost && data.cost.length) {
		g_logger.print.debug("同步离线消耗的物品");
		this.setItem(data.cost, true, "同步离线消耗物品");
	}

	if (!data.stages) {
		g_logger.print.debug("暂无离线关卡数据");
		return;
	}

	//========================
	//========================
	//========================
	//如果有一关作弊数据全干掉
	//========================
	//========================
	//========================
	for (var sid in data.stages) {
		
		var chapter = data.stages[sid];
		if (!chapter) continue;
		for(var lid in chapter) {
			var levelList = chapter[lid];
			if (!levelList || !levelList.length) continue;
			for (var i = 0; i < levelList.length; i++) {
				var star = levelList[i].star;
				var rew = levelList[i].rew;
				if (!star || star <= 0) continue;
				if (g_handle.level_mgr.isCheat(this, lid, star, rew) ) {
					this.isCheat = 1;
					g_logger.print.error("关卡作弊" + lid);
					g_logger.cout.log("======作弊数据=======");
					g_logger.cout.log(this.rid);
					g_logger.cout.log(lid);
					g_logger.cout.log(JSON.stringify(rew) );
					g_logger.cout.log("====做人要有底线=====");
					return;
				}
			}
		}
	}
	if (this.isCheat) {
		return;
	}
	g_logger.print.debug("同步离线关卡......");
	// 遍历器去遍历传过来的关卡
	for(var sid in data.stages) {
		var chapter = data.stages[sid];
		if (!chapter) continue;
		yield g_handle.level_mgr.checkChapter(this, sid);
		for(var lid in chapter) {
			var levelList = chapter[lid];
			if (!levelList || !levelList.length) continue;
			for (var i = 0; i < levelList.length; i++) {
				// 怎样才算通过验证
				yield g_handle.level_mgr.checkLevel(this, sid, lid, levelList[i]);
			}
		}
	}
}

// 更新数据
Player.prototype.setPlayerData = function() {
	g_db_api.upsert("player", {rid: this.rid}, {"$set": this});
}
Player.prototype.setPlayerFeild = function(feild, value) {

	if (!feild) {
		g_logger.print.error("参数错误" + feild);
		return;
	}
	var con = {};
	con[feild] = value;
	g_db_api.update("player", {rid: this.rid}, {"$set": con});
}
Player.prototype.setItem = function(list, isDelete, des) {

	if (!list || !list.length) {
		g_logger.print.error("参数错误");
		return;
	}
	for (var i = 0; i < list.length; i++) {
		var iid = list[i].iid;
		var num = Number(list[i].num);
		var costNum = num;
		if (isDelete) {
			g_logger.print.debug(iid + "===物品减少===" + num);
			costNum = -num;
		} else {
			g_logger.print.debug(iid + "===物品增加===" + num);
		}
		if (!des) {
			des = "";
		}
		if (g_handle.item_mgr.isGold(iid) ) {
			this.setGold(costNum, des);
		} else if (g_handle.item_mgr.isJewel(iid) ) {
			this.setJewel(costNum, des);
		} else if (g_handle.item_mgr.isPower(iid) ) {
			this.setPower(costNum, des);
		} else {
			if (isDelete) {
				g_handle.item_mgr.delItem(this, iid, num, des);
			} else {
				g_handle.item_mgr.addItem(this, iid, num, des);
			}
		}
	}
}

// 清理socket
Player.prototype.clearSocket = function() {

	if (this.socket) {

		// this.socket.player.socket = null;// this.socket === player.socket
		// this.socket.player = null;// 解引用玩家---这里不能将player置为null，player在其它地方还有引用
		
		this.socket.pingcount = 0;// 心跳计数器置0
		this.socket.removeEventListener("message");// 移除socket事件
		this.socket.removeEventListener("pong");
		this.socket.removeEventListener("close");
		this.socket.terminate();// 强制关闭连接
		this.socket = null;

		// 这里看看socket是否释放干净
		// g_logger.print.info(g_handle.player_mgr.online[this.rid]);
		// g_logger.print.info(g_handle.player_mgr.offline[this.rid]);
	}
}

// 销毁函数, 有引用的及时解除引用，防止内存泄漏
Player.prototype.destroy = function() {
	g_logger.print.debug("销毁玩家" + this.rid);
	this.rid = "";// 销毁玩家基础数据
	this.gold = 0;
	this.jewel = 0;
	this.power = 0;
	this.createTime = 0;
	this.loginTime = 0;
	this.dropItemTime = 0;
	this.restorePowerTime = 0;
	this.isLine = 0;
	this.offTime = 0;
	this.isCheat = 0;
	this.isEndGuide = null;
	if (this.level) {// 销毁玩家关卡数据
		this.level.destroy();
		this.level = null;
	}
	if (this.items) {// 销毁玩家道具
		for(var iid in this.items) {
			this.items[iid].destroy();
			this.items[iid] = null;
		}
		this.items = null;
	}
	if (this.statistics) {// 销毁玩家统计模块数据
		this.statistics.destroy();
		this.statistics = null;
	}
	if (this.pve) {// 销毁玩家战斗模块数据
		this.pve.destroy();
		this.pve = null;
	}
	if (this.shops) {// 销毁玩家商城模块数据
		for(var type in this.shops) {
			this.shops[type].destroy();
			this.shops[type] = null;
		}
		this.shops = null;
	}
	if (this.sign) {// 销毁玩家签到数据
		this.sign.destroy();
		this.sign = null;
	}
	if (this.advertis) {
		this.advertis.destroy();
		this.advertis = null;
	}
}

module.exports = Player;


