
/**
 * 更新apk脚本
 * 渠道区分
 * 1：分裂魔方1
 * 2: 分裂魔方2
 *
 * 
 */
function updateMgr() {

}

updateMgr.prototype.init = function() {

}

updateMgr.prototype.getApkVersionData = function() {
	return g_data.apk_version;
}
updateMgr.prototype.getPlatById = function(id) {

	if (!id) {
		g_logger.print.error("参数错误");
		return null;
	}
	var data = this.getApkVersionData()[id];
	if (!data) {
		g_logger.print.error("平台id对应数据错误" + id);
		return null;
	}
	return data;
}

// 根据渠道id获取渠道的下载连接
updateMgr.prototype.getUrlByChannelId = function(pid, id) {

	if (!pid || !id) {
		g_logger.print.error("参数错误");
		return "";
	}
	var data = this.getPlatById(pid);
	if (!data || !data[id]) {
		g_logger.print.error("平台/渠道id错误 ：" + pid + "/" + id);
		return "";
	}
	return data[id].url;
}

// 获取最新的apk版本号-配到Global表中去
updateMgr.prototype.getMaxVersion = function(pid) {

	if (!pid) {
		g_logger.print.error("参数错误");
		return 0;
	}
	var data = this.getPlatById(pid);
	if (!data) {
		g_logger.print.error("平台数据错误" + pid);
		return 0;
	}
	return data.max_version;
}

// 获取包大小
updateMgr.prototype.getPackageSize = function(pid) {

	if (!pid) {
		g_logger.print.error("参数错误");
		return 0;
	}
	var data = this.getPlatById(pid);
	if (!data) {
		g_logger.print.error("平台数据错误" + pid);
		return 0;
	}
	return data.size;
}

// 判断是否需要更新版本
updateMgr.prototype.isUpdate = function(pid, version) {

	if (!pid || !version) {
		g_logger.print.error("参数错误");
		return 0;
	}
	var maxVersion = this.getMaxVersion(pid);
	if (!maxVersion) {
		g_logger.print.warn("暂无最新版本 ：" + maxVersion);
		return 0;
	}
	g_logger.print.debug("apk最新版本 ：" + maxVersion);
	g_logger.print.debug("apk当前版本 ：" + version);
	return maxVersion != version;
}


/**
 * 进入游戏前请求更新接口
 * 1. 对比版本号，判断是否需要更新版本
 * 2. 获取游戏对应的渠道id
 * 3. 派发渠道下对应的下载连接
 */
updateMgr.prototype.updateApkForClient = function(req, res, data) {

	var msg = {
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};

	// 检测参数
	if (!data || !data.channelId || !data.appVersion || !data.terraceID) {
		g_logger.print.error("参数错误");
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		res.end(JSON.stringify(msg) );
		return;
	}

	var channelId = data.channelId;// 渠道id
	var appVersion = data.appVersion;
	var terraceId = data.terraceID;// 平台id
	if (!this.isUpdate(terraceId ,appVersion) ) {
		g_logger.print.warn("不更新apk版本");
		msg.error = g_CONST.ERROR.UPDATE_APK;
		res.end(JSON.stringify(msg) );
		return;
	}

	// 将下载连接给前端
	var url = this.getUrlByChannelId(terraceId ,channelId);
	if (!url) {
		g_logger.print.error("获取下载连接出错" + url);
		msg.error = g_CONST.ERROR.UPDATE_URL;
		res.end(JSON.stringify(msg) );
		return;
	}

	// 请求成功
	g_logger.print.info(url);
	msg.data.url = url;
	msg.data.size = this.getPackageSize(terraceId);
	msg.data.version = this.getMaxVersion(terraceId);
	msg.data.notice = g_handle.notice_mgr.getNoticeByVersion(msg.data.version);
	g_logger.print.info(msg.data.notice);
	res.end(JSON.stringify(msg) );
}

module.exports = new updateMgr();



