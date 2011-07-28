
/*
Service: 适用于管理所有服务器端的Rest接口的静态对象
serviceList: 包含了Rest接口的地址，方法，名称
InitService: 该方法会为每一个serviceItem生成4个方法
example:
Item: { name: "GetCurrentUser", url: "/core/GetCurrentUser", method: "get" },
Method: 
异步调用
GetCurrentUser
同步调用
GetCurrentUser_Sync
异步调用，使用缓存
GetCurrentUser_Cache
同步调用，使用缓存
GetCurrentUser_CacheSync

memo: 带缓存的方法只有当Rest的Method是Get的时候才能发生
*/


$.AsyncMethod = function (url,methodType) {
    return function returnMethod(callback,args, beforeCallback, afterCallback) {
        if (beforeCallback) beforeCallback();
		
		if (methodType && methodType.toLowerCase() == 'post') {
           		methodType = 'post';
        } 
		else methodType = 'get';
		
		$.ajax({
                url: url,   
                type: methodType,
                async: true,
                data: args,
                dataType: 'json',
                success: function (e) {
                        callback(e);
                        if (afterCallback) afterCallback();
                },
				error:function(e)
				{
					console.log('error---:'+e.responseText);
				}		
		});
    };
};

$.SyncMethod = function (url, methodType) {
    return function returnMethod(callback,args, beforeCallback, afterCallback) {
        if (beforeCallback) beforeCallback();
		
		if (methodType && methodType.toLowerCase() == 'post') {
           		methodType = 'post';
        } 
		else methodType = 'get';

		$.ajax({
                url: url,   
                type: methodType,
                async: false,
                data: args,
                dataType: 'json',
                success: function (e) {
                        callback(e);
                        if (afterCallback) afterCallback();
                },
				error:function(e)
				{
					alert('error---:'+e.responseText);
				}		
		});
    };
};

$.buildReference = (function GetBuildReferenceMethod() {
    var dictionary = {};
    var buildReference = function () { };
    buildReference = function (obj) {
        if (typeof (obj) != 'object') return;

        if (obj['$id']) {
            dictionary[obj['$id']] = obj;
        }
        for (var p in obj) {
            if (typeof (obj[p]) == 'object' && obj[p] != null) {
                if (obj[p]['$ref']) {
                    var refId = obj[p]['$ref'];
                    obj[p] = dictionary[refId];
                }
                else
                    buildReference(obj[p]);
            }
        }
        return obj;
    }
    return buildReference;
})();


function getService() {
    var Service = {};
	var baseUrl = "";
    Service.Cache = {};
    Service.serviceList = [
        { name: "login", url: "/login", method: "post" },
        { name: "location", url: "/location", method: "post" },
        { name: "vaio", url: "/vaio", method: "post" },
        { name: "get", url: "/get", method: "post" },
		{ name: "enemies", url: "/enemies", method: "get" },
		{ name: "resetrobots", url: "/resetrobots", method: "post" },
    ];

	 function GenerateSyncMethod(serviceItem) {
	    return function(callback, args, message, beforeCallBack, afterCallBack) {
	        var returnResult;
	        var cacheKey = GetCacheKey(serviceItem, args);
	        $.SyncMethod(serviceItem.url, serviceItem.method)(function(result) {
	            $.buildReference(result);
	            Service.Cache[cacheKey] = result;
	            returnResult = result;
	        },
	        args, beforeCallBack, afterCallBack);


	        if (callback && callback != null)
	        callback(returnResult);
	        return returnResult;
	    }
	}
	function GenerateAsyncMethod(serviceItem) {
	    return function(callback, args, beforeCallBack, afterCallBack) {
	        var cacheKey = GetCacheKey(serviceItem, args);
	        $.AsyncMethod(serviceItem.url, serviceItem.method)(function(result) {
	            $.buildReference(result);
	            Service.Cache[cacheKey] = result;
	            callback(result);
	        },
	        args, beforeCallBack, afterCallBack);
	    }
	}
	function GenerateCacheSyncMethod(serviceItem) {
	    return function(callback, args, message, beforeCallBack, afterCallBack) {
	        var cacheKey = GetCacheKey(serviceItem, args);
	        if (!Service.Cache[cacheKey] || Service.Cache[cacheKey] == null) {
	            Service[serviceItem.name + "_Sync"](function(result) {},
	            args, message, beforeCallBack, afterCallBack);
	        }
	        if (callback && callback != null) callback(Service.Cache[cacheKey]);
	        return Service.Cache[cacheKey];
	    }
	}
	function GenerateCacheMethod(serviceItem) {
	    return function(callback, args, beforeCallBack, afterCallBack) {
	        var cacheKey = GetCacheKey(serviceItem, args);
	        if (!Service.Cache[cacheKey] || Service.Cache[cacheKey] == null) {
	            Service[serviceItem.name](function(result) {
	                callback(result);
	            },
	            args, beforeCallBack, afterCallBack);
	        }
	        else
	        callback(Service.Cache[cacheKey]);
	    }
	}

	function GetCacheKey(serviceItem, args) {
	    var argStr = args ? JSON.stringify(args) : "";
	    return serviceItem.name + argStr;
	}
    Service.InitService = function () {
		
		serviceList  = Service.serviceList; 
        for (var q in serviceList) {
            var item = serviceList[q];
			item.url = baseUrl + item.url;
            Service[item.name + "_Sync"] = GenerateSyncMethod(item);
            Service[item.name] = GenerateAsyncMethod(item);
            if (item.method == "get") {
                Service[item.name + "_CacheSync"] = GenerateCacheSyncMethod(item);
                Service[item.name + "_Cache"] = GenerateCacheMethod(item);

            }
        }
    };

    Service.InitService();
    return Service;
};


