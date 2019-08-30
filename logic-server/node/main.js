

var mod = {};

mod.start = function(cb) {

    // 连接数据库
    connectDbStatus(function() {

        // 启动网络服务
        startNetStatus();
        startWorkerStatus();
        cb && cb();
    });
};

// 连接数据库
function connectDbStatus(cb) {

    require("./lib/db.js").init(function() {
        g_logger.print.info("数据库初始化完成");
        cb && cb();
    });
};

// 启动网络服务
function startNetStatus() {
    require("./lib/proto.js").start();
};
function startWorkerStatus() {
    require("./worker.js").start();
}

module.exports = mod;




