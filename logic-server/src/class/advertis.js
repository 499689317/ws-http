
// 广告弹出概率
var Const = {
	"1": "param",// 每日挑战
	"2": "param1",// 签到
	"3": "param2",// 购买体力
	"4": "param3",// pve胜利
	"5": "param4",// pve失败
	"6": "param5",// 双倍奖励关卡
	"7": "param6"// boss关卡
};

// 广告模块
function Advertis() {
	this.isShow = 0;
	this.reward = [];
};

Advertis.prototype.init = function() {

};

Advertis.prototype.getGlobalAdvertis = function() {

	var data = g_data.module.GlobalTemplateData.RECORDS;
	for (var i = 0; i < data.length; i++) {
		if (data[i].ID == "show_advertis") {
			return data[i];
		}
	}
	return null;
};

// 获取各途径是否弹出广告
Advertis.prototype.getRandomByType = function(type) {

	if (!type) {
		g_logger.print.error("参数错误");
		return 0;
	}
	var data = this.getGlobalAdvertis();
	if (!data) {
		g_logger.print.error("全局表未配置广告数据");
		return 0;
	}
	if (!Const[type]) {
		g_logger.print.error("type类型错误" + type);
		return 0;
	}
	return Number(data[Const[type]]);
};
Advertis.prototype.calcRandom = function(type) {

	if (!type) {
		g_logger.print.error("参数错误");
		return 0;
	}
	var topRandom = this.getRandomByType(type);
	var random = Math.floor(Math.random() * 100);
	g_logger.print.info(topRandom);
	g_logger.print.info(random);
	if (random < topRandom) {
		return (this.isShow = 1);
	}
	return (this.isShow = 0);
};
Advertis.prototype.isShowAdvertis = function() {
	return this.isShow;
};

Advertis.prototype.cacheAdvertisRew = function(type, rew) {

	if (!type || !rew) {
		g_logger.print.error("参数错误");
		return;
	}
	this.reward.length = 0;
	// 复制暂存一份奖励
	for (var i = 0; i < rew.length; i++) {
		
		var iid = rew[i].iid;
		var num = rew[i].num;
		if (type == 4 && iid == g_handle.item_mgr.getCurrencyId("power") ) {
			continue;
		}
		this.reward.push({
			iid: iid,
			num: num
		});
	}
	g_logger.print.info(this.reward);
};

Advertis.prototype.setAdvertisRew = function(player) {

	this.isShow = 0;// 奖励领取完成后置空
	player.setItem(this.reward, false, "广告奖励");
	return this.reward;
};

Advertis.prototype.destroy = function() {
	this.isShow = 0;
	this.reward = null;
};

module.exports = Advertis;



