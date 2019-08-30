

// ==========================
// ==========================
// ==========================
// ====  腾讯sdk包
// ==========================
// ==========================
// ==========================

var URL = {

    // QQ登录
    url_login_qq_t: "http://ysdktest.qq.com/auth/qq_check_token",
    url_login_qq: "http://ysdk.qq.com/auth/qq_check_token",
    // 微信登录
    url_login_wx_t: "http://ysdktest.qq.com/auth/wx_check_token",
    url_login_wx: "http://ysdk.qq.com/auth/wx_check_token",
    // 查询余额接口
    url_get_balance_t: "https://ysdktest.qq.com/mpay/get_balance_m",
    url_get_balance: "https://ysdk.qq.com/mpay/get_balance_m",
    // 扣除游戏币接口
    url_pay_t: "https://ysdktest.qq.com/mpay/pay_m",
    url_pay: "https://ysdk.qq.com/mpay/pay_m",
    // 取消支付接口
    url_cancel_pay_t: "https://ysdktest.qq.com/mpay/cancel_pay_m",
    url_cancel_pay: "https://ysdk.qq.com/mpay/cancel_pay_m",
    // 直接赠送接口
    url_present_t: "https://ysdktest.qq.com/mpay/present_m",
    url_present: "https://ysdk.qq.com/mpay/present_m",
};
var KEY = {
    app_key: "",
    app_id: "",
    // 签名OpenAPI 3.0
    pay_app_key_t: "ixWAUhLAU7TnyGCNqKS8o3g0BMa9l0OD",
    pay_app_key  : "wDgbexlNG1hCn868U7fK2sayoaNhwJ5h",    
};

function isQQEnv(platform) {
    return platform == 1;
};
function isWxEnv(platform) {
    return platform == 2;
};
function getQQLoginUrl() {

    if (g_untis.isProduction() ) {
        return URL.url_login_qq;
    }
    return URL.url_login_qq_t;
};
function getWxLoginUrl() {

    if (g_untis.isProduction() ) {
        return URL.url_login_wx;
    }
    return URL.url_login_wx_t;
};
function getTimeStamp() {
    return Math.floor(Date.now() / 1000);
};

// 腾讯登录
exports.login = function(info, cb) {

    g_logger.print.info("腾讯登录");
    g_logger.print.info(info);
    try {
        // 接收的参数
        var token = info.accessToken;// token
        var openId = info.openId;// openId
        var platform = info.platform;
        var url = "";
        if (isQQEnv(platform) ) {
            url = getQQLoginUrl();
        } else if (isWxEnv(platform) ) {
            url = getWxLoginUrl();
        }
        if (!url) {
            g_logger.print.error("登录url获取失败" + url);
            cb && cb(0);
            return;
        }
        var appKey = KEY.app_key;// app_key
        var appId = KEY.app_id;// app_id

        g_logger.print.info("token: " + token);
        g_logger.print.info("openId: " + openId);
        g_logger.print.info("platform: " + platform);
        g_logger.print.info("url: " + url);
        g_logger.print.info("appKey: " + appKey);
        g_logger.print.info("appId: " + appId);

        // 用当前的时间戳与app_key一起取md5值
        var timestamp = getTimeStamp();
        var sign = g_untis.getMd5Str(appKey +  timestamp);
        g_logger.print.info(sign);

        // 拼接验证tx_url
        var tx_url = url + "?timestamp=" + timestamp + "&appid=" + appId + "&sig=" + sign + "&openid=" + openId + "&openkey=" + token;
        g_logger.print.info("tx_url: " + tx_url);

        // 发送验证请求
        g_http.get(tx_url, function(chunk, msg) {
            g_logger.print.info(msg);//{"status":0,"username":"ceshi1","userid":100001}
            if (!msg || g_untis.isError(msg) ) {
                g_logger.print.error(msg);
                cb && cb(0);
                return;
            }
            try {
                // 这个应该是tx返回的状态码
                if (!msg.ret) {
                    g_logger.print.error(msg.ret);
                    cb && cb(0);
                    return;
                }
                // 用户登录数据token需要保存到数据库中
                var data = {
                    uid: openId,
                    username: openId,
                    sdk_uid: openId,
                    info: info
                };
                cb && cb(data);
            } catch (err) {
                g_logger.print.error(err);
                cb && cb(err);
            }
        });
    } catch(err) {
        g_logger.print.error(err);
        cb && cb(err);
    };
};

// 腾讯支付





