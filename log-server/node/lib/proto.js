
var url = require("url");
var http = require("http");// 创建一个http服务器
var route = require("./../../route.js");// 路由模块


var mod = {};
var httpServer = null;
mod.initHttp = function() {

    httpServer = http.createServer(function(request, response) {

        var info = url.parse(request.url, true);// URL对象
        var pathname = info.pathname.slice(1);
        var chunks = "";
        request.setEncoding("utf-8");// 重新编码(否则接收的chunk为buffer类型)
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

// 开启网络服务
mod.start = function(cb) {

    // var http = getHttpOpt();
    this.initHttp();
    var port = getHttpPort();
    httpServer.listen(port, function(err, data) {

        g_logger.print.info('启动http At:' + port);
        cb && cb(err, data);
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

module.exports = mod;




