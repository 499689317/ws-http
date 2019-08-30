
var Const = {
	SHOP_GOLD: 1,// 金币商城
	SHOP_JEWEL: 2,// 钻石商城
	SHOP_THEME: 3,// 主题商城
};
var Shop = require("../class/shop.js");

// 玩家商城管理类
function ShopMgr() {

}
ShopMgr.prototype.init = function(player) {

	// 初始化商城
	g_logger.print.info("初始化玩家个人商城");
	return new Promise(function(resolve, reject) {

		var rid = player.rid;
		player.shops = {};
		g_db_api.find("user_shop", [{rid: rid}, {_id: 0}], function(err, list) {

			if (err) {
				g_logger.print.error("查找user_shop数据库失败" + err);
				reject();
				return;
			}
			var shops_len = Number(this.getGlobalShops().param);
			for (var i = 0; i < shops_len; i++) {

				var type = i + 1;
				var shop = this.getShopByType(type, list);
				var cfg = null;
				if (shop) {
					cfg = shop;
				} else {
					cfg = {
						rid: rid,
						type: type
					};
				}
				this.createShopByType(player.shops, type, cfg);
			}
			resolve();
		}.bind(this));
	}.bind(this));
}

// 动态获取玩家商城信息(方便后期商店拓展)
ShopMgr.prototype.getGlobalShops = function() {
	var data = g_data.module.GlobalTemplateData.RECORDS;
	for (var i = 0; i < data.length; i++) {
		if (data[i].ID == "user_shop") {
			return data[i];
		}
	}
	return null;
};
ShopMgr.prototype.getGlobalPower = function() {
	var data = g_data.module.GlobalTemplateData.RECORDS;
	for (var i = 0; i < data.length; i++) {
		if (data[i].ID == "restore_power") {
			return data[i];
		}
	}
	return null;
};
ShopMgr.prototype.getGlobalTime = function() {
	var data = g_data.module.GlobalTemplateData.RECORDS;
	for (var i = 0; i < data.length; i++) {
		if (data[i].ID == "buy_time") {
			return data[i];
		}
	}
	return null;
};
ShopMgr.prototype.getShopByType = function(type, shops) {

	if (!type || !shops) {
		g_logger.print.error("参数错误");
		return null;
	}
	for (var i = 0; i < shops.length; i++) {
		if (type == shops[i].type) {
			return shops[i];
		}
	}
	return null;
}
// 判断商城是否是新拓展的
ShopMgr.prototype.isShopExist = function(type, shops) {

	if (!type || !shops) return 1;// 按已存在处理
	for (var i = 0; i < shops.length; i++) {
		
		if (type == shops[i].type) {
			return 1;
		}
	}
	g_logger.print.info("初始化新商城" + type);
	return 0;
}

// 根据商店类型创建不同类型的商店
ShopMgr.prototype.createShopByType = function(shops, type, res) {

	if (!shops || !type || !res) {
		g_logger.print.error("参数错误");
		return;
	}
	if (type == Const.SHOP_GOLD) {
		shops.goldShop = new Shop.GoldShop(res);
	} else if (type == Const.SHOP_JEWEL) {
		shops.jewelShop = new Shop.JewelShop(res);
	} else if (type == Const.SHOP_THEME) {
		shops.themeShop = new Shop.ThemeShop(res);
	}
}

// 获取玩家金币商店数据
ShopMgr.prototype.getGoldShopInfo = function(player) {

	if (!player || !player.shops) {
		g_logger.print.error("参数错误");
		return null;
	}
	if (!player.shops.goldShop || !player.shops.goldShop.shop) {
		g_logger.print.error("玩家金币商店数据错误");
		return null;
	}
	return player.shops.goldShop.shop;
}
// 获取玩家钻石商店数据
ShopMgr.prototype.getJewelShopInfo = function(player) {

	if (!player || !player.shops) {
		g_logger.print.error("参数错误");
		return null;
	}
	if (!player.shops.jewelShop || !player.shops.jewelShop.shop) {
		g_logger.print.error("玩家钻石商店数据错误");
		return null;
	}
	return player.shops.jewelShop.shop;
}
// 获取玩家主题商店数据
ShopMgr.prototype.getThemeShopInfo = function(player) {

	if (!player || !player.shops) {
		g_logger.print.error("参数错误");
		return null;
	}
	if (!player.shops.themeShop || !player.shops.themeShop.shop) {
		g_logger.print.error("玩家主题商店数据错误");
		return null;
	}
	return player.shops.themeShop.shop;
}

// 购买商品接口
ShopMgr.prototype.userShopBuyMerch = function(player, data) {

	var msg = {
		id: g_CONST.PROTO.SHOP_BUY,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	
	if (!data || !data.type || !data.index || !data.num) {
		g_logger.print.error("参数错误");
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	var type = data.type;// 商店类型
	var index = data.index;// 货架序号
	var num = data.num;// 购买商品数量
	var mode = data.mode || 0;// 支付方式默认第1种

	var shop = null;
	if (type == Const.SHOP_GOLD) {
		shop = player.shops.goldShop;
	} else if (type == Const.SHOP_JEWEL) {
		shop = player.shops.jewelShop;
	} else if (type == Const.SHOP_THEME) {
		shop = player.shops.themeShop;
	}
	if (!shop) {
		g_logger.print.error("商品类型对应的商店实例不存在" + type);
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	// 条件
	if (!shop.isMerchExist(index) ) {
		g_logger.print.error("货架序号对应货架不存在" + index);
		msg.error = g_CONST.ERROR.SHOP_NO_GOODS;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	// 商品是否已出售完
	
	// 玩家货币是否足够
	if (!shop.isMoneyEnough(player, index, num, mode) ) {
		g_logger.print.error("玩家购买的货币不足");
		msg.error = g_CONST.ERROR.SHOP_NO_MONEY;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	// 扣除消耗
	shop.delMoney(player, index, num, mode);
	
	// 同步收益
	var list = shop.addMerch(player, index, num);
	g_logger.print.debug("商品购买成功");
	msg.data.list = list;
	player.socket.send(JSON.stringify(msg) );
};



// =========================
// =========================
// =========================
// =========购买时间
// =========================
// =========================
// =========================

ShopMgr.prototype.buyTime = function(player, data) {

	var msg = {
		id: g_CONST.PROTO.SHOP_BUY_TIME,
		error: g_CONST.ERROR.SUCCESS,
		data: {isTime: 1}
	};
	if (!player) {
		g_logger.print.error("参数错误");
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		msg.data.isTime = 0;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	// 判断购买时间消耗是否足够
	if (!this.isTimeCostEnough(player) ) {
		g_logger.print.error("购买时间货币不足");
		msg.error = g_CONST.ERROR.SHOP_NO_MONEY;
		msg.data.isTime = 0;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	// 扣除玩家金币
	var cost = this.getTimeCost();
	g_logger.print.info(cost);
	player.setItem(cost, true, "玩家购买时间消耗");
	player.socket.send(JSON.stringify(msg) );
};
ShopMgr.prototype.isTimeCostEnough = function(player) {

	var cost = this.getTimeCost();
	if (!cost || !cost.length) {
		g_logger.print.error("获取购买时间消耗错误");
		return 0;
	}
	var count = 0;
	for (var i = 0; i < cost.length; i++) {
		
		var iid = cost[i].iid;
		var num = Number(cost[i].num);
		if (g_handle.item_mgr.isGold(iid) && player.isGoldEnough(num) ) {
			count++;
		}
		if (g_handle.item_mgr.isJewel(iid) && player.isJewelEnough(num) ) {
			count++;
		}
	}
	g_logger.print.info(count);
	g_logger.print.info(cost.length);
	if (count >= cost.length) {
		return 1;
	}
	return 0;
};
ShopMgr.prototype.getTimeCost = function() {

	var data = this.getGlobalTime();
	if (!data || !data.param) {
		g_logger.print.error("购买时间配置表错误");
		return null;
	}
	var costs = data.param.split(";");
	var cost = [];
	for (var i = 0; i < costs.length; i++) {
		var str = costs[i].split(",");
		cost.push({
			iid: str[0],
			num: str[1]
		});
	}
	return cost;
};


// =========================
// =========================
// =========================
// =========购买精力
// =========================
// =========================
// =========================

ShopMgr.prototype.buyPower = function(player, data) {

	// 一次购买可达到精力恢复上限
	// 条件：当玩家精力为0时可购买精力
	// 消耗：消耗玩家金币
	// 收益：玩家精力值达恢复上限
	var msg = {
		id: g_CONST.PROTO.SHOP_BUY_POWER,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	if (!player) {
		g_logger.print.error("参数错误");
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	if (!this.isCanBuyPower(player) ) {
		g_logger.print.error("精力购买条件不足");
		msg.error = g_CONST.ERROR.SHOP_HAD_POWER;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	if (!this.isPowerCostEnough(player) ) {
		g_logger.print.error("购买精力货币不足");
		msg.error = g_CONST.ERROR.SHOP_NO_MONEY;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	// 扣除消耗
	var cost = this.getPowerCost();
	player.setItem(cost, true, "购买精力消耗");
	g_logger.print.info(cost);
	// 精力购买数量
	var num = this.getBuyPower();
	g_logger.print.info(num);
	// 同步购买精力数量
	player.setPower(num, "购买精力获得");
	msg.data.iid = g_handle.item_mgr.getCurrencyId("power");
	msg.data.num = num;
	player.socket.send(JSON.stringify(msg) );
};
// 玩家精力是否达可购买条件
ShopMgr.prototype.isCanBuyPower = function(player) {
	return player.power === 0;
};
// 玩家购买消耗是否足够
ShopMgr.prototype.isPowerCostEnough = function(player) {

	var cost = this.getPowerCost();
	if (!cost || !cost.length) {
		g_logger.print.error("获取购买体力消耗错误");
		return 0;
	}
	var count = 0;
	for (var i = 0; i < cost.length; i++) {
		
		var iid = cost[i].iid;
		var num = Number(cost[i].num);
		if (g_handle.item_mgr.isGold(iid) && player.isGoldEnough(num) ) {
			count++;
		}
		if (g_handle.item_mgr.isJewel(iid) && player.isJewelEnough(num) ) {
			count++;
		}
	}
	g_logger.print.info(count);
	g_logger.print.info(cost.length);
	if (count >= cost.length) {
		return 1;
	}
	return 0;
};
// 获取购买一次所能获得体力
ShopMgr.prototype.getBuyPower = function() {

	var data = this.getGlobalPower();
	if (!data || !data.param) {
		g_logger.print.error("精力配置表错误");
		return null;
	}
	return Number(data.param);
};
// 玩家购买精力消耗
ShopMgr.prototype.getPowerCost = function() {

	var data = this.getGlobalPower();
	if (!data || !data.param4) {
		g_logger.print.error("精力配置表错误");
		return null;
	}
	var costs = data.param4.split(";");
	var cost = [];
	for (var i = 0; i < costs.length; i++) {
		var str = costs[i].split(",");
		cost.push({
			iid: str[0],
			num: str[1]
		});
	}
	return cost;
};

module.exports = new ShopMgr();


