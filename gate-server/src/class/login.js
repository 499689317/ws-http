
// 玩家登录
function Login(res) {
	this.ridBool = true;// 控制rid唯一
	this.ridSeed = res.ridSeed || 10000000;// 种子id
	this.server_list = [];// 负载均衡列表
}

//=========================
//=========================
//=========================
//=======    获取逻辑服数据
//=========================
//=========================
//=========================

// 获取服务器列表
Login.prototype.getServerList = function() {
	return g_data.server_list;
}
// 获取逻辑服务器
Login.prototype.getDevServer = function() {
	return this.getServerList().dev_server;
}
Login.prototype.getTestServer = function() {
	return this.getServerList().test_server;
}
Login.prototype.getProducteServer = function() {
	return this.getServerList().server;
}
Login.prototype.getEnvServer = function() {
	var server = this.getDevServer();
	if (g_untis.isProduction() ) {
		server = this.getProducteServer();
	} else if (g_untis.isTest() ) {
		server = this.getTestServer();
	}
	return server;
}

// 获取log服务器地址
Login.prototype.getLogServer = function() {

	if (g_untis.isProduction() ) {
		return "http://101.201.234.73:7000/";
	} else if (g_untis.isTest() ) {
		return "http://39.106.101.80:7000/";
	}
	return "http://192.168.1.114:7000/";
}

// 负载均衡算法
// 1、轮询法
// 将请求按顺序轮流地分配到后端服务器上，它均衡地对待后端的每一台服务器，而不关心服务器实际的连接数和当前的系统负载。
// 2、随机法
// 通过系统的随机算法，根据后端服务器的列表大小值来随机选取其中的一台服务器进行访问。由概率统计理论可以得知，随着客户端调用服务端的次数增多，
// 其实际效果越来越接近于平均分配调用量到后端的每一台服务器，也就是轮询的结果。
// 3、源地址哈希法
// 源地址哈希的思想是根据获取客户端的IP地址，通过哈希函数计算得到的一个数值，用该数值对服务器列表的大小进行取模运算，得到的结果便是客服端要访问服务器的序号。采用源地址哈希法进行负载均衡，同一IP地址的客户端，当后端服务器列表不变时，它每次都会映射到同一台后端服务器进行访问。
// 4、加权轮询法
// 不同的后端服务器可能机器的配置和当前系统的负载并不相同，因此它们的抗压能力也不相同。给配置高、负载低的机器配置更高的权重，让其处理更多的请；而配置低、负载高的机器，给其分配较低的权重，降低其系统负载，加权轮询能很好地处理这一问题，并将请求顺序且按照权重分配到后端。
// 5、加权随机法
// 与加权轮询法一样，加权随机法也根据后端机器的配置，系统的负载分配不同的权重。不同的是，它是按照权重随机请求后端服务器，而非顺序。
// 6、最小连接数法
// 最小连接数算法比较灵活和智能，由于后端服务器的配置不尽相同，对于请求的处理有快有慢，它是根据后端服务器当前的连接情况，动态地选取其中当前
// 积压连接数最少的一台服务器来处理当前的请求，尽可能地提高后端服务的利用效率，将负责合理地分流到每一台服务器。

// ============================
// ============================
// ============================
// ==使用最小连接数法做负载均衡
// ============================
// ============================
// ============================
Login.prototype.balanceLoad = function() {

	// 1. 获取所有逻辑服务器列表
	// 2. 使用均摊算法取服务器
	// 3. 这里使用均摊的原因是尽量将请求的次数均摊到所有逻辑服务器上
	// 4. 让每一台逻辑服务器能够负载均衡
	// 求最小值
	var min = this.getMinValue(this.server_list);
	g_logger.print.info(min);
	// 求最小值对应的服务器列表
	var mins = this.getMinList(this.server_list, min);
	g_logger.print.info(mins);
	// 取随机值
	var random = this.randomValue(0, mins.length);
	g_logger.print.info(random);
	// 分配给客户端的服务器
	g_logger.print.info(mins[random]);
	return mins[random];
}
// 取服务器列表
Login.prototype.getMinList = function(list, min) {

	var mins = [];
	for (var i = 0, len = list.length; i < len; i++) {
		if (list[i].count <= min) {
			mins.push(list[i].sid);
		}
	}
	return mins;
}
// 取最小连接数
Login.prototype.getMinValue = function(list) {
	var counts = [];
	for (var i = 0, len = list.length; i < len; i++) {
		counts.push(list[i].count);
	}
	return Math.min.apply(null, counts);
}
// random随机值
Login.prototype.randomValue = function(min, max) {
	if (min === undefined || max === undefined) {
		g_logger.print.error("参数错误" + min + max);
		return 0;
	}
	return Math.floor(Math.random() * (max - min) ) + min;
}
// 生成轮循的服务器列表
Login.prototype.initServerList = function() {
	
	var server = this.getEnvServer();
	for(var sid in server) {
		this.server_list.push({
			sid: sid,
			count: 0
		});
	};
	g_logger.print.info(this.server_list);
}
// 逻辑服务器同步当前连接数
Login.prototype.updateConnection = function(sid, count) {

	if (!sid || typeof count != "number") {
		g_logger.print.error("参数错误" + sid + count);
		return;
	}
	for (var i = 0, len = this.server_list.length; i < len; i++) {
		if (this.server_list[i].sid == sid) {
			this.server_list[i].count = count;
			g_logger.print.info(this.server_list[i].count);
			return;
		}
	}
	g_logger.print.error("未同步成功" + sid);
}


// 返回逻辑服务器地址给客户端
Login.prototype.getLogicAddress = function() {

	// 获取服务器地址
	var server = this.getEnvServer();
	var sid = this.balanceLoad();// 做负载均衡
	g_logger.print.info("负载均衡后分配的服务器id：" + sid);
	var data = server[sid];
	if (!data) {
		g_logger.print.error("逻辑服地址获取失败");
		return null;
	}
	return {
		sid: data.sid,
		hostname: data.hostname,
		port: data.port
	};
}

// 创建玩家唯一id,8位整数
// 这里需要保证玩家id的唯一性
// 因为node.js单线程执行的原因，不可能会同时执行一条代码的可能性
// 因此rid生成后是唯一的
Login.prototype.getPlayerRid = function(sid) {

	if (sid && this.ridBool) {
		this.ridBool = false;

		this.ridSeed++;
		var rid = this.ridSeed;
		return sid + "" + rid;
	}
	return 0;
}
Login.prototype.loginLogic = function() {

	// 分配角色id
	var rid = this.getPlayerRid(serverId);
	if (!rid) {
		g_logger.print.error("rid分配失败" + rid);
		return 0;
	}

	// 重新置为true是否需要在入库成功后置为true????
	this.ridBool = true;

	// 更新rid
	this.setRidSeed();
	return rid;
}

//=======================
//=======================
//=======================
//======   更新数据
//=======================
//=======================
//=======================

// 保存生成角色id的种子
Login.prototype.setRidSeed = function() {

	if (!this.ridSeed) {
		// 防止this.ridSeed在自加时出NaN错误
		g_logger.print.error(this.ridSeed);
		return;
	}
	g_logger.print.info(this.ridSeed);
	g_db_api.upsert("login", {}, {"$set": {ridSeed: this.ridSeed} });
}
// 插入新建玩家数据
Login.prototype.setPlayerData = function(data, cb) {

	if (!data) {
		g_logger.print.error("参数错误" + token);
		return;
	}
	g_logger.print.info(data);
	g_db_api.insert("account", data, function(err, result) {

		if (err) {
			// 数据插入失败
			g_logger.print.error("账号注册失败");
		}
		g_logger.print.info("账号注册成功");
		cb && cb(err);
	});
}
// 更新玩家登录时间
Login.prototype.setLoginTime = function(rid) {

	if (!rid) {
		g_logger.print.error("参数错误" + rid);
		return;
	}

	var nowTime = Date.now();
	g_logger.print.info(nowTime);
	g_db_api.update("account", {rid: rid}, {"$set": {"loginTime": nowTime}});
}
// 记录玩家数据token
Login.prototype.setToken = function(token) {
	if (!token) {
		g_logger.print.error("参数错误" + token);
		return;
	}
    g_logger.print.info(token);
    db.upsert("user_token", {uid: token.uid}, { "$set": token }, function (err, result) {

    });
}


module.exports = Login;

