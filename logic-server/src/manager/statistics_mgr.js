

var Statistics = require("../class/statistics.js");
//=====================
//=====================
//=====================
//=======   统计管理
//=====================
//=====================
//=====================

function StatisticsMgr() {

}

StatisticsMgr.prototype.init = function(player) {

	// 初始化统计数据
	g_logger.print.info("初始化玩家统计数据");
	return new Promise(function(resolve, reject) {

		var rid = player.rid;
		g_db_api.findOne("statis", [{rid: rid}, {_id: 0}], function(err, ret) {

			if (err) {
				g_logger.print.error("查找statis数据库失败" + err);
				reject();
				return;
			}
			var cfg = {
				rid: rid
			};
			if (ret) {
				cfg = ret;
			}
			// g_logger.print.info(cfg);
			player.statistics = new Statistics(cfg);
			if (!ret) {
				player.statistics.setStatisData();
			}
			resolve();
		});
	});
}

// 添加统计事件
StatisticsMgr.prototype.calcEvent = function(player, id, count) {

	if (!player || !id) {
		g_logger.print.error("参数错误");
		return;
	}

	var statistics = player.statistics;
	if (!statistics) {
		g_logger.print.error("统计模块数据错误");
		return;
	}

	statistics.setStatisById(id, count);
}

// 获取当前统计数据
StatisticsMgr.prototype.getEvents = function(player, id) {

	if (!player || !id) {
		g_logger.print.error("参数错误");
		return 0;
	}

	var statistics = player.statistics;
	if (!statistics) {
		g_logger.print.error("统计模块数据错误");
		return 0;
	}
	return statistics.getStatisById(id);
}

//==========================
//==========================
//==========================
//====  根据计算获得统计数据
//==========================
//==========================
//==========================

// 统计当前获得所有星数
StatisticsMgr.prototype.calcTotalStar = function(player) {

	if (!player || !player.level) {
		g_logger.print.error("参数错误");
		return 0;
	}

	var level = player.level;
	var stars = {
		oneStar: 0,
		twoStar: 0,
		threeStar: 0
	};
	if (level.levels) {
		for(var sid in level.levels) {
			if (!level.levels[sid]) {
				continue;
			}
			for(var id in level.levels[sid]) {
				var type = level.levels[sid][id].type;
				if (type == 1) {
					stars.oneStar += level.levels[sid][id].star;
				} else if (type == 2) {
					stars.twoStar += level.levels[sid][id].star;
				} else if (type == 3) {
					stars.threeStar += level.levels[sid][id].star;
				}
			}
		}
	}
	return stars;
}

module.exports = new StatisticsMgr();


