

var CONST = {};
module.exports = CONST;

//=====================
//=====================
//=====================
//= 定义项目中部份常量
//=====================
//=====================
//=====================

CONST.ERROR = {

	SUCCESS: 0,// 返回数据成功

	MODULE_ERROR: 1,// 模块数据错误
	PARAM_ERROR: 2,// 参数错误
	LOGIN_NO_PLAYER: 3, // 角色未创建
	LOGIN_HAD_LOGIN: 4,// 角色已登录
	LOGIN_HAD_PLAYER: 5,// 角色已创建

	LEVEL_NO_CHAPTER: 10,// 该难度类型下的章节未开启
	LEVEL_GET_FAILE: 11, // 获取该章节关卡数据失败
	LEVEL_NO_DENROS: 12, // 开启章节元素不足
	LEVEL_NO_ONPEN: 13, // 当前关卡未开启
	LEVEL_NO_PROGRESS: 14, // 关卡进度不足
	LEVEL_USEITEM_CHEAT: 15,// 玩家使用道具作弊
	LEVEL_CANNOT_OPEN: 16,// 解锁章节条件不满足

	GAME_BONUS_EMPTY: 20,// 关卡奖励获取失败
	GAME_NEXTLEVEL_EMPTY: 21,// 新关卡数据获取失败
	GAME_POWER_NO_ENOUGH: 22,// 玩家精力不足

	ITEM_DROP_NO_GET: 26,// 领取免费物品条件不满足
	SHOP_NO_GOODS: 30,// 商店没有该货架
	SHOP_NO_MONEY: 31,// 货币不足
	SHOP_HAD_POWER: 32,// 购买体力条件不足
	SIGN_NO_IN: 40,// 签到条件不满足
	SIGN_NO_LOSE: 41,// 补签条件不满足

	ADVERTIS_NO_SHOW: 45,// 非法领取广告奖励
};

CONST.PROCESS = {

	ONLINE: "online/count",
	REGIST: "game/regist",
    LOGIN: "game/login",
    PLAYER_LOGIN: "player/login",
    CHECK_TICK: "check/tick"
};

CONST.PROTO = {
	
	CONNECTE: 10000,// 建立心跳连接
	CLOSE: 2,// 关闭连接

	LOGIN_LOGIN: 10,// 登录
	LOGIN_CREATE_PLAYER: 11,// 创建新用户
	LOGIN_ENTERGAME: 12,// 进入游戏

	GAME_START: 20,// 开始游戏
	GAME_END: 21,// 结束游戏
	GAME_DAY_START: 22,// 开始每日挑战
	GAME_DAY_END: 23,// 结束每日挑战

	LEVEL_ALL_CHAPTER: 30,// 获取任一难度类型章节数
	LEVEL_LEVEL_LIST: 31,// 获取任一难度章节所有关卡
	LEVEL_OPEN_CHAPTER: 32,// 开启新章节

	GUIDE_END: 40,// 结束新手引导
	ITEM_DROP: 46,// 定时领取物品

	SHOP_BUY: 50,// 商城购买物品
	SHOP_BUY_POWER: 51,// 购买精力
	SHOP_BUY_TIME: 52,// 购买时间
	SIGN_BASE_INFO: 54,// 签到游戏数据
	SIGN_IN: 55,// 签到
	SIGN_LOSE: 56,// 补签
	
	ADVERTIS_REWARD: 60,// 领取广告奖励
};



