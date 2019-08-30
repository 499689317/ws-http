
function Sign(res) {
	this.rid = res.rid || 0;
	this.signNum = res.signNum || 0;// 记录本周已签到次数
	this.loseSignNum = res.loseSignNum || 0;// 记录本周已补签次数
	this.isDaySign = res.isDaySign === undefined ? 1 : res.isDaySign;// 当天是否可以签到
	this.list = res.list || {};// 签到数据
	this.init();
}
Sign.prototype.init = function() {
	// sign = {
	// 		1: {
	// 			isSign: 0,// 是否已签到
	// 			isLose: 0,// 是否已补签
	// 			isCanSign: 0,// 是否可签到
	// 			isCanLose: 0,// 是否可补签
	// 		}
	// }
	var month = this.getCurrMonth();
	g_logger.print.info("初始化" + month + "月签到数据");
	var data = this.getBonusByMonth(month);
	if (!data) {
		g_logger.print.error("签到数据表错误" + month);
		return;
	}
	// 重新初始化签到数据(怕数据表有变化)
	let isUpdate = false;
	for(var key in data) {
		if (this.list[key]) continue;
		isUpdate = true;
		this.list[key] = {
			isSign: 0,
			isLose: 0,
			isCanSign: 0,
			isCanLose: 0
		};
	};
	this.initSignList();
	if (isUpdate) {
		this.setSignData();
	}
	// g_logger.print.info(this.list);
}

Sign.prototype.initSignList = function() {

	var count = this.getCurrSign();
	g_logger.print.info(count);
	if (!count) {
		g_logger.print.debug("未取到签到标签" + count);
		return;
	}
	// 初始化玩家签到数据
	for(let key in this.list) {
		if (this.list[key].isSign) continue;
		if (this.list[key].isLose) continue;
		// g_logger.print.info(this.isDaySign);
		if (this.isCanSignCon(key) && this.isDaySign) {
			// g_logger.print.info(key);
			if (key == count) {
				this.list[key].isCanSign = 1;
				// fix如果之前是补签项
				this.list[key].isCanLose = 0;
			} else {
				this.list[key].isCanLose = 1;
				// fix如果之前是可签到项？？？？？可能不用fix
			}
		}
	}
	g_logger.print.info(this.list);
}

Sign.prototype.getSignData = function() {
	return g_data.module.SignTemplateData.RECORDS;
}

// 获取当天可签到标记
Sign.prototype.getCurrSign = function() {
	return (this.signNum + 1) + this.loseSignNum;// 公式与getCurrLoseSign相同，但是意义完全不一样
}
// 获取当天可补签标记
Sign.prototype.getCurrLoseSign = function() {
	return (this.signNum + 1) + this.loseSignNum;// 这里暂时这样处理，后续看需求拓展
}

// 获取当前是本年第几个月
Sign.prototype.getCurrMonth = function() {
	return (new Date().getMonth() + 1);
}
// 根据当前月份获取签到奖励
Sign.prototype.getBonusByMonth = function(month) {

	// month没有0月的，传入的month必须是大于0的数值
	if (!month) {
		g_logger.print.error("参数错误");
		return null;
	}
	var itor = (month - 1);
	g_logger.print.info(itor);
	var data = this.getSignData();// 本年度12月奖励数据
	for (var i = 0; i < data.length; i++) {
		
		if (itor == i) {
			return data[i];
		}
	}
	g_logger.print.error("未找到当月签到表数据" + month);
	return null;
}
// 解析奖励
Sign.prototype.parseBonus = function(str) {

	if (!str) {
		return null;
	}
	var strs = str.split(";");
	var bonus = [];
	for (var i = 0; i < strs.length; i++) {
		
		var bs = strs[i].split(",");
		bonus.push({
			iid: bs[0],
			num: Number(bs[1])
		});
	}
	g_logger.print.info(bonus);
	return bonus;
}
// 根据次数获取玩家签到数据
Sign.prototype.getSignListByCount = function(count) {

	if (!count) {
		g_logger.print.error("参数错误");
		return null;
	}
	if (!this.list || !this.list[count]) {
		g_logger.print.error("玩家签到数据错误" + count);
		return null;
	}
	return this.list[count];
}
// 根据次数获取签到奖励
Sign.prototype.getSignRewByCount = function(count) {

	if (!count) {
		g_logger.print.error("参数错误");
		return null;
	}
	var month = this.getCurrMonth();
	var data = this.getBonusByMonth(month);
	if (!data || !data[count]) {
		g_logger.print.error("对应签到奖励不存在" + count);
		return null;
	}
	return data[count];
}

// 当前玩家是否可签到
Sign.prototype.isCanSignIn = function() {

	var count = this.getCurrSign();
	var signData = this.getSignListByCount(count);
	if (!signData) {
		g_logger.print.error("玩家签到次数错误" + count);
		return 0;
	}
	return signData.isCanSign;
}
// 当前玩家是否可补签
Sign.prototype.isCanLoseSign = function() {

	var count = this.getCurrLoseSign();
	var signData = this.getSignListByCount(count);
	if (!signData) {
		g_logger.print.error("玩家补签次数错误" + count);
		return 0;
	}
	return signData.isCanLose;
}

// 可签到条件
Sign.prototype.isCanSignCon = function(count) {

	// 计算当天是周几
	// 当天之前未签到的数据都可以签到或补签
	// 比如今天周6，周6前未签到的第一天都可签到
	// 完成签到后有可签到的数据为可补签数据
	if (!count) {
		g_logger.print.error("参数错误");
		return 0;
	}
	var c = Number(count);
	var time = new Date(), hour = time.getHours(), day = time.getDay();
	// 特殊处理星期天情况
	if (day == 0) {
		day = 7;
	}
	if (this.is00To05(hour) ) {
		// fix周天day == 0的情况
		if (day == 1) {
			day = 7;
		} else {
			day--;// 如果在00点到05点间星期减1
		}
	}
	// g_logger.print.debug("count: " + c);
	// g_logger.print.debug("day: " + day);
	if (day >= c) {
		return 1;
	}
	return 0;
}
// 判断是否是在凌晨12点到凌晨5点之间
Sign.prototype.is00To05 = function(hour) {

	if (hour === undefined) {
		g_logger.print.error("参数错误");
		return 0;
	}
	if (hour > 0 && hour <= 5) {
		return 1;
	}
	return 0;
}

Sign.prototype.setSignIn = function() {

	var count = this.getCurrSign();
	var signData = this.getSignListByCount(count);
	if (!signData) {
		g_logger.print.error("玩家签到数据错误" + count);
		return;
	}
	signData.isCanSign = 0;
	signData.isSign = 1;// 签到成功
	this.isDaySign = 0;// 签到完将当天签到状态置为不可签到
	this.signNum++;
}
Sign.prototype.setLoseSign = function() {

	var count = this.getCurrLoseSign();
	var signData = this.getSignListByCount(count);
	if (!signData) {
		g_logger.print.error("玩家签到数据错误" + count);
		return;
	}
	signData.isCanLose = 0;
	signData.isLose = 1;// 补签成功
	this.loseSignNum++;
}
// 同步签到收益
Sign.prototype.setSignRew = function(player, isLoseSign) {

	if (!player) {
		g_logger.print.error("参数错误");
		return null;
	}
	var des = "领取签到奖励";
	var count = this.getCurrSign();
	if (isLoseSign) {
		des = "领取补签奖励";
		count = this.getCurrLoseSign();
	}
	// 取当前签到次数下奖励
	var rew = this.getSignRewByCount(count);
	var rews = this.parseBonus(rew);
	if (!rews) {
		g_logger.print.error("签到奖励不存在" + count);
		return null;
	}
	player.setItem(rews, false, des);
	return rews;
}
// 同步签到数据
Sign.prototype.setSignData = function() {
	g_db_api.upsert("user_sign", {rid: this.rid}, this);
}
Sign.prototype.setDaySign = function() {
	g_db_api.update("user_sign", {rid: this.rid}, {"$set": {"isDaySign": this.isDaySign}});
}
Sign.prototype.setSignNum = function(isLoseSign) {

	var con = {};
	if (isLoseSign) {
		con["loseSignNum"] = this.loseSignNum;
	} else {
		con["signNum"] = this.signNum;
	}
	g_db_api.update("user_sign", {rid: this.rid}, {"$set": con});
}
Sign.prototype.setSignList = function(isLoseSign) {

	var count = this.getCurrSign();
	if (isLoseSign) {
		count = this.getCurrLoseSign();
	}
	g_logger.print.info(count);
	count--;
	var signData = this.getSignListByCount(count);
	if (!signData) {
		g_logger.print.error("玩家签到数据错误" + count);
		return;
	}
	var con = {};
	var exec = "list." + count;
	con[exec] = signData;
	g_logger.print.info(exec);
	g_logger.print.info(signData);
	g_db_api.update("user_sign", {rid: this.rid}, {"$set": con});
}

// 销毁签到数据
Sign.prototype.destroy = function() {
	this.rid = 0;
	this.signNum = 0;
	this.loseSignNum = 0;
	this.isDaySign = 0;
	if (this.list) {
		for(var key in this.list) {
			this.list[key] = null;
		}
		this.list = null;
	}
}

module.exports = Sign;





