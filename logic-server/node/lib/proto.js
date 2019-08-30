
var url = require("url");
var http = require("http");// 创建一个http服务器
var ws = require("ws");// 引入ws模块
var route = require("./../../route.js");// 路由模块

var HEART_BEAT_TIME = g_untis.getHeartBeatTime();
// var OFF_LINE_TIME = 30 * 60 * 1000;
var MAX_PACKAGE = g_untis.getMaxLostPackage();

var mod = {};
var httpServer = null;
var webSocket = new ws.Server({port: getSocketPort() });

mod.initHttp = function() {

    httpServer = http.createServer(function(request, response) {

        var info = url.parse(request.url, true);
        var pathname = info.pathname.slice(1);
        
        var chunks = "";
        request.setEncoding("utf-8");
        request.on("data", function(chunk) {
            chunks += chunk;
        });
        request.on("end", function() {

            // 解决浏览器跨域
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Credentials", "true");
            var data = null;
            if (chunks) {
                try {
                    data = JSON.parse(chunks);
                } catch(err) {
                    g_logger.print.error(err.stack);
                    // try {
                    //   res.end(err.stack);
                    // } catch(err) {}
                }
            } else {
                // path?key=value兼容get请求
                data = info.query;
            }

            // g_logger.print.info(data);
            // 数据全部接收完成触发end事件
            if (route[pathname]) {
                try {
                    route[pathname](request, response, data);
                } catch(err) {
                    g_logger.print.error(err.stack);
                    // try {
                    //   res.end(err.stack);
                    // } catch(err) {}
                }
            } else {
                response.writeHead(404);
                response.end();
            }
        });
    });
}

mod.initWebSocket = function() {

    webSocket.on("connection", function(socket) {

        socket.pingcount = 0;
        // 接收客户端消息
        socket.on("message", function(msg) {
            
            var message = {};
            if (msg) {
                try {
                    message = JSON.parse(msg);
                } catch(err) {
                    g_logger.print.error(err.stack);
                }
            }
            // g_logger.print.info(message);
            // 将消息路由出去
            var id = message.id;
            var param = (typeof message.data === "string") ? JSON.parse(message.data) : message.data;

            /**
             * 路由
             * 根据玩家id找到玩家实例
             */
            if (route[id]) {
                try {
                    route[id](socket, param);
                } catch(err) {
                    g_logger.print.error(err.stack);
                }
            } else {
                // route[g_CONST.PROTO.CONNECTE](socket, param);
                // g_logger.print.error("路由未成功");
                socket.send(404);
            }
        });

        // 心跳包
        socket.on("pong", function(msg) {

            // 每次接收包后将pingcount置0
            // 方案1：依赖服务器检测掉线
            // 在这里处理玩家断线重连
            socket.pingcount = 0;
            // if (socket.player) {
            //     g_handle.player_mgr.offlineToOnLine(socket.player.rid);
            // }
        });

        // 断开连接
        socket.on('close', function(msg) {

            try {
                // 关闭连接
                // g_logger.print.debug("连接已断开" + msg);
                if (route[g_CONST.PROTO.CLOSE]) {
                    route[g_CONST.PROTO.CLOSE](socket, msg);
                }
                
                // 将玩家置为离线状态
                // 不断开socket连接
                // if (socket.player) {
                //     g_handle.player_mgr.destroy(socket.player.rid);
                // }
            } catch(err) {
                g_logger.print.error(err.stack);
            }
        });
    });
}

function getHttpOpt() {
    if (g_untis.isProduction() ) {// process.env.NODE_ENV == "production"
        return g_cfg.http;
    } else if (g_untis.isTest() ) {// process.env.NODE_ENV == "test"
        return g_cfg.test_http;
    } else {
        return g_cfg.dev_http;
    }
};
function getSocketOpt() {
    if (g_untis.isProduction() ) {// process.env.NODE_ENV == "production"
        return g_cfg.socket;
    } else if (g_untis.isTest() ) {// process.env.NODE_ENV == "test"
        return g_cfg.test_socket;
    } else {
        return g_cfg.dev_socket;
    }
};
// 获取分支监听的端口
function getHttpPort() {

    // . 拿取http配置文件
    var http = getHttpOpt();
    // 1. 获取当前分支号
    var num = g_untis.getBranchNum();
    // 2. 根据分支号取对应端口号
    if (num && http.branch) {
        return http.branch[num];
    }
    return http.port;
};
// 获取分支监听的端口
function getSocketPort() {

    // . 拿取socket配置文件
    var socket = getSocketOpt();
    // 1. 获取当前分支号
    var num = g_untis.getBranchNum();
    // 2. 根据分支号取对应端口号
    if (num && socket.branch) {
        g_logger.print.info("启动socket At:" + socket.branch[num]);
        return socket.branch[num];
    }
    g_logger.print.info("启动socket At:" + socket.port);
    return socket.port;
};

// 开启网络服务
mod.start = function(cb) {

    // var http = getHttpOpt();
    // 启动http服务
    this.initHttp();
    var port = getHttpPort();
    httpServer.listen(port, function(err, data) {
        g_logger.print.info('启动http At:' + port);
    });

    // 启动WebSocket服务
    this.initWebSocket();
    // 每x秒一次心跳
    // var nowTime = Date.now();
    setInterval(function() {
        // nowTime += HEART_BEAT_TIME;

        // g_logger.print.info(g_handle.player_mgr.online);
        // g_logger.print.info(g_handle.player_mgr.offline);
        g_logger.print.info(webSocket.clients.size);

        // 连续丢失x个包心跳主动断开连接
        webSocket.clients.forEach(function(socket) {
            
            if (socket.pingcount > MAX_PACKAGE) {
                
                socket.emit("close", "heartbeat");
                // if (route[g_CONST.PROTO.CLOSE]) {
                //     route[g_CONST.PROTO.CLOSE](socket);
                // }
                return;
            } else {
                socket.pingcount++;
                socket.ping("", false, true);
            }
        });
        // 将离线x时间段以上的玩家踢出游戏
        // for(var id in g_handle.player_mgr.offline) {

        //     var offTime = g_handle.player_mgr.offline[id].offTime;
        //     var waitTime = nowTime - offTime;
        //     if (waitTime >= OFF_LINE_TIME) {
        //         g_logger.print.info("将玩家踢下线" + id);
        //         g_handle.player_mgr.offline[id].destroy();
        //         delete g_handle.player_mgr.offline[id];
        //     }
        // }
    }, HEART_BEAT_TIME);
}

module.exports = mod;


