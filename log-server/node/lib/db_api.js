
//===================================
//===================================
//===================================
//===========        常用api
//===================================
//===================================
//===================================

var Route = {};

/**
 * [find 查询]
 * @param  {[string]}   coll  [表名]
 * @param  {[object]}   where [条件]
 * @param  {Function} cb    [完成回调]
 */
Route.find = function(coll, params, cb) {

    if (!coll || !params) {
        cb && cb(new Error() );
        return;
    }
    var where = params[0];
    var filter = params[1] || {};
    var collection = g_db.collection(coll);
    collection.find(where, filter).toArray(function(err, result) {

        if (err) {
            cb && cb(err);
            return;
        }
        cb && cb(err, result);
    });
};
Route.findSome = function (coll, params, cb) {

    if (!coll || !params) {
        cb && cb(new Error() );
        return;
    }
    var collection = g_db.collection(coll);
    var cursor = collection.find(params[0]);
        
    var options = params[1] || {};
    if (typeof options.skip === 'number') {
        cursor = cursor.skip(options.skip)
    };
    if (options.limit) {
        cursor = cursor.limit(options.limit)
    };
    if (options.sort) {
        cursor = cursor.sort(options.sort)
    };
    cursor.toArray(function (err, result) {
        cb && cb(err, result);
    });
};
Route.findOne = function(coll, params, cb) {

    if (!coll || !params) {
        cb && cb(new Error() );
        return;
    }
    
    var where = params[0];
    var filter = params[1] || {};
    var collection = g_db.collection(coll);
    collection.findOne(where, filter, function(err, result) {

        if (err) {
            cb && cb(err);
            return;
        }
        cb && cb(err, result);
    });
};
Route.findOneAndUpdate = function (coll, where, value) {

    if (!coll || !where) {
        cb && cb(new Error() );
        return;
    }
    
    var collection = g_db.collection(coll);
    collection.findOneAndUpdate(where, value, function(err, result) {

        if (err) {
            cb && cb(err);
            return;
        }
        cb && cb(err, result);
    });
}

/**
 * [update 更新]
 * @param  {[string]}   coll  [表名]
 * @param  {[object]}   where [条件]
 * @param  {[object]}   value [修改器]
 * @param  {Function} cb    [完成回调]
 */
Route.update = function(coll, where, value, cb) {

    if (!coll || !where) {
        cb && cb(new Error() );
        return;
    }

    var collection = g_db.collection(coll);
    collection.update(where, value, function(err, result) {

        if (err) {
            cb && cb(err);
            return;
        }
        cb && cb(err, result);
    });
};
Route.updateOne = function (coll, where, value, cb) {

    if (!coll || !where) {
        cb && cb(new Error() );
        return;
    }
    var collection = g_db.collection(coll);
    collection.updateOne(where, value, function(err, result) {

        if (err) {
            cb && cb(err);
            return;
        }
        cb && cb(err, result);
    });
};


/**
 * [insert 插入数据]
 * @param  {[string]} collection [表名]
 * @param  {[string]} filed      [字段名]
 * @param  {[object]} value      [值]
 */
Route.insert = function(coll, data, cb) {

    if (!coll || !data) {
        cb && cb(new Error() );
        return;
    }

    var collection = g_db.collection(coll);
    collection.insert(data, function(err, result) {
        if (err) {
            cb && cb(err);
            return;
        }
        cb && cb(err, result);
    });
};

Route.insertOne = function (coll, data, cb) {

    if (!coll || !data) {
        cb && cb(new Error() );
        return;
    }
    var collection = g_db.collection(coll);
    collection.insertOne(data, function(err, result) {
        if (err) {
            cb && cb(err);
            return;
        }
        cb && cb(err, result);
    });
};

/**
 * [upsert 更新插入]
 * coll  [string]
 * where [object]
 * value [object]
 * cb    [Function]
 */
Route.upsert = function(coll, where, value, cb) {

    if (!coll || !where) {
        cb && cb(new Error() );
        return;
    }

    var collection = g_db.collection(coll);
    collection.update(where, value, {upsert: true}, function(err, result) {

        if (err) {
            cb && cb(err);
            return;
        }
        cb && cb(err, result);
    });
};

/**
 * [remove 删除]
 * coll  [string]
 * where [object]
 * cb    [Function]
 */
Route.remove = function(coll, where, cb) {

    if (!coll || !where) {
        cb && cb(new Error() );
        return;
    }

    var collection = g_db.collection(coll);
    collection.remove(where, function(err, result) {

        if (err) {
            cb && cb(err);
            return;
        }
        cb && cb(err, result);
    });
};

// 创建索引
Route.createIndex = function (coll, params, cb) {

    if (!coll || !params) {
        cb && cb(new Error() );
        return;
    }
    g_db.createIndex.apply(g_db, [coll].concat(params).concat(function (err, result) {
        cb && cb(err, result);
    }));
}

module.exports = Route;


