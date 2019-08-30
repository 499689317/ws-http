
var Const = {
	"0.2": "1610001",// 版本0.2对应公告通知
	"0.3": "1610002",// 0.3版本对应公告通知
};

// 游戏公告
// 全服消息推送
// 跑马灯消息推送
function Notice() {

}

Notice.prototype.init = function() {

}

Notice.prototype.getNoticeData = function() {
	return g_data.notice;
}
Notice.prototype.getNoticeByVersion = function(version) {

	if (!version) {
		g_logger.print.error("参数错误" + version);
		return null;
	}
	var data = this.getNoticeData();
	var id = Const[version];
	if (!data[id]) {
		g_logger.print.error("id对应消息不存在" + id);
		return null;
	}
	return data[id];
}

module.exports = Notice;




