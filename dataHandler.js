var cache_loc = 'cached_responses\\';
var extention = '.xml';

(function() {
	var instance = {};
	var key = 'PPiKlLLG9jBJcNvGn1NH66usYobBBPGCSuAXht3gOJ5hCC1tKqlCwpSQDKqfIciXI9TYmqUcP3bRg7pw56Te8w%3D%3D';
	var url_list = {
		house_trade : "http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcRHTrade",
		house_rent : "http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcRHRent",
		apart_trade : "http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTrade",
		apart_rent : ""
	};
	
	
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = instance;
	}

	instance.readCachedData = function(trade_type, lawd_cd, year_month) {
		var fs = require('fs');
		var filename = cache_loc + trade_type + "\\" + lawd_cd + '_' + year_month + extention;
		try {
			var contents = fs.readFileSync(filename, 'utf8');
			if (!contents) {
				console.log("error! empty data in " + filename);
			}
		} catch(e) {
			console.log("file not exist:" + filename);
			console.log(e);
		}
		return contents;
	};

	instance.writeCache = function(trade_type, lawd_cd, year_month, data) {
		var fs = require('fs');
		var path = cache_loc + trade_type;
		var filename = path + "\\" + lawd_cd + '_' + year_month + extention;
		
		var exception_func = function(err) {
					if(err) {
						console.log(err);
					}
				};
		if(fs.existsSync(path)) {
			fs.writeFile(filename, data, 'utf8', exception_func);
		} else {
		fs.mkdir(path, function(err) {
			if(err) {
				console.log(err);
			} else {
				fs.writeFile(filename, data, 'utf8', exception_func);
			}
		});
		}
		
	};
	
	instance.getDataOfYear = function (trade_type, lawd_cd, deal_ymd, next) {
		var xhr = new XMLHttpRequest();
		var url = url_list[trade_type];
		var queryParams = '?serviceKey=' + key; /*Service Key*/
		queryParams += '&' + encodeURIComponent('LAWD_CD') + '=' + encodeURIComponent(lawd_cd);
		queryParams += '&' + encodeURIComponent('DEAL_YMD') + '=' + encodeURIComponent(deal_ymd);
		xhr.open('GET', url + queryParams);
		xhr.onreadystatechange = function () {
		    if (this.readyState == 4) {
		    	strResponse = this.responseText;
		    	instance.writeCache(trade_type, lawd_cd, deal_ymd, strResponse);
				next();
		    }
		};
		xhr.send('');
	}
	



}());
