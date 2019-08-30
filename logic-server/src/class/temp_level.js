
var Const = {
	EASY: 1,// 简单
	NORMAL: 2,// 普通
	HARD: 3,// 困难
};
// 关卡类
function Level(res) {

	this.rid = res.rid || 0;// 角色id
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
	// g_logger.print.info(this.levels);
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
		score: 0,// 分数
		total: 0,// 总次数
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
				score: chapter[key].score,
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
Level.prototype.getChapterById = function(id) {

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
// 根据章节id获取当前已开启多少关卡
Level.prototype.getLevelCount = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return 0;
	}
	if (!this.levels[id]) {
		g_logger.print.error("章节未开启" + id);
		return 0;
	}
	return Object.keys(this.levels[id]).length;
}
// 根据难度类型获取当前已开启关卡数
Level.prototype.getLevelCountByType = function(type) {

	if (!type) {
		g_logger.print.error("参数错误");
		return 0;
	}
	var count = 0;
	for(var id in this.levels) {

		var tType = this.getTypeById(id);
		if (type == tType) {
			count += this.getLevelCount(id);
		}
	};
	g_logger.print.info("当前难度开启关卡数：" + count);
	return count;
}
// 判断是否达到关卡进度
Level.prototype.isLevelProgress = function(type) {
	if (!type) {
		g_logger.print.error("参数错误");
		return 0;
	}
	var data = this.getGlobalLevelData();
	if (!data) {
		g_logger.print.error("全局配置数据错误");
		return 0;
	}
	var counts = null;
	if (type == Const.EASY) {
		counts = data.param.split(",");
	} else if (type == Const.NORMAL) {
		counts = data.param2.split(",");
	} else if (type == Const.HARD) {
		counts = data.param3.split(",");
	}
	if (!counts) {
		g_logger.print.error("难度类型错误" + type);
		return 0;
	}

	var totalCount = Number(counts[0]);
	if (totalCount) {

		var count = this.getLevelCountByType(type);
		var curProgress = count / totalCount;
		var progress = Number(counts[1]);
		g_logger.print.info(curProgress + "/" + progress);
		if (curProgress >= progress) {
			return 1;
		}
	}
	return 0;
}
// 获取难度下关卡数量
Level.prototype.getGlobalLevelData = function() {
	
	var data = g_data.module.GlobalTemplateData.RECORDS;
	for (var i = 0; i < data.length; i++) {
		if (data[i].ID == "level_progress") {
			return data[i];
		}
	}
	return null;
}

// 解析章节解锁条件
Level.prototype.getOpenCdt = function(id) {

	var data = this.getChapterById(id);
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
	g_logger.print.debug("开启章节id" + id);
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
	g_logger.print.info(cdt);
	if (typeof cdt == "object") {
		var iid = cdt.iid;
		var num = Number(cdt.num);
		if (player.items[iid] && player.items[iid].num >= num) {
			return 1;
		}
	}
	g_logger.print.debug("元素不足");
	return 0;
}
// 扣除消耗
Level.prototype.delCdt = function(player, id) {

	var cdt = this.getOpenCdt(id);
	if (typeof cdt == "object") {
		g_handle.item_mgr.delItem(player, cdt.iid, cdt.num, "解锁章节消耗");
	}
}

// 是否可以解锁章节
Level.prototype.isCanOpenChapter = function(id) {

	if (!id) {
		g_logger.print.error("参数错误");
		return 0;
	}
	var limit = this.getChapterById(id).limit;// 章节解锁条件
	if (limit == "0") {
		g_logger.print.info("没有解锁条件限制" + id);
		return 1;
	}
	// 解锁条件是某一关卡id,判断该关卡是否已解锁
	if (!this.isPassLevel(limit) ) {
		g_logger.print.error("章节解锁条件不满足" + limit);
		return 0;
	}
	return 1;
}

// 开启新章节
Level.prototype.openChapter = function(id, isLevel) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return;
	}
	if (this.levels[id]) {
		g_logger.print.debug("章节已开启" + id);
		return;
	}

	var data = this.getChapterById(id);
	if (!data) {
		g_logger.print.error("章节数据表错误" + id);
		return;
	}
	// 新章节对象
	this.levels[id] = {};
	if (!isLevel) {
		// 根据章节id获取当前章节默认开启关卡
		var lid = data.defaultLevelID;
		return this.createLevel(lid);
	}
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

// 判断当前奖励是否领取过
// 异常情况全部按已领取计算
Level.prototype.isFirstGet = function(id, star) {

	if (!id || !star) {
		g_logger.print.error("参数错误" + id + star);
		return 1;
	}

	var data = this.getLevelById(id);
	if (!data) {
		g_logger.print.error("关卡数据错误" + id);
		return 1;
	}

	if (star == 1) {
		return data.isRewGet1;
	} else if (star == 2) {
		return data.isRewGet2;
	} else if (star == 3) {
		return data.isRewGet3;
	}
	return 1;
}

// 根据关卡id获取章节id
Level.prototype.getSidByLevelId = function(id) {

	if (!id || typeof id != "string") {
		g_logger.print.error("参数错误" + id);
		return 0;
	}
	var data = this.getLvTableById(id);
	if (!data) {
		g_logger.print.error("关卡对应表数据错误" + id);
		return 0;
	}
	return data.stageID;
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
	
	var data = this.getLvTableById(id);
	if (data) {
		return 1;
	}
	return 0;
}

// 判断章节是否开启
Level.prototype.isOpenChapter = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return 0;
	}
	if (this.levels[id]) {
		return 1;
	}
	g_logger.print.debug("章节未开启" + id);
	return 0;
}
Level.prototype.isExistChapter = function(id) {
	if (!id) {
		g_logger.print.error("参数错误" + id);
		return 0;
	}
	var data = this.getChapterById(id);
	if (!data) {
		g_logger.print.error("章节不存在" + id);
		return 0;
	}
	return 1;
}

// 根据当前关卡id开启新关卡
Level.prototype.openLevels = function(id) {

	if (!id || typeof id != "string") {
		g_logger.print.error("参数错误" + id);
		return;
	}
	
	var data = this.getLvTableById(id);
	if (!data) {
		g_logger.print.error("id对应关卡表数据错误" + id);
		return;
	}

	// 新关卡id
	var islock = data.islock.split(",");
	var nextLid = islock[0];
	var nextSid = islock[1];
	var levelList = [];
	//===========================
	//===========================
	//===========================
	//=判断是否已达最大开启关卡数
	//===========================
	//===========================
	//===========================
	// var sid = data.stageID;// 当前章节id
	// if (sid) {
	// 	var limit = this.getChapterById(sid).limit;
	// 	var fsid = Number(sid) - 1;

	// 	// 上一章节是否存在:说明当前是第一章节，不限制开启关卡
	// 	// 上一章节未开启
	// 	if (this.isExistChapter(fsid) && !this.isOpenChapter(fsid) ) {
	// 		var count = this.getLevelCount(sid);
	// 		if (count >= Number(limit) ) {
	// 			return;
	// 		}
	// 	}
	// }
	
	// 开启下一关卡过滤下"0"的情况
	if (nextLid && nextLid != "0") {
		var lev = null;
		if (this.isEasyLevel(id) ) {
			lev = this.openEasyLevel(nextLid);
		}
		if (this.isNormalLevel(id) ) {
			lev = this.openNormalLevel(nextLid);
		}
		if (this.isHardLevel(id) ) {
			lev = this.openHardLevel(nextLid);
		}
		if (lev) {
			levelList.push(lev);
		}
	}
	// 特殊处理第一章
	if (nextSid && nextSid != "0") {
		var lev2 = this.openChapter(nextSid);
		if (lev2) {
			levelList.push(lev2);
		}
	}
	return levelList;
}

Level.prototype.openEasyLevel = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return;
	}
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
	return this.createLevel(nextId);
}
Level.prototype.openNormalLevel = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return;
	}

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
	return this.createLevel(nextId);
}
Level.prototype.openHardLevel = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return;
	}

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
	return this.createLevel(nextId);

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
	return level;
}
// 根据id计算关卡奖励
Level.prototype.getRewardStr = function(id) {

	if (!id) {
		g_logger.print.error("参数错误");
		return null;
	}

	var data = this.getLvTableById(id);
	if (!data) {
		g_logger.print.error("关卡对应关卡表数据错误" + id);
		return null;
	}
	// 返回奖励字符
	return {
		wingold: data.wingold,
		basicgold: data.basicgold,
		debris: data.debris,
		debris_num: data.debris_num,
		drops: data.drops,
		drops_num: data.drops_num
	}
}
Level.prototype.calcLevelGold = function(id, star, isCheat) {

	if (!id || !star) {
		g_logger.print.error("参数错误" + id + star);
		return null;
	}

	var data = this.getRewardStr(id);
	if (!data) {
		g_logger.print.error("关卡奖励数据错误" + id);
		return null;
	}

	// 金币
	var iid = "10000001";
	var star = Number(star);
	var first_num = 0;
	if (!this.isFirstGet(id, star) ) {
		// 首次
		var golds = data.wingold.split(",");
		first_num = Number(golds[star - 1]) || 0;
	}

	// 保底金币掉落
	var basic_golds = data.basicgold.split(",");
	num = Number(basic_golds[star - 1]) || 0;
	num += first_num;
	
	g_logger.print.info("金币" + num + "首次" + first_num);

	// 兼容前端离线数据同步问题
	if (isCheat) {
		var gs = data.wingold.split(",");
		var f = Number(gs[star - 1]) || 0;
		var max = num + f;
		// g_logger.print.debug("可获得最大金币数量" + max);
		return [{
			iid: iid,
			num: max
		}];
	}
	return [{
		iid: iid,
		num: num
	}];
}
Level.prototype.calcLevelRew = function(id) {

	var data = this.getRewardStr(id);
	if (!data) {
		g_logger.print.error("关卡奖励数据错误" + id);
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

	var ids = rewIds.split(":");
	var num = rewNum.split(":");
	// g_logger.print.info(ids);
	// g_logger.print.info(num);
	var list = [];
	for (var i = 0; i < ids.length; i++) {
		var nums = num[i].split(",");
		list.push({
			iid: ids[i],
			min: nums[0],
			max: nums[1],
			pro: nums[2],
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
		if (!iid || iid == 0) {
			continue;
		}
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
					num: num
				});
			}
		}
	}
	return rews;
}

//=========================
//=========================
//=========================
//==========    数据入库
//=========================
//=========================
//=========================
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
// 同步奖励
Level.prototype.setFirstRew = function(id, star) {

	if (!id || !star) {
		g_logger.print.error("参数错误" + id);
		return;
	}
	var levelData = this.getLevelById(id);
	if (!levelData) {
		g_logger.print.debug("关卡未开启" + id);
		return;
	}
	var exec = "";
	if (star == 1) {
		exec = "isRewGet1";
		levelData.isRewGet1 = 1;
	} else if (star == 2) {
		exec = "isRewGet2";
		levelData.isRewGet2 = 1;
	} else if (star == 3) {
		exec = "isRewGet3";
		levelData.isRewGet3 = 1;
	}
	this.setLevelFeild(id, exec, 1);
}

//=========================
//=========================
//=========================
//=======    开启新关卡
//=========================
//=========================
//=========================
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

// 销毁关卡数据
Level.prototype.destroy = function() {
	this.rid = 0;
	if (this.levels) {
		for (var id in this.levels) {
			this.levels[id] = null;
		}
		this.levels = null;
	}
}

module.exports = Level;


