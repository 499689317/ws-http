

// 和账号服务器对接的部分

var http = require('http');
var url=require('url');
var crypto = require("crypto");
var fs = require("fs");


function sha1 (str) {
    var buf = new Buffer(str);
    str = buf.toString("binary");

    var md5sum = crypto.createHash('sha1');
    md5sum.update(str);
    str = md5sum.digest('hex');
    
    return str;
}



