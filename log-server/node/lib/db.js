
var mongodb = require("mongodb");

var mod = {};
mod.init = function(cb) {

    if (!g_db) {

        // mongoClient
        var mongoClient = mongodb.MongoClient;
        mongoClient.connect(getDbUrl(), getDbOpt(), function(err, db) {

            if (err) {

                g_logger.print.error("数据库连接失败", err);
            } else {
                g_logger.print.info("数据库连接成功");
                // 初始化数据
                g_db = db;
                g_db.on('error', function(error) {
                    g_logger.print.error("数据库发送错误", error);
                });

                g_db.on('close', function() {
                    g_logger.print.error("数据库链接断开。");
                });

                g_db.on('reconnect', function() {
                    g_logger.print.debug("数据库重连成功。");
                });

                cb && cb();
            }
        });
    }
};

function getDbUrl() {
    var url = "mongodb://" +
            g_cfg.dev_db.rs.host + ":" + g_cfg.dev_db.rs.port + "/" +
            g_cfg.dev_db.name;
    if (g_untis.isProduction() ) {// process.env.NODE_ENV == "production"
        url = "mongodb://" +
            g_cfg.db.username + ":" + g_cfg.db.password + "@" +
            // g_cfg.db.rs0.host + ":" + g_cfg.db.rs0.port + "," +
            g_cfg.db.rs1.host + ":" + g_cfg.db.rs1.port + "," +
            g_cfg.db.rs2.host + ":" + g_cfg.db.rs2.port + "/" +
            g_cfg.db.name + "?replicaSet=" + g_cfg.db.setname;
    } else if (g_untis.isTest() ) {// process.env.NODE_ENV == "test"
        url = "mongodb://" +
            g_cfg.test_db.rs.host + ":" + g_cfg.test_db.rs.port + "/" +
            g_cfg.test_db.name;
    }
    g_logger.print.info(url);
    console.log(url);
    return url;
};
function getDbOpt() {
    if (g_untis.isProduction() ) {// process.env.NODE_ENV == "production"
        return g_cfg.db.opt;
    } else if (g_untis.isTest() ) {// process.env.NODE_ENV == "test"
        return g_cfg.test_db.opt;
    } else {
        return g_cfg.dev_db.opt;
    }
};

// 判断是否已经连接成功
mod.isConnected = function() {

    // 0 = disconnected
    // 1 = connected
    // 2 = connecting
    // 3 = disconnecting
    return g_db.readyState === 1;
}

// 其它初始化操作......

module.exports = mod;
