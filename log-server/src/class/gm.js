
function Gm() {

}

Gm.prototype.init = function() {

}

Gm.prototype.getPlayerLogin = function(data, cb) {

	if (!data.rid) {
		cb && cb(1);
		return;
	}
	var rid = data.rid;
	g_db_api.findOne("player_login", [{rid: rid}, {_id: 0}], function(err, list) {
		var msg = null;
		if (list && list.length) {
			msg = list[0];
		}
		cb && cb(err, msg);
	});
}

Gm.prototype.getOnline = function(data, cb) {

	var now = new Date();
	if (!data.year) {
		data.year = now.getFullYear();
	}
	if (!data.month) {
		data.month = now.getMonth() + 1;
	}
	if (!data.date) {
		data.date = now.getDate();
	}
	var year = data.year;
	var month = data.month;
	var date = data.date;
	var collection = year + "-" + month;
	var logId = "online-" + date;
	g_logger.print.info(collection + logId);

	// var startTime = Date.now();
	// console.log("开始时间" + startTime);
	g_db_api.findOne(collection, [{logId: logId}, {_id: 0}], function(err, ret) {

		// var endTime1 = Date.now();
		// console.log("结束时间：" + endTime1);
		// console.log("耗时1：", endTime1 - startTime);

		if (ret) {
			ret.time = collection + "-" + date;
		}
		cb && cb(err, ret);
	});
}

Gm.prototype.getRegist = function(data, cb) {

	var now = new Date();
	if (!data.year) {
		data.year = now.getFullYear();
	}
	if (!data.month) {
		data.month = now.getMonth() + 1;
	}

	var year = data.year;
	var month = data.month;
	var date = data.date;
	var collection = year + "-" + month;

	var where = [
		{
			id: "regist"
		},
		{
			_id: 0
		}
	];
	if (data.date) {
		where = [
			{
				logId: "regist-" + date
			},
			{
				_id: 0
			}
		];
	}
	g_logger.print.info(collection);
	g_logger.print.info(where);
	g_db_api.findOne(collection, where, function(err, list) {
		cb && cb(err, {time: collection, list: list});
	});
}

Gm.prototype.getGoBack = function(data, cb) {

	var now = new Date();
	if (!data.year) {
		data.year = now.getFullYear();
	}
	if (!data.month) {
		data.month = now.getMonth() + 1;
	}
	if (!data.date) {
		data.date = now.getDate();
	}
	var year = data.year;
	var month = data.month;
	var date = data.date;
	var collection = year + "-" + month;
	var logId = "regist-login-" + date;
	g_logger.print.info(collection + logId);

	g_db_api.findOne(collection, [{logId: logId}, {_id: 0}], function(err, list) {
		var msg = null;
		if (list && list.length) {
			msg = list[0];
			msg.time = collection + "-" + date;
		}
		cb && cb(err, msg);
	});
}
Gm.prototype.getGoLeave = function(data, cb) {

	var now = new Date();
	if (!data.year) {
		data.year = now.getFullYear();
	}
	if (!data.month) {
		data.month = now.getMonth() + 1;
	}
	if (!data.date) {
		data.date = now.getDate();
	}
	var year = data.year;
	var month = data.month;
	var date = data.date;
	var collection = year + "-" + month;
	var logId = "login-login-" + date;
	g_logger.print.info(collection + logId);

	g_db_api.findOne(collection, [{logId: logId}, {_id: 0}], function(err, list) {
		var msg = null;
		if (list && list.length) {
			msg = list[0];
			msg.time = collection + "-" + date;
		}
		cb && cb(err, msg);
	});
}

module.exports = Gm;



