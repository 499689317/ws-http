
// =====================
// =====================
// =====================
// =====    工具部件
// =====================
// =====================
// =====================

// 判断是否生产环境
exports.isProduction = function() {
	var env = process.env.NODE_ENV;
	var arr = [];
	if (env) {
		arr = env.split("-");
	}
	if (arr[0] == g_cfg.env[1]) {
		return 1;
	}
	return 0;
};
// 判断是否内测环境
exports.isTest = function() {
	var env = process.env.NODE_ENV;
	var arr = [];
	if (env) {
		arr = env.split("-");
	}
	if (arr[0] == g_cfg.env[2]) {
		return 1;
	}
	return 0;
};

// 获取分支号
exports.getBranchNum = function() {
	var env = process.env.NODE_ENV;
	var arr = [];
	if (env) {
		arr = env.split("-");
	}
	if (arr[1]) {
		return arr[1];
	}
	return 0;
};


