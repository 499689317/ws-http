
var child_process = require('child_process');

var mod = {};
mod.start = function(cb) {
    
    if (g_worker) {
        g_logger.print.debug("子进程已初始化");
        return;
    }
    g_worker = createWorker();
    // g_worker.on("message", function(msg) {
        
    //     if (msg.id == g_CONST.PROCESS.ONLINE) {
    //         if (g_worker) {
    //             var obj = {
    //                 id: g_CONST.PROCESS.ONLINE,
    //                 count: Object.keys(g_handle.player_mgr.online).length
    //             };
    //             g_worker.send(obj);
    //         }
    //     }
    // });
    // // 子进程挂了需要自动重起
    // g_worker.on("exit", function(msg) {
        
    //     // 重启子进程
    //     if (g_worker) {
    //         g_worker = null;
    //     }
    //     g_worker = createWorker();
    // });
    initWorker();
};

// 创建子进程
function createWorker() {
    return child_process.fork("./node/logs.js", [], "utf-8");
};
// 初始化事件
function initWorker() {
    if (!g_worker) {
        g_logger.print.error("子进程未初始化");
        return;
    }
    g_worker.on("message", function(msg) {
        
        if (msg.id == g_CONST.PROCESS.ONLINE) {

            if (g_worker) {
                g_worker.send({
                    id: g_CONST.PROCESS.ONLINE,
                    count: Object.keys(g_handle.player_mgr.online).length
                });
            }
        }
        if (msg.id == g_CONST.PROCESS.CHECK_TICK) {

            // 检测玩家离线队列
            // 此处利用子进程检测离线队列主要为了主进程性能考虑
            // 需要进一步压测子进程的稳定性
            // 如果子进程挂了（无法自动重起）此时将会严重影响主进程
            g_handle.player_mgr.kickOffTimePlayer();
        }
    });
    // 子进程挂了需要自动重起
    g_worker.on("exit", function(msg) {
        g_logger.print.error("子进程退出，看看原因是什么：" + msg);
        // 重启子进程
        if (g_worker) {
            g_worker.removeAllListeners();
            g_worker = null;
        }
        g_worker = createWorker();
        initWorker();
    });
};

module.exports = mod;




