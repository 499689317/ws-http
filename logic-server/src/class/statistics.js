
// 注册需要统计字段的id
var Const = {
	PVE_TOTAL: "pveDayTotal",
	PVE_WIN: "pveDayWin",
	PVE_STAR: "pveDayStar",
	PVE_SCORE: "pveDayScore"
};

//=====================
//=====================
//=====================
//======    统计系统
//=====================
//=====================
//=====================

function Statistics(res) {

	this.rid          =  res.rid         || 0;
	this.pveDayTotal  =  res.pveDayTotal || 0;// 每日挑战总次数
	this.pveDayWin    =  res.pveDayWin   || 0;// 每日挑战总胜利次数
	this.pveDayStar   =  res.pveDayStar  || 0;// 每日挑战历史获得总星数
	this.pveDayScore  =  res.pveDayScore || 0;// 每日挑战历史最短时间
}

Statistics.prototype.init = function() {
	
}

Statistics.prototype.getStatisById = function(id) {

	if (!id) {
		g_logger.print.error("参数错误" + id);
		return 0;
	}

	switch(id) {

		case Const.PVE_TOTAL:
			return this.pveDayTotal;
		case Const.PVE_WIN:
			return this.pveDayWin;
		case Const.PVE_STAR:
			return this.pveDayStar;
		case Const.PVE_SCORE:
			return this.pveDayScore;
	};
	g_logger.print.error("没有匹配的id" + id);
	return 0;
}
Statistics.prototype.setStatisById = function(id, count) {

	if (!id || typeof count != "number") {
		g_logger.print.error("参数错误" + id + count);
		return;
	}
	
	switch(id) {

		case Const.PVE_TOTAL:
			this.pveDayTotal += count;
			// g_logger.print.info("每日挑战总次数" + this.pveDayTotal);
			this.setDataById(id, this.pveDayTotal);
			break;
		case Const.PVE_WIN:
			this.pveDayWin += count;
			// g_logger.print.info("每日挑战总胜利次数" + this.pveDayWin);
			this.setDataById(id, this.pveDayWin);
			break;
		case Const.PVE_STAR:
			this.pveDayStar += count;
			// g_logger.print.info("每日挑战总星数" + this.pveDayStar);
			this.setDataById(id, this.pveDayStar);
			break;
		case Const.PVE_SCORE:
			this.pveDayScore += count;
			// g_logger.print.info("每日挑战总分数" + this.pveDayScore);
			this.setDataById(id, this.pveDayScore);
			break;
	}
}

// 同步数据
Statistics.prototype.setStatisData = function() {
	g_db_api.upsert("statis", {rid: this.rid}, {"$set": this });
}
Statistics.prototype.setDataById = function(id, value) {

	var con = {};
	con[id] = value;
	g_db_api.update("statis", {rid: this.rid}, {"$set": con});
}

// 销毁统计模块
Statistics.prototype.destroy = function() {
	this.rid = 0;
	this.pveDayTotal = 0;
	this.pveDayWin = 0;
	this.pveDayStar = 0;
	this.pveDayScore = 0;
}

module.exports = Statistics;


