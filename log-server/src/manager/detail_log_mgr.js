
var DetailLog = require("../class/detail_log.js");

function DetailLogMgr() {
	this.detailLog = null;
}

DetailLogMgr.prototype.init = function() {

	return new Promise(function(resolve, reject) {
		
		// g_db_api.find("detail_log", {}, function(err, list) {

		// 	if (err) {
		// 		g_logger.print.error("查找数据库失败" + err);
		// 		reject();
		// 		return;
		// 	}
			
			if (!this.detailLog) {
				this.detailLog = new DetailLog();
			}
			resolve();
		// }.bind(this));
	}.bind(this));
}

// 更新日志记录
DetailLogMgr.prototype.updateLogData = function(req, res, data) {

	if (!data || !data.logId) {
		g_logger.print.error("参数错误");
		return;
	}

	if (!this.detailLog) {
		g_logger.print.error("模块数据错误");
		return;
	}

	var rid = data.rid;
	var time = data.time;
	var logId = data.logId;
	var state = data.state;

	g_logger.print.info(rid);
	g_logger.print.info("time: " + new Date(time) );
	g_logger.print.info("logId: " + logId);
	g_logger.print.info("state: " + JSON.stringify(state) );
	
	this.detailLog.updateLog(data, null);




	// var rid = data.rid;
	// var time = data.time;
	// var sid = data.sid;
	// var lid = data.lid;
	// var state = data.state;
	// var logId = data.logId;
	// if (logId == 1 || logId == 3 || logId == 4 || logId == 5 
	// 	|| logId == 6 || logId == 7 || logId == 8 || logId == 10 
	// 	|| logId == 11 || logId == 12 || logId == 13 || logId == 21 
	// 	|| logId == 22 || logId == 23 || logId == 24 || logId == 25
	// 	|| logId == 26) {
	// 	// g_logger.print.info("updateLog");
	// 	this.detailLog.updateLog({
	// 		rid: rid,
	// 		time: time,
	// 		state: state,
	// 		logId: logId
	// 	});
	// } else if (logId == 14) {
	// 	this.detailLog.guideLog({
	// 		rid: rid,
	// 		time: time,
	// 		state: state
	// 	});
	// } else if (logId == 15) {
	// 	this.detailLog.levelLog({
	// 		rid: rid,
	// 		time: time,
	// 		sid: sid,
	// 		lid: lid,
	// 		state: state
	// 	});
	// } else if (logId == 16) {
	// 	this.detailLog.unlockLog({
	// 		rid: rid,
	// 		time: time,
	// 		sid: sid,
	// 		state: state
	// 	});
	// } else if (logId == 18) {
	// 	this.detailLog.loadLog({
	// 		rid: rid,
	// 		time: time,
	// 		state: state
	// 	});
	// } else if (logId == 19) {
	// 	this.detailLog.intervalLog({
	// 		rid: rid,
	// 		time: time,
	// 		state: state
	// 	});
	// }
}

module.exports = new DetailLogMgr();



