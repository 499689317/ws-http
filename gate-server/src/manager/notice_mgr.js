
var Notice = require("../class/notice.js");

function NoticeMgr() {
	this.notice = null;
}

NoticeMgr.prototype.init = function() {

	g_logger.print.info("初始化消息广播模块数据");
	return new Promise(function(resolve, reject) {
		
		g_db_api.find("notice", [{}, {_id: 0}], function(err, list) {
			
			if (err) {
				g_logger.print.error("查找notice数据错误" + err);
				reject();
				return;
			}
			this.notice = new Notice();
			resolve();
		}.bind(this));
	}.bind(this));
}

NoticeMgr.prototype.getNotice = function(req, res, data) {

	// 客户端对应取消息的标识
	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	if (!data || !data.version) {
		g_logger.print.error("参数错误");
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	if (!this.notice) {
		g_logger.print.error("广播模块数据错误");
		msg.error = g_CONST.ERROR.MODULE_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}
	var version = data.version;
	g_logger.print.info(version);
	var notice = this.notice.getNoticeByVersion(version);
	g_logger.print.info(notice);
	msg.data = notice;
	res.end(JSON.stringify(msg) );
}
NoticeMgr.prototype.getNoticeByVersion = function(version) {
	if (!version) {
		g_logger.print.error("参数错误");
		return null;
	}
	if (!this.notice) {
		g_logger.print.error("广播模块数据错误");
		return null;
	}
	return this.notice.getNoticeByVersion(version);
}

// 给所有逻辑服务器广播消息
NoticeMgr.prototype.broadcast = function() {

}

module.exports = new NoticeMgr();





