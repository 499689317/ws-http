
var Const = {
	EASY: 1,// 简单
	NORMAL: 2,// 普通
	HARD: 3,// 困难
};
// 关卡类
function Level(res) {

	this.rid = res.rid || "";// 角色id
	this.levels = res.levels || null;// 关卡数据
	this.init();// 初始化
}
// 地图初始化
Level.prototype.init = function() {

	// 默认开启简单第一关
	if (!this.levels) {

		this.levels = {};

		var lid = "12100001";
		var sid = this.getSidByLevelId(lid);
		if (!sid) {
			g_logger.print.error("sid获取失败" + sid);
			return;
		}

		var level = this.getInitLevel(lid);
		if (!level) {
			g_logger.print.error("初始关卡数据错误" + level);
			return;
		}

		this.levels[sid] = {};
		this.levels[sid][lid] = level;
		this.setLevelData();
	}
	g_logger.print.info(this.levels);
}

// 初始化关卡数据
// sid: 章节id
// lid: 关卡id
Level.prototype.getInitLevel = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return null;
	}
	var tType = Const.EASY;
	var type = this.getTypeById(id);
	if (type == Const.NORMAL) {
		tType = Const.NORMAL;
	} else if (type == Const.HARD) {
		tType = Const.HARD;
	}
	// 这里有部份数据得单独提取出来统计？
	return {
		id: id,// 关卡id
		type: tType,// 难度标识：easy(简单)，normal(普通)，hard(困难)
		time: 0,// 时间
		star: 0,// 记录最大获得星数
		total: 0,// 总次数
		totalTime: 0,// 记录所有通关的总时间
		oneStar: 0,// 一星通关次数
		twoStar: 0,// 二星通关次数
		threeStar: 0,// 三星通关次数
		isRewGet1: 0,// 一星奖励
		isRewGet2: 0,// 二星奖励
		isRewGet3: 0,// 三星奖励
	};
}

// 关卡分类
Level.prototype.calcLevels = function(type, sid) {

	if (!type || !sid) {
		g_logger.print.error("参数错误" + type + sid);
		return null;
	}

	if (!this.levels) {
		g_logger.print.error("关卡数据错误" + this.levels);
		return null;
	}

	var chapter = this.levels[sid];
	if (!chapter) {
		g_logger.print.error("章节未开启" + sid);
		return null;
	}

	var list = [];
	for(var key in chapter) {
		// var tType = this.getTypeById(chapter[key].id);
		// if (tType == type) {
			list.push({
				id: chapter[key].id,
				type: chapter[key].type,
				time: chapter[key].time,
				star: chapter[key].star,
				isRewGet1: chapter[key].isRewGet1,
				isRewGet2: chapter[key].isRewGet2,
				isRewGet3: chapter[key].isRewGet3,
			});
		// }
	}
	return list;
}
// 当前难度开启的章节
Level.prototype.calcAllSid = function(type) {

	if (!type) {
		g_logger.print.error("参数错误" + type);
		return 0;
	}
	if (!this.levels) {
		g_logger.print.error("关卡数据错误" + this.levels);
		return 0;
	}
	var list = [];
	for(var sid in this.levels) {
		var tType = this.getTypeById(sid);
		if (tType == type) {
			list.push(sid);
		}
	}
	return list;
}

// ============================
// ============================
// ============================
// =======    关卡推图逻辑
// ============================
// ============================
// ============================

// type: 1, 2, 3
Level.prototype.getLevelByType = function(type) {

	if (!type) {
		g_logger.print.error("参数错误" + type);
		return null;
	}

	var data = g_data.module.LevelTemplateData.RECORDS;// level表
	if (!data || !data.length) {
		g_logger.print.error("关卡数据表错误" + data);
		return null;
	}
	var level = {};
	for (var i = 0; i < data.length; i++) {
		
		var id = data[i].ID;
		var tType = this.getTypeById(id);
		if (tType == type) {
			level[id] = data[i];
		}
	}
	return level;
}

// 根据章节id获取章节表数据
Level.prototype.getChapterBySid = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return null;
	}

	var data = g_data.module.StageTemplateData.RECORDS;// 章节表
	if (!data || !data.length) {
		g_logger.print.error("章节数据表错误" + data);
		return null;
	}
	for (var i = 0; i < data.length; i++) {
		if (data[i].ID == id) {
			return data[i];
		}
	}
	return null;
}
// 根据关卡id获取关卡表数据
Level.prototype.getLvTableById = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return null;
	}

	var data = g_data.module.LevelTemplateData.RECORDS;// level表
	for (var i = 0; i < data.length; i++) {
		if (data[i].ID == id) {
			return data[i];
		}
	}
	return null;
}

// 解析章节解锁条件
Level.prototype.getOpenCdt = function(id) {

	var data = this.getChapterBySid(id);
	if (!data) {
		return 0;
	}
	var isopen = data.isopen;
	if (!isopen || isopen == "0") {
		g_logger.print.debug("无需开启条件" + id);
		return 1;
	}
	var arr = isopen.split(",");
	if (arr.length < 2) {
		g_logger.print.debug("自动开启条件" + id);
		return arr[0];
	}
	g_logger.print.debug("手动开启条件" + id);
	return {
		iid: arr[0],
		num: arr[1]
	};
}
// 判断元素是否足够
Level.prototype.isCdtEnough = function(player, id) {

	if (!player || !id) {
		g_logger.print.error("参数错误" + id);
		return 0;
	}

	var cdt = this.getOpenCdt(id);
	if (!cdt) {
		return 0;
	}
	if (cdt == 1) {
		return 1;
	}
	if (typeof cdt == "object" && player.items[id] && player.items[id].num >= Number(cdt.num)) {
		return 1;
	}
	g_logger.print.debug("元素不足");
	return 0;
}
// 扣除消耗
Level.prototype.delCdt = function(player, id) {

	var cdt = this.getOpenCdt(id);
	if (typeof cdt == "object") {

		g_handle.item_mgr.delItem(player, cdt.iid, cdt.num);
	}
}
// 开启新章节
Level.prototype.openChapter = function(id) {

	if (!id || this.levels[id]) {
		g_logger.print.error("参数错误" + id);
		return;
	}

	// 新章节对象
	this.levels[id] = {};
	var data = this.getChapterBySid(id);
	if (!data) {
		g_logger.print.error("章节数据表错误" + id);
		return;
	}
	// 根据章节id获取当前章节默认开启关卡
	var lid = data.defaultLevelID;
	this.createLevel(lid);
}

// 获取关卡id
Level.prototype.getLevelById = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return null;
	}

	var levels = this.levels;
	if (!levels) {
		g_logger.print.error("关卡数据错误" + id);
		return null;
	}

	var sid = this.getSidByLevelId(id);
	if (!sid) {
		g_logger.print.error("关卡sid错误" + id);
		return null;
	}

	var chapter = levels[sid];
	if (!chapter) {
		g_logger.print.error("关卡章节未开启" + sid);
		return null;
	}

	var level = chapter[id];
	if (!level) {
		g_logger.print.error("当前关卡未开启" + id);
		return null;
	}
	return level;
}

// 根据关卡id获取章节id
Level.prototype.getSidByLevelId = function(id) {

	if (!id || typeof id != "string") {
		g_logger.print.error("参数错误" + id);
		return 0;
	}
	var type = this.getTypeById(id);
	var data = this.getLevelByType(type);
	if (!data) {
		g_logger.print.error("难度类型关卡错误" + type);
		return 0;
	}
	if (!data[id]) {
		g_logger.print.error("id对应关卡错误" + id);
		return 0;
	}
	return data[id].stageID;
}

// 获取关卡难易类型
Level.prototype.getTypeById = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return 0;
	}
	id = id + "";
	return id.substring(2, 3);// 截取第3位难易类型
}

// 判断关卡难易类型
Level.prototype.isEasyLevel = function(id) {

	var type = this.getTypeById(id);
	if (type == Const.EASY) {
		return 1;
	}
	return 0;
}
Level.prototype.isNormalLevel = function(id) {

	var type = this.getTypeById(id);
	if (type == Const.NORMAL) {
		return 1;
	}
	return 0;
}
Level.prototype.isHardLevel = function(id) {

	var type = this.getTypeById(id);
	if (type == Const.HARD) {
		return 1;
	}
	return 0;
}

// 判断关卡是否通关
Level.prototype.isPassLevel = function(id) {

	if (!id || typeof id != "string") {
		g_logger.print.error("参数错误" + id);
		return 0;
	}
	
	var level = this.getLevelById(id);
	if (!level) {
		g_logger.print.error("当前关卡未开启" + id);
		return 0;
	}
	// 判断星星是否大于0
	if (level.star && level.star > 0) {
		return 1;
	}
	return 0;
}
// 判断玩家是否开启关卡
Level.prototype.isOpenLevel = function(id) {

	if (!id || typeof id != "string") {
		g_logger.print.error("参数错误" + id);
		return 0;
	}

	var level = this.getLevelById(id);
	if (!level) {
		g_logger.print.error("当前关卡未开启" + id);
		return 0;
	}
	return 1;
}

// 判断关卡是否存在(根据策划配表判断)
Level.prototype.isExistLevel = function(id) {

	if (!id || typeof id != "string") {
		g_logger.print.error("参数错误" + id);
		return 0;
	}
	var sid = this.getSidByLevelId(id);
	var type = this.getTypeById(id);
	var level = this.getLevelByType(type);
	
	if (level[id]) {
		return 1;
	}
	return 0;
}

// 开启新关卡
Level.prototype.gmOpenLevels = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return;
	}

	var level = this.getLevelById(id);
	if (!level) {
		g_logger.print.error("关卡未开启" + id);
		return;
	}
	// 置为已通过状态
	level.star = 1;
	this.setLevelFeild(id, "star", 1);
}

// 根据当前关卡id开启新关卡
Level.prototype.openLevels = function(id) {

	if (!id || typeof id != "string") {
		g_logger.print.error("参数错误" + id);
		return;
	}

	// id为简单关卡id
	// 开启下一简单关卡
	// 判断是否需要开启普通关卡
	// id为普通关卡id
	// 判断下一普通关卡的简单关卡是否通关
	// 判断是否需要开启困难关卡
	// id为困难关卡id
	// 判断下一困难关卡的普通关卡是否通关
	
	var type = this.getTypeById(id);
	var cId = parseInt(id);

	// 新关卡开启条件
	if (this.isEasyLevel(cId) ) {
		// 开启下一简单关卡
		this.openEasyLevel(type, cId);
		// 判断是否更新难度
		this.openStepLevel(cId);
	}
	if (this.isNormalLevel(cId) ) {
		// 判断是否有需要开启的普通关卡
		this.openNormalLevel(type, cId);
		// 判断是否更新难度
		this.openStepLevel(cId);
	}
	if (this.isHardLevel(cId) ) {
		// 判断是否有需要开启的困难关卡
		this.openHardLevel(type, cId);
	}
}

Level.prototype.openStepLevel = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return;
	}

	var data = g_data.module.StageTemplateData.RECORDS;// 章节表
	for (var i = 0; i < data.length; i++) {
		if (data[i].isopen == id) {

			var sid = data[i].ID;
			var arr = sid.split("");
			var step = Number(arr[1]);
			step++;
			arr[1] = "" + step;
			var lid = arr.join("");

			if (this.isOpenLevel(lid) ) {
				g_logger.print.error("关卡已开启" + lid);
				return;
			}
			// 非新章节，更新难度
			if (!this.levels[sid] ) {
				this.levels[sid] = {};
			}
			this.createLevel(lid);
			return;
		}
	}
}

Level.prototype.openEasyLevel = function(type, id) {

	if (!type || !id) {
		g_logger.print.error("参数错误" + type + id);
		return;
	}

	id++;// 关卡自加1
	var nextId = "" + id;
	if (!this.isExistLevel(nextId) ) {
		g_logger.print.error("关卡不存在" + nextId);
		return;
	}

	// 判断是否已开启过
	if (this.isOpenLevel(nextId) ) {
		g_logger.print.error("关卡已开启过" + nextId);
		return;
	}

	// 开启下一简单关卡
	this.createLevel(nextId);
}
Level.prototype.openNormalLevel = function(type, id) {

	if (!type || !id) {
		g_logger.print.error("参数错误" + type + id);
		return;
	}

	id++;// 关卡自加1
	var str = "" + id;
	var arr = str.split("");
	arr[2] = "1";
	var prevId = arr.join("");// 用于判断低难度关卡是否开启(这个id有可能会读表)

	var nextId = "" + id;
	if (!this.isPassLevel(prevId) ) {
		g_logger.print.error("简单关卡未通关" + prevId);
		return;
	}
	if (!this.isExistLevel(nextId) ) {
		g_logger.print.error("关卡不存在" + nextId);
		return;
	}

	// 判断是否已开启过
	if (this.isOpenLevel(nextId) ) {
		g_logger.print.error("关卡已开启过" + nextId);
		return;
	}

	// 开启下一普通关卡
	this.createLevel(nextId);
}
Level.prototype.openHardLevel = function(type, id) {

	if (!type || !id) {
		g_logger.print.error("参数错误" + type + id);
		return;
	}

	id++;// 关卡自加1
	var str = "" + id;
	var arr = str.split("");
	arr[2] = "2";
	var prevId = arr.join("");
	
	var nextId = "" + id;
	if (!this.isPassLevel(prevId) ) {
		g_logger.print.error("普通关卡未通关" + prevId);
		return;
	}
	if (!this.isExistLevel(nextId) ) {
		g_logger.print.error("关卡不存在" + nextId);
		return;
	}

	// 判断是否已开启过
	if (this.isOpenLevel(nextId) ) {
		g_logger.print.error("关卡已开启过" + nextId);
		return;
	}

	// 开启下一困难关卡
	this.createLevel(nextId);

	// 方便后期拓展更困难模式
	
}

// 创建新关卡
Level.prototype.createLevel = function(id) {

	if (!id || typeof id != "string") {
		g_logger.print.error("参数错误" + id);
		return;
	}

	// 对应章节id
	var sid = this.getSidByLevelId(id);
	if (!sid) {
		g_logger.print.error("章节id错误" + sid);
		return;
	}

	//========================
	//========================
	//== 这里不会开启新章节
	//== 新章节由元素控制开启
	//========================
	//========================
	if (!this.levels[sid]) {
		g_logger.print.debug("章节暂未开启" + sid);
		return;
	}

	// 更新关卡数据
	var level = this.getInitLevel(id);
	this.levels[sid][id] = level;
	this.setNextLevel(sid, id, level);
}

// 根据id计算关卡奖励
Level.prototype.calcLevelRew = function(id) {

	var data = this.getLvTableById(id);
	if (!data) {
		g_logger.print.error("关卡对应关卡表数据错误" + id);
		return null;
	}

	// 元素
	var debris = data.debris;
	var debris_num = data.debris_num;

	var deList = this.parseLevelRew(debris, debris_num);
	var deRews = this.calcRewPro(deList);

	// 道具
	var drops = data.drops;
	var drops_num = data.drops_num;

	var drList = this.parseLevelRew(drops, drops_num);
	var drRews = this.calcRewPro(drList);

	if (deRews && drRews) {
		return deRews.concat(drRews);
	}
	g_logger.print.error("奖励出问题了");
	return null;
}
// 解析关卡奖励数据
Level.prototype.parseLevelRew = function(rewIds, rewNum) {

	if (!rewIds || !rewNum) {
		g_logger.print.error("参数错误" + rewIds + rewNum);
		return null;
	}
	
	if (rewIds == "0" || rewNum == "0") {
		g_logger.print.error("表未填奖励" + rewIds + rewNum);
		return [];
	}

	var ids = rewIds.split(":");
	var num = rewNum.split(":");
	var list = [];
	for (var i = 0; i < ids.length; i++) {
		list.push({
			iid: ids[i],
			max: num[i][0],
			min: num[i][1],
			pro: num[i][2],
		});
	}
	return list;
}
// 计算概率
Level.prototype.calcRewPro = function(list) {

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
		if (random < pro) {
			var num = Math.floor(Math.random() * (max - 1) ) + min;
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
// 同步奖励
Level.prototype.setReward = function(player, list) {

	if (!list || !list.length) {
		g_logger.print.error("奖励未同步成功" + list);
		return;
	}
	for (var i = 0; i < list.length; i++) {
		var iid = list[i].iid;
		var num = list[i].num;
		g_handle.item_mgr.addItem(player, iid, num);
	}
}

// 数据入库
Level.prototype.setLevelData = function() {
	g_db_api.upsert("level", {rid: this.rid}, {"$set": this });
}
// 章节数据
Level.prototype.setChapterData = function(id) {

	if (!id) {
		g_logger.print.error("数据入库错误" + id);
		return;
	}
	var exec = "levels." + id;
	var con = {};
	con[exec] = {};
	g_db_api.update("level", {rid: this.rid}, {"$set": con });
}

Level.prototype.setLevelFeild = function(id, feild, value) {

	if (!id || !feild) {
		g_logger.print.error("数据入库错误" + id);
		return;
	}
	var sid = this.getSidByLevelId(id);
	if (!sid) {
		g_logger.print.error("章节id错误" + id);
		return;
	}
	var exec = "levels." + sid + "." + id + "." + feild;
	var con = {};
	con[exec] = value;
	g_db_api.update("level", {rid: this.rid}, {"$set": con });
}
Level.prototype.setNextLevel = function(sid, id, value) {

	if (!sid || !id) {
		g_logger.print.error("数据入库错误" + id);
		return;
	}
	var exec = "levels." + sid + "." + id;
	var con = {};
	con[exec] = value;
	g_db_api.update("level", {rid: this.rid}, {"$set": con });
}

// 销毁函数
Level.prototype.destroy = function() {
	this.rid = 0;
	this.levels = null;
}

module.exports = Level;


