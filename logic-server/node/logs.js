
var http_client = require("./lib/http_client.js");


var LOG_SERVER = "";
var PATH = {
    ONLINE: "online/count",
    REGIST: "game/regist",
    LOGIN: "game/login",
    PLAYER_LOGIN: "player/login",
    CHECK_TICK: "check/tick"
};
var TIME = {
    5: 300000
};
var LOG = {
    log: {
        hostname: "101.201.234.73",
        port: 7000
    },
    dev_log: {
        hostname: "192.168.1.114",
        port: 7000
    },
    test_log: {
        hostname: "39.106.101.80",
        port: 7000
    }
};
var ACC = {
    acc: {
        1: {
            hostname: "101.201.234.73",
            port: 3000
        },
        // 2: {
        //     hostname: "101.201.239.241",
        //     port: 3002
        // }
    },
    dev_acc: {// 根据账号服务器进程数配置
        1: {
            hostname: "192.168.1.114",
            port: 3000
        },
        // 2: {
        //     hostname: "192.168.1.114",
        //     port: 3002
        // }
    },
    test_acc: {
        1: {
            hostname: "39.106.101.80",
            port: 3000
        }
    }
};
var SID = {
    sid: 200,
    dev_sid: 100,
    test_sid: 101
};

; (function() {

    LOG_SERVER = getServerUrl("log");
    init();
    setInterval(function() {

        // 每隔5分钟同步一次在线人数
        sendMsg({id: PATH.ONLINE});
        
        // 每隔5分钟检测一次主进程tick
        sendMsg({id: PATH.CHECK_TICK});
    }, TIME[5]);
})();

function init() {

    process.on("message", function(msg) {
        // console.log(msg.id);
        if (msg.id == PATH.ONLINE) {
            // 将当前服务器在线人数同步到log服务器
            calcOnline(msg.count);

            // 将当前服务器在线人数同步到账号服务器
            updateConnect(msg.count);
        } else if (msg.id == PATH.REGIST) {
            calcRegist(msg.time);
        } else if (msg.id == PATH.LOGIN) {
            calcLogin(msg.createTime, 1);
            calcLogin(msg.loginTime, 2);
        } else if (msg.id == PATH.PLAYER_LOGIN) {
            calcPlayerLogin(msg);
        }
    });
};

function getLogCfg() {
    
    if (isProduction() ) {// process.env.NODE_ENV == "production"
        return LOG.log;
    } else if (isTest() ) {// process.env.NODE_ENV == "test"
        return LOG.test_log;
    }
    return LOG.dev_log;
};
function getAccCfg() {
    
    if (isProduction() ) {// process.env.NODE_ENV == "production"
        return ACC.acc;
    } else if (isTest() ) {// process.env.NODE_ENV == "test"
        return ACC.test_acc;
    }
    return ACC.dev_acc;
};
function getSid() {
    if (isProduction() ) {
        return SID.sid;
    } else if (isTest() ) {
        return SID.test_sid;
    }
    return SID.dev_sid;
};
function getServerUrl(server, sequence) {

    var cfg = null;
    var hostname = "";
    var port = "";
    if (server == "log") {
        cfg = getLogCfg();
        hostname = cfg.hostname;
        port = cfg.port;
    } else if (server == "acc") {
        cfg = getAccCfg()[sequence];
        hostname = cfg.hostname;
        port = cfg.port;
    }
    var url = "http://" + hostname + ":" + port + "/";
    console.log(url);
    return url;
};

function calcOnline(count) {

    var path = LOG_SERVER + PATH.ONLINE;
    var data = {
        time: Date.now(),
        count: count,
    };

    http_client.post(path, JSON.stringify(data), function(opt, msg) {
        if (msg.error == 0) {
        } else {
        }
    });
};
function updateConnect(count) {
    
    var data = {
        sid: getSid(),// 逻辑服务器id
        count: count,
    };
    var cfg = getAccCfg();
    for (var key in cfg) {
        
        var path = getServerUrl("acc", key) + "update/connect";
        http_client.post(path, JSON.stringify(data), function(opt, msg) {
            if (msg.error == 0) {
            } else {
            }
        });
    }
};

function calcRegist(time) {

    var data = {
        time: time
    };
    var path = LOG_SERVER + PATH.REGIST;
    http_client.post(path, JSON.stringify(data), function(opt, msg) {
        if (msg.error == 0) {
        } else {
        }
    });
};

function calcLogin(time, type) {

    var data = {
        time: time,
        type: type
    };
    var path = LOG_SERVER + PATH.LOGIN;
    http_client.post(path, JSON.stringify(data), function(opt, msg) {
        if (msg.error == 0) {
        } else {
        }
    });
};
function calcPlayerLogin(msg) {

    var data = {
        rid: msg.rid,
        time: msg.time,
        type: msg.type
    };
    var path = LOG_SERVER + PATH.PLAYER_LOGIN;
    http_client.post(path, JSON.stringify(data), function(opt, msg) {
        if (msg.error == 0) {
        } else {
        }
    });
};


//==========================
//==========================
//==========================
//==========   公用函数
//==========================
//==========================
//==========================

process.on('uncaughtException', function (err) {
  // 打印出错误的调用栈方便调试
  console.error(err.stack);
});

// 发送消息给父进程
function sendMsg(msg) {
    if (msg === undefined) {
        console.log("msg为空");
        return;
    }
    process.send(msg);
};
// 判断是否生产环境
function isProduction() {
    var env = process.env.NODE_ENV;
    var arr = [];
    if (env) {
        arr = env.split("-");
    }
    if (arr[0] == "production") {
        return 1;
    }
    return 0;
};
// 判断是否内测环境
function isTest() {
    var env = process.env.NODE_ENV;
    var arr = [];
    if (env) {
        arr = env.split("-");
    }
    if (arr[0] == "test") {
        return 1;
    }
    return 0;
};


