
var Item = require("../class/item.js");
//======================
//======================
//======================
//=======    道具管理
//======================
//======================
//======================

function ItemMgr() {

}

ItemMgr.prototype.init = function(player) {

	g_logger.print.info("初始化玩家背包数据");
	return new Promise(function(resolve, reject) {
		
		var rid = player.rid;
		player.items = {};
		g_db_api.find("item", [{rid: rid}, {_id: 0}], function(err, list) {

			if (err) {
				g_logger.print.error("查找item数据库失败" + err);
				reject();
				return;
			}
			if (list && list.length) {
				for (var i = 0; i < list.length; i++) {
					var iid = list[i].iid;// 道具id
					player.items[iid] = new Item(list[i]);
				}
			}
			resolve();
		});
	});
}

// 增加道具
ItemMgr.prototype.addItem = function(player, iid, num, des) {

	if (!player || !iid || !num) {
		g_logger.print.error("参数错误" + iid + num);
		return;
	}
	if (!des) des = "";
	g_logger.print.info(des + "新增背包物品" + iid + "数目：" + num);
	g_logger.cout.log(player.rid + "||" + des + "新增背包物品" + iid + "数目：" + num);

	// 判断是否有这个道具
	if (player.items[iid]) {
		
		var itemNum = player.items[iid].calcItemNum(num);
		player.items[iid].setItemNum(itemNum);
	} else {

		var cfg = {
			rid: player.rid,
			iid: iid,
			num: num,
		};
		player.items[iid] = new Item(cfg);
		player.items[iid].setItemData();
	}
}
// 减少道具
ItemMgr.prototype.delItem = function(player, iid, num, des) {

	if (!player || !iid || !num) {
		g_logger.print.error("参数错误" + iid + num);
		return;
	}

	// 判断是否有这个道具
	if (player.items[iid]) {

		if (!des) des = "";
		g_logger.print.info(des + "消耗背包物品" + iid + "数目：" + num);
		g_logger.cout.log(player.rid + "||" + des + "消耗背包物品" + iid + "数目：" + num);

		var delNum = -num;
		var itemNum = player.items[iid].calcItemNum(delNum);
		if (itemNum) {
			player.items[iid].setItemNum(itemNum);
		} else {

			// 用完此道具
			player.items[iid].removeItem();
			player.delItem(iid);
		}
	} else {
		g_logger.print.error("未获得此道具");
	}
}

// 后期优化背包数据结构
ItemMgr.prototype.filtItems = function(player) {

	if (!player) {
		g_logger.print.error("参数错误");
		return null;
	}
}

ItemMgr.prototype.isItemEnough = function(player, list) {

	if (!player || !list) {
		g_logger.print.error("参数错误");
		return 0;
	}
	var count = 0;
	for (var i = 0; i < list.length; i++) {
		
		var iid = list[i].iid;
		var num = list[i].num;
		if (player.items && player.items[iid] && player.items[iid].num >= num) {
			count++;
		} else {
			g_logger.print.error("道具不足：" + iid + "数目：" + num);
		}
	}
	if (count >= list.length) {
		return 1;
	}
	return 0;
}

// ==================
// ==================
// ==================
// 处理物品id
// ==================
// ==================
// ==================

ItemMgr.prototype.getCurrencyById = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return null;
	}
	var data = g_data.module.CurrencyTemplateData.RECORDS;// 货币表
	for (var i = 0; i < data.length; i++) {
		if (data[i].ID == id) {
			return data[id];
		}
	}
	return null;
}
ItemMgr.prototype.getCurrencyId = function(tag) {
	if (!tag) {
		return "";
	}
	if (tag == "gold") {
		return "10000001";
	} else if (tag == "jewel") {
		return "10000002";
	} else if (tag == "power") {
		return "10000003";
	}
}

// 根据id判断物品类型
ItemMgr.prototype.isGold = function(id) {
	if (!id) {
		g_logger.print.error("参数错误" + id);
		return 0;
	}
	if (id == this.getCurrencyId("gold") ) {
		return 1;
	}
	return 0;
}
ItemMgr.prototype.isJewel = function(id) {
	if (!id) {
		g_logger.print.error("参数错误" + id);
		return 0;
	}
	if (id == this.getCurrencyId("jewel") ) {
		return 1;
	}
	return 0;
}
ItemMgr.prototype.isPower = function(id) {
	if (!id) {
		g_logger.print.error("参数错误" + id);
		return 0;
	}
	if (id == this.getCurrencyId("power") ) {
		return 1;
	}
	return 0;
}
ItemMgr.prototype.isElement = function(id) {
	if (!id && typeof id != "string") {
		g_logger.print.error("参数错误" + id);
		return 0;
	}
	var tag = id.substring(0, 2);
	if (tag == "13") {
		return 1;
	}
	return 0;
}
ItemMgr.prototype.isProp = function(id) {
	if (!id && typeof id != "string") {
		g_logger.print.error("参数错误" + id);
		return 0;
	}
	var tag = id.substring(0, 2);
	if (tag == "14") {
		return 1;
	}
	return 0;
}

module.exports = new ItemMgr();


