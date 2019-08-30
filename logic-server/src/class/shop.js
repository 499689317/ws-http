
var merch_list = [
	{
		index: 1,
		iid: "13000002",
		curr: "10000001",
		price: "10",
		top: 0,
		discount: 1
	},
	{
		index: 2,
		iid: "13000002",
		curr: "10000001,10000002",
		price: "10,5",
		top: 0,
		discount: 1
	}
];




//============================
//============================
//============================
//========        商城
//============================
//============================
//============================



function Shop() {
	this.rid = 0;// 角色id
	this.type = 0;// 商店类型
	this.shop = null;// 货架信息
}
Shop.prototype.init = function(goods_len, shop_len) {
	
	if (!goods_len || shop_len === undefined) {
		g_logger.print.error("参数错误" + goods_len + shop_len);
		return;
	}
	if (!this.shop) {
		g_logger.print.error("商店数据错误");
		return;
	}

	// 初始化货架数据，新加/减货架要及时同步
	// 对比玩家当前数据与表数据是否有区别
	var goods_len = Number(goods_len);
	var shop_len = Number(shop_len);

	// 只要货架个数不一致，则同步更新为最新的表数据
	if (goods_len == shop_len) {
		g_logger.print.debug("货架位置不更新");
		return;
	}
	// 货架数量已改变，实时更新货架信息
	if (goods_len > shop_len) {

		for(var i = 0; i < goods_len; i++) {
			var index = i + 1;
			if (this.shop[index]) continue;
			this.shop[index] = this.getInitGoods(index);
		};
	} else {

		for(var idx in this.shop) {
			if (Number(idx) <= goods_len) continue;
			delete this.shop[idx];
		};
	}
	g_logger.print.info(this.shop);
}
Shop.prototype.getInitGoods = function(index) {
	if (!index) {
		g_logger.print.error("参数错误");
		return null;
	}
	return {
		index: index,iid: 0,price: 0,top: 0,cur: 0,discount: 1
	};
}

// 根据货架编号取商品
Shop.prototype.getGoodsByIndex = function(index) {

	if (!index) {
		g_logger.print.error("参数错误" + index);
		return null;
	}
	if (!this.shop) {
		g_logger.print.error("商店数据错误");
		return null;
	}
	if (!this.shop[index]) {
		g_logger.print.error("对应编号货架不存在" + index);
		return null;
	}
	return this.shop[index];
}
// 计算单价
Shop.prototype.getMerchPrice = function(index, mode) {

	if (!index) {
		g_logger.print.error("参数错误" + index);
		return 0;
	}

	var goods = this.getGoodsByIndex(index);
	if (!goods) {
		g_logger.print.error("商品货架不存在" + index);
		return 0;
	}
	var prices = this.parseStr(goods.price);
	var price = prices[0];
	if (mode) {
		price = prices[mode];
	}
	var discount = Number(goods.discount);
	// 单价一般往下取整
	return Math.floor(Number(price) * discount);
}

// 获取某一货架商品
Shop.prototype.getMerchByIndex = function(index, merch) {

	if (!index || !merch) {
		g_logger.print.error("参数错误");
		return null;
	}
	// g_logger.print.info(index);
	// g_logger.print.info(merch);
	for(var idx in merch) {
		if (merch[idx].index == index) {
			return merch[idx];
		}
	};
	g_logger.print.error("没有对应商品" + index);
	return null;
}

// 商品是否卖完
Shop.prototype.isSoldOut = function(index) {

	if (!index) {
		g_logger.print.error("参数错误" + index);
		return 1;
	}
	var goods = this.getGoodsByIndex(index);
	if (!goods) {
		g_logger.print.error("商品货架不存在" + index);
		return 1;
	}

	var top = Number(goods.top);
	var cur = Number(goods.cur);
	if (!top) {
		g_logger.print.debug("商品可以无限制购买" + index);
		return 0;
	}
	if (cur >= top) {
		g_logger.print.info("商品已售完");
		return 1;
	}
	return 0;
}

// 判断商品货架是否在商店存在
Shop.prototype.isMerchExist = function(index) {
	if (this.getGoodsByIndex(index) ) {
		return 1;
	}
	g_logger.print.error("货架不存在" + index);
	return 0;
}

// 购买商品
Shop.prototype.getMerchList = function(index, num) {

	if (!index || !num) {
		g_logger.print.error("参数错误");
		return null;
	}
	var data = this.getGoodsByIndex(index);
	if (!data) {
		g_logger.print.error("商品数据错误");
		return null;
	}
	var iid = data.iid;
	var num = Number(num);
	return [{
		iid: iid,
		num: num
	}];
}
Shop.prototype.parseStr = function(str) {

	if (!str) {
		g_logger.print.error("参数错误" + str);
		return null;
	}
	return str.split(",");
}
// 获取用户所需要的花费
Shop.prototype.getCostList = function(index, num, mode) {

	if (!index || !num) {
		g_logger.print.error("参数错误");
		return null;
	}
	if (!this.isMerchExist(index) ) {
		g_logger.print.error("货架不存在");
		return null;
	}
	var data = this.getGoodsByIndex(index);
	if (!data) {
		g_logger.print.error("商品数据错误");
		return null;
	}
	var iids = this.parseStr(data.curr);
	var prices = this.parseStr(data.price);
	var iid = iids[0];
	var price = prices[0];
	if (mode) {
		iid = iids[mode];
		price = prices[mode];
	}
	g_logger.print.info(iid);
	g_logger.print.info(price);
	var total = Number(price) * Number(data.discount) * Number(num);// 打完折价钱
	return [{
		iid: iid,
		num: total
	}];
}
// 判断用户货币是否足够
Shop.prototype.isMoneyEnough = function(player, index, num, mode) {

	if (!player || !index || !num) {
		g_logger.print.error("参数错误");
		return 0;
	}
	var list = this.getCostList(index, num, mode);
	if (!list) {
		g_logger.print.error("消耗品获取错误");
		return 0;
	}
	for (var i = 0; i < list.length; i++) {
		var iid = list[i].iid;
		var total = list[i].num;
		if (g_handle.item_mgr.isGold(iid) ) {
			return player.isGoldEnough(total);
		} else if (g_handle.item_mgr.isJewel(iid)) {
			return player.isJewelEnough(total);
		}
	}
	return 0;
}
// 扣除消耗
Shop.prototype.delMoney = function(player, index, num, mode) {

	if (!player || !index) {
		g_logger.print.error("参数错误");
		return;
	}
	var list = this.getCostList(index, num, mode);
	if (!list) {
		g_logger.print.error("消耗品获取错误");
		return 0;
	}
	player.setItem(list, true, "商城购买扣除货币");
}
// 购买收益
Shop.prototype.addMerch = function(player, index, num) {

	if (!player || !index) {
		g_logger.print.error("参数错误");
		return;
	}
	var list = this.getMerchList(index, num);
	if (!list) {
		g_logger.print.error("获取购买商品错误");
		return;
	}
	player.setItem(list, false, "商城购买物品");
	return list;
}

// 根据不同商城的数据刷新商城(刷新是有代价的)
// 刷新后商品将不发生改变直到下一次刷新
Shop.prototype.refreshMerch = function() {

}

// 同步商品信息数据
Shop.prototype.setShopData = function(type) {

	if (!this.rid || !this.shop || !type) {
		g_logger.print.error("rid" + this.rid);
		g_logger.print.error("type" + type);
		return;
	}
	var con = {
		shop: this.shop
	};
	g_db_api.upsert("user_shop", {rid: this.rid, type: type}, {"$set": con});
}
// 销毁商店
Shop.prototype.destroy = function() {
	this.rid = 0;
	this.type = 0;
	this.shop = null;
}






// ===========================
// ===========================
// ===========================
// =======      各商城实例
// ===========================
// ===========================
// ===========================





// ===========================
// ===========================
// ===========================
// ======       金币商城
// ===========================
// ===========================
// ===========================



function GoldShop(res) {
	Shop.call(this);

	this.rid = res.rid || 0;
	this.type = res.type || 0;
	this.shop = res.shop || {};
	this.initGoldShop();
}
GoldShop.prototype = Object.create(Shop.prototype);
GoldShop.prototype.constructor = Shop;

GoldShop.prototype.initGoldShop = function() {

	g_logger.print.info("金币商城");

	// 初始化货架数据，新加/减货架要及时同步
	// 对比玩家当前数据与表数据是否有区别
	var goods_len = this.getGoldGoods().param;
	var shop_len = Object.keys(this.shop).length;
	g_logger.print.info(goods_len);
	g_logger.print.info(shop_len);
	this.init(goods_len, shop_len);// 调用父类方法初始化金币货架
	
	// 将金币货品放入货架内
	var gold_merch = this.getGoldMerch();
	for (var index in this.shop) {
		
		if (this.shop[index].iid) continue;
		var merch = this.getMerchByIndex(index, gold_merch);
		if (!merch) continue;
		this.shop[index].iid = merch.iid;
		this.shop[index].price = merch.price;
		this.shop[index].top = merch.top;
		this.shop[index].discount = merch.discount;
		this.shop[index].curr = merch.curr;
	}
	g_logger.print.info(this.shop);
	// 更新数据库
	this.setShopData(this.type);
}
// 获取金币商店货架数据(直接读表数据)
GoldShop.prototype.getGoldGoods = function() {
	var data = g_data.module.GlobalTemplateData.RECORDS;
	for (var i = 0; i < data.length; i++) {
		if (data[i].ID == "user_gold_shop") {
			return data[i];
		}
	}
	return null;
}
GoldShop.prototype.getGoldMerch = function() {
	return merch_list;
}
exports.GoldShop = GoldShop;





// ===========================
// ===========================
// ===========================
// ======     钻石商城
// ===========================
// ===========================
// ===========================



function JewelShop(res) {
	Shop.call(this);

	this.rid = res.rid || 0;
	this.type = res.type || 0;
	this.shop = res.shop || {};
	this.initJewelShop();
}
JewelShop.prototype = Object.create(Shop.prototype);
JewelShop.prototype.constructor = Shop;

JewelShop.prototype.initJewelShop = function() {

	g_logger.print.info("钻石商城");

	var goods_len = this.getJewelGoods().param;
	var shop_len = Object.keys(this.shop).length;
	g_logger.print.info(goods_len);
	g_logger.print.info(shop_len);
	this.init(goods_len, shop_len);// 调用父类方法初始化金币货架
	
	// 将钻石货品放入货架内
	var jewel_merch = this.getJewelMerch();
	for (var index in this.shop) {
		
		if (this.shop[index].iid) continue;
		var merch = this.getMerchByIndex(index, jewel_merch);
		if (!merch) continue;
		this.shop[index].iid = merch.iid;
		this.shop[index].price = merch.price;
		this.shop[index].top = merch.top;
		this.shop[index].discount = merch.discount;
		this.shop[index].curr = merch.curr;
	}
	g_logger.print.info(this.shop);
	// 更新数据库
	this.setShopData(this.type);
}
JewelShop.prototype.getJewelGoods = function() {
	var data = g_data.module.GlobalTemplateData.RECORDS;
	for (var i = 0; i < data.length; i++) {
		if (data[i].ID == "user_jewel_shop") {
			return data[i];
		}
	}
	return null;
}
JewelShop.prototype.getJewelMerch = function() {
	return merch_list;
}

exports.JewelShop = JewelShop;





// ===========================
// ===========================
// ===========================
// ======     主题商城
// ===========================
// ===========================
// ===========================



function ThemeShop(res) {
	Shop.call(this);

	this.rid = res.rid || 0;
	this.type = res.type || 0;
	this.shop = res.shop || {};

	this.initThemeShop();
}
ThemeShop.prototype = Object.create(Shop.prototype);
ThemeShop.prototype.constructor = Shop;

ThemeShop.prototype.initThemeShop = function() {

	g_logger.print.info("主题商城");

	var goods_len = this.getThemeGoods().param;
	var shop_len = Object.keys(this.shop).length;
	g_logger.print.info(goods_len);
	g_logger.print.info(shop_len);
	this.init(goods_len, shop_len);// 调用父类方法初始化金币货架
	
	// 将主题货品放入货架内
	var theme_merch = this.getThemeMerch();
	for (var index in this.shop) {
		
		if (this.shop[index].iid) continue;
		var merch = this.getMerchByIndex(index, theme_merch);
		if (!merch) continue;
		this.shop[index].iid = merch.iid;
		this.shop[index].price = merch.price;
		this.shop[index].top = merch.top;
		this.shop[index].discount = merch.discount;
		this.shop[index].curr = merch.curr;
	}
	g_logger.print.info(this.shop);
	// 更新数据库
	this.setShopData(this.type);
}
ThemeShop.prototype.getThemeGoods = function() {
	var data = g_data.module.GlobalTemplateData.RECORDS;
	for (var i = 0; i < data.length; i++) {
		if (data[i].ID == "user_theme_shop") {
			return data[i];
		}
	}
	return null;
}
ThemeShop.prototype.getThemeMerch = function() {
	return merch_list;
}

exports.ThemeShop = ThemeShop;





