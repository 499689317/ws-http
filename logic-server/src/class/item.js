

//=======================
//=======================
//=======================
//=======      道具
//=======================
//=======================
//=======================

function Item(res) {

	this.rid = res.rid || 0;// 角色id
	this.iid = res.iid || 0;// 道具id
	this.num = res.num || 0;// 数量
	// this.type = res.type || 0;// 道具类型(这个字段可能要标识道具)
	
}

Item.prototype.init = function() {

}

// 累加当前道具数目
Item.prototype.calcItemNum = function(num) {

	if (typeof num != "number") {
		g_logger.print.error("参数错误");
		return 0;
	}
	this.num += num;
	if (this.num < 0) {
		g_logger.print.debug("道具数量小于0，需要检查原因");
		this.num = 0;
	}
	return this.num;
}

// 数据入库
Item.prototype.setItemData = function() {

	g_db_api.upsert("item", {rid: this.rid, iid: this.iid}, {"$set": this });
}
Item.prototype.setItemNum = function(num) {

	if (typeof num != "number") {
		g_logger.print.error("参数错误" + num);
		return;
	}
	g_db_api.update("item", {rid: this.rid, iid: this.iid}, {"$set": {"num": num}});
}
Item.prototype.removeItem = function() {
	g_db_api.remove("item", {rid: this.rid, iid: this.iid});
}

// 销毁道具
Item.prototype.destroy = function() {
	this.rid = 0;
	this.iid = 0;
	this.num = 0;
}

module.exports = Item;


