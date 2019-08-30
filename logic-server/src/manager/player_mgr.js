
var Player = require("../class/player.js");

var OFF_LINE_TIME = g_untis.getCacheTime();// 玩家数据在缓存中缓存的时长
// 玩家管理类
function PlayerMgr() {

	this.online = {};// 记录当前在线玩家
	this.offline = {};// 记录离线玩家
}

PlayerMgr.prototype.init = function() {

	/**
	 * 这里暂时先这样,后期可能要改?
	 * 预加载一部份玩家到内存
	 * 主要选取最近登录过玩家
	 */
	g_logger.print.info("预加载一部分玩家");
	return new Promise(function(resolve, reject) {

		// g_db_api.find("player", {}, function(err, list) {
			g_logger.print.info("玩家预加载完成");
			// if (err) {
			// 	g_logger.print.error("查找player数据库失败" + err);
			// 	reject();
			// 	return;
			// }
			resolve();
		// });
	}.bind(this));
}

// 登录
PlayerMgr.prototype.login = function(socket, data) {
	
	var msg = {
		id: g_CONST.PROTO.LOGIN_LOGIN,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	if (!data || !data.rid/* || !data.acc || !data.name*/) {
		g_logger.print.error("参数错误" + data);
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		socket.send(JSON.stringify(msg) );
		return;
	}

	var rid = data.rid;// 角色id
	var acc = data.acc;// 账号
	var name = data.name;// 昵称
	var nowTime = Date.now();
	g_logger.print.info("玩家登录游戏：" + rid);
	// 玩家已登录
	if (this.online[rid]) {
		g_logger.print.error("登录过程玩家在在线队列中" + rid);
		this.destroy(rid, "online");// 这里fix账号登录不上的情况
		socket.send(JSON.stringify(msg) );
		return;
	}
	// 玩家在缓存中
	if (this.offline[rid]) {

		g_logger.print.error("登录过程玩家在离线队列中" + rid);
		this.online[rid] = this.offline[rid];
		delete this.offline[rid];
		
		this.online[rid].isLine = 1;// 玩家置为在线状态
		this.online[rid].offTime = 0;// 将玩家离线时间置0
		this.online[rid].socket = socket;
		socket.player = this.online[rid];

		if (g_worker) {
			g_worker.send({
				id: g_CONST.PROCESS.LOGIN,
				loginTime: socket.player.loginTime,
				createTime: socket.player.createTime
			});
			g_worker.send({
				id: g_CONST.PROCESS.PLAYER_LOGIN,
				rid: rid,
				time: nowTime,
				type: 2,
			});
		}
		socket.send(JSON.stringify(msg) );
		return;
	}

	g_db_api.findOne("player", [{rid: rid}, {_id: 0}], function(err, ret) {

		if (err) {
			g_logger.print.error("查找player数据库失败" + err);
			reject();
			return;
		}

		// 创建角色
		if (!ret) {
			g_logger.print.error("玩家未创建", rid);
			msg.error = g_CONST.ERROR.LOGIN_NO_PLAYER;
			socket.send(JSON.stringify(msg) );
			return;
		}

		// 角色创建成功
		var player = new Player(ret);
		player.socket = socket;
		socket.player = player;
		this.online[rid] = player;

		if (g_worker) {
			g_worker.send({
				id: g_CONST.PROCESS.LOGIN,
				loginTime: player.loginTime,
				createTime: player.createTime
			});
			g_worker.send({
				id: g_CONST.PROCESS.PLAYER_LOGIN,
				rid: rid,
				time: nowTime,
				type: 2,
			});
		}

		player.loginTime = nowTime;// 更新玩家登录时间
		player.setPlayerFeild("loginTime", player.loginTime);
		g_logger.print.info("创建老玩家成功");
		socket.send(JSON.stringify(msg) );
	}.bind(this));
}

// 注册新用户
// 一定要先调用login方法判断是否已经注册用户，否则引发大bug
PlayerMgr.prototype.createPlayer = function(socket, data) {

	var msg = {
		id: g_CONST.PROTO.LOGIN_CREATE_PLAYER,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	if (!data || !data.rid/* || !data.acc || !data.name*/) {
		g_logger.print.error("参数错误" + data);
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		socket.send(JSON.stringify(msg) );
		return;
	}
	var nowTime = Date.now();
	var rid = data.rid;
	var acc = data.acc;
	var name = data.name;
	g_logger.print.info("创建新玩家：" + rid);
	// 玩家已创建
	if (this.online[rid]) {
		g_logger.print.error("创建新玩家过程在线队列中" + rid);
		msg.error = g_CONST.ERROR.LOGIN_HAD_PLAYER;
		socket.send(JSON.stringify(msg) );
		return;
	}
	// 玩家在缓存中
	if (this.offline[rid]) {
		g_logger.print.error("创建新玩家过程在离线队列中" + rid);
		msg.error = g_CONST.ERROR.LOGIN_HAD_PLAYER;
		socket.send(JSON.stringify(msg) );
		return;
	}

	// 这里还需要检索一下数据库是否已有该帐号？？？
	// 按理来说只要先走了login的话已经确保了用户的唯一性的
	
	var config = {
		rid: rid,
		acc: acc,
		name: name,
		gold: 0,
		jewel: 0,
		createTime: nowTime,
		loginTime: nowTime,
	};
	g_db_api.insert("player", config, function(err, result) {

		if (err) {
			g_logger.print.error("数据插入player数据库失败" + err);
			return;
		}

		// TODO
		// 为了保险起见，此处等数据入库成功后创建
		// 这里暂时先不作处理，有可能后期会改
		
		var player = new Player(config);
		player.socket = socket;
		socket.player = player;
		this.online[rid] = player;
		// 初始化部分初次进入游戏的数据
		var data = player.getPowerData();
		player.setPower(Number(data.common_top), "初次进入游戏");// 玩家体力初始化
		
		g_logger.print.info("创建新玩家成功");
		if (g_worker) {
			g_worker.send({
				id: g_CONST.PROCESS.REGIST,
				time: nowTime
			});
			g_worker.send({
				id: g_CONST.PROCESS.PLAYER_LOGIN,
				rid: rid,
				time: nowTime,
				type: 1,
			});
		}
		socket.send(JSON.stringify(msg) );
	}.bind(this));
}

// 结束新手引导
PlayerMgr.prototype.endGuild = function(player, data) {

	var msg = {
		id: g_CONST.PROTO.GUIDE_END,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};
	if (!player || !data) {
		g_logger.print.error("参数错误");
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		msg.data.isEndGuide = {};
		player.socket.send(JSON.stringify(msg) );
		return;
	}
	
	player.isEndGuide = data.isEndGuide || {};
	player.setPlayerFeild("isEndGuide", player.isEndGuide);
	msg.data.isEndGuide = player.isEndGuide;
	player.socket.send(JSON.stringify(msg) );
}

// 定时掉落
PlayerMgr.prototype.getTimeDrop = function(player, data) {
	
	var msg = {
		id: g_CONST.PROTO.ITEM_DROP,
		error: g_CONST.ERROR.SUCCESS,
		data: {}
	};

	if (!player) {
		g_logger.print.error("参数错误");
		msg.error = g_CONST.ERROR.PARAM_ERROR;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	if (!player.isCanGetDropItem() ) {
		g_logger.print.debug("领取条件不满足");
		msg.error = g_CONST.ERROR.ITEM_DROP_NO_GET;
		player.socket.send(JSON.stringify(msg) );
		return;
	}

	var drop = player.getDropItem();
	player.setItem(drop, false, "定时奖励掉落");
	msg.data.resetTime = player.getDropResetTime();
	msg.data.drop = drop;
	g_logger.print.info(msg);
	player.socket.send(JSON.stringify(msg) );
}


// 直接将超过缓存期的玩家踢出游戏
PlayerMgr.prototype.kickOffTimePlayer = function() {
	var nowTime = Date.now();
	g_logger.print.debug("检测离线玩家队列：" + Object.keys(this.offline).length );
	// 将离线x时间段以上的玩家踢出游戏
    for(var id in this.offline) {

        var offTime = this.offline[id].offTime;
        var waitTime = nowTime - offTime;
        if (waitTime >= OFF_LINE_TIME) {
            g_logger.print.debug("将离线玩家踢出服务器" + id);
            this.offline[id].destroy();
            delete this.offline[id];
        }
    }
}
// socket断开连接前玩家处于离线状态
// 移除角色，所有对角色的引用都要解除
PlayerMgr.prototype.destroy = function(rid, msg) {

	if (!this.online[rid]) {
		g_logger.print.error("玩家不在在线队列---socket上没有player" + rid);
		return;
	}
	g_logger.print.debug("将玩家从在线队列移到离线队列" + rid);
	g_logger.print.debug("断开socket连接" + msg);

	var nowTime = Date.now();
	if (g_worker) {
		g_worker.send({
			id: g_CONST.PROCESS.PLAYER_LOGIN,
			rid: rid,
			time: nowTime,
			type: 3,
		});
	}

	// 清理socket连接
	this.online[rid].clearSocket();
	// 先将玩家标识为已离线状态
	this.online[rid].isLine = 0;
	// 记录玩家离线时间
	this.online[rid].offTime = nowTime;

	// 将离线玩家加入离线队列
	// TODO 这里将offline做一个上限处理
	// 如果对像达到500-1000个对象
	// 将最先装入的对象移除???这里有待思考
	this.offline[rid] = this.online[rid];

	// 将离线玩家从在线队列移除
	delete this.online[rid];
}

module.exports = new PlayerMgr();


