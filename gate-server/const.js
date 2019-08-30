




var CONST = {};
module.exports = CONST;

// 定义项目中部份常量

// error code
CONST.ERROR = {

	SUCCESS: 0,// 返回数据成功

	MODULE_ERROR: 1,// 模块数据错误
	PARAM_ERROR: 2,// 参数错误

	// 登录
	LOGIN_ACCOUNT_ERROR: 1001, // 账号错误
	LOGIN_RID_ERROR: 1002,// rid分配错误
	LOGIN_REGISTED_ERROR: 1003,// 账号已经注册
	LOGIN_NOREGIST_ERROR: 1004,// 账号未注册
	LOGIN_PASSWORD_ERROR: 1005,// 密码错误
	LOGIN_DATABASE_ERROR: 1006,// 数据入库失败
	LOGIN_ADDRESS_ERROR: 1007,// 逻辑服地址获取失败

	UPDATE_APK: 1010,// 不更新apk
	UPDATE_URL: 1011,// 渠道连接出错

};

CONST.PROTO = {
	
};

