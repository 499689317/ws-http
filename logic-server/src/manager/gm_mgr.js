
//=====================
//=====================
//=====================
//=======   gm管理
//=====================
//=====================
//=====================

function GmMgr() {

}
GmMgr.prototype.init = function() {
	// 初始化统计数据
	g_logger.print.info("初始化gm系统");
	return new Promise(function(resolve, reject) {
		resolve();
	});
}

GmMgr.prototype.gmPlayerInfo = function(req, res, data) {

	if (!data || !data.rid) {
		g_logger.print.error("参数错误");
		return;
	}
	var rid = data.rid;
	var list = [];
	var pData = null;
	if (g_handle.player_mgr.online[rid] ) {
		pData = g_handle.player_mgr.online[rid];
	}
	if (g_handle.player_mgr.offline[rid] ) {
		pData = g_handle.player_mgr.offline[rid];
	}
	if (pData) {
		list.push({
			rid: pData.rid,
			acc: pData.acc,
			name: pData.name,
			gold: pData.gold,
			jewel: pData.jewel,
			createTime: pData.createTime,
			loginTime: pData.loginTime,
			isLine: pData.isLine,
			offTime: pData.offTime,
		});
		var msg = {
			error: g_CONST.ERROR.SUCCESS,
			data: list
		};
		res.end(JSON.stringify(msg) );
		return;
	}
	g_db_api.findOne("player", [{rid: rid}, {_id: 0}], function(err, ret) {

		if (ret) {
			pData = ret;
			list.push({
				rid: pData.rid,
				acc: pData.acc,
				name: pData.name,
				gold: pData.gold,
				jewel: pData.jewel,
				createTime: pData.createTime,
				loginTime: pData.loginTime,
				isLine: pData.isLine,
			});
		}
		var msg = {
			error: g_CONST.ERROR.SUCCESS,
			data: list
		};
		res.end(JSON.stringify(msg) );
	});
}

GmMgr.prototype.gmPlayerLevel = function(req, res, data) {
	
	if (!data || !data.rid) {
		g_logger.print.error("参数错误");
		return;
	}

	var rid = data.rid;
	var pData = null;
	if (g_handle.player_mgr.online[rid] ) {
		pData = g_handle.player_mgr.online[rid];
	}
	if (g_handle.player_mgr.offline[rid] ) {
		pData = g_handle.player_mgr.offline[rid];
	}
	if (pData && pData.level) {
		var msg = {
			error: g_CONST.ERROR.SUCCESS,
			data: pData.level
		};
		res.end(JSON.stringify(msg) );
		return;
	}
	g_db_api.findOne("level", [{rid: rid}, {_id: 0}], function(err, ret) {
		
		var msg = {
			error: g_CONST.ERROR.SUCCESS,
			data: ret
		};
		res.end(JSON.stringify(msg) );
	});
}

GmMgr.prototype.gmStatisInfo = function(req, res, data) {
	
	if (!data || !data.rid) {
		g_logger.print.error("参数错误");
		return;
	}

	var rid = data.rid;
	var pData = null;
	if (g_handle.player_mgr.online[rid] ) {
		pData = g_handle.player_mgr.online[rid];
	}
	if (g_handle.player_mgr.offline[rid] ) {
		pData = g_handle.player_mgr.offline[rid];
	}
	if (pData && pData.level) {
		var msg = {
			error: g_CONST.ERROR.SUCCESS,
			data: pData.statistics
		};
		res.end(JSON.stringify(msg) );
		return;
	}
	g_db_api.findOne("statis", [{rid: rid}, {_id: 0}], function(err, ret) {
		
		var msg = {
			error: g_CONST.ERROR.SUCCESS,
			data: ret
		};
		res.end(JSON.stringify(msg) );
	});
}

GmMgr.prototype.gmPlayerItem = function(req, res, data) {

	if (!data || !data.rid || !data.list) {
		g_logger.print.error("参数错误" + data);
		return;
	}
	var rid = data.rid;
	var list = data.list;

	g_logger.print.info(rid);
	g_logger.print.info(list);
	var player = null;
	// 玩家在线状态
	if (g_handle.player_mgr.online[rid] ) {
		player = g_handle.player_mgr.online[rid];
		player.setItem(list, false, "gm添加道具");
		res.end(JSON.stringify({error: 0, state: 1}) );
		return;
	}
	// 玩家离线状态
	if (g_handle.player_mgr.offline[rid] ) {
		player = g_handle.player_mgr.offline[rid];
		player.setItem(list, false, "gm添加道具");
		res.end(JSON.stringify({error: 0, state: 2}) );
		return;
	}
	// 玩家下线状态
	for (var i = 0; i < list.length; i++) {
			
		var iid = list[i].iid + "";
		var num = Number(list[i].num);
		// 原来数目+当前数目
		if (g_handle.item_mgr.isGold(iid) ) {
			g_db_api.findOne("player", [{rid: rid}, {_id: 0}], function(err, ret) {
				if (ret) {
					var n = ret.gold + num;
					g_db_api.update("player", {rid: rid}, {"$set": {"gold": n}});
				}
			});
		} else if (g_handle.item_mgr.isJewel(iid) ) {
			g_db_api.findOne("player", [{rid: rid}, {_id: 0}], function(err, ret) {
				if (ret) {
					var n = ret.jewel + num;
					g_db_api.update("player", {rid: rid}, {"$set": {"jewel": n}});
				}
			});
		} else if (g_handle.item_mgr.isPower(iid) ) {
			g_db_api.findOne("player", [{rid: rid}, {_id: 0}], function(err, ret) {
				if (ret) {
					var n = ret.power + num;
					g_db_api.update("player", {rid: rid}, {"$set": {"power": n}});
				}
			});
		} else {
			g_db_api.findOne("item", [{rid: rid, iid: iid}, {_id: 0}], function(err, ret) {
				var n = num;
				if (ret) {
					n += ret.num;
				}
				g_db_api.upsert("player", {rid: rid}, {"$set": {"num": n}});
			});
		}
	}
	res.end(JSON.stringify({error: 0, state: 3}) );
}

//========================
//========================
//========================
//== 关卡推图指令(gm指令)
//========================
//========================
//========================

GmMgr.prototype.gmOpenLevel = function(req, res, data) {

	if (!data || !data.rid || !data.lid) {
		g_logger.print.error("参数错误" + data);
		return;
	}
	var rid = data.rid;
	var lid = data.lid;


	// 开启当前关卡前面的所有关卡
	
	// this.openNextLevel(player, id);
	


}

module.exports = new GmMgr();


