var cache_loc = 'cached_responses\\';
var extention = '.xml';

(function() {
	var instance = {};
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = instance;
	}

	instance.readCachedData = function(lawd_cd, year_month) {
		var fs = require('fs');
		var filename = cache_loc + lawd_cd + '_' + year_month + extention;
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

	instance.writeCache = function(lawd_cd, year_month, data) {
		var fs = require('fs');
		var filename = cache_loc + lawd_cd + '_' + year_month + extention;
		var contents = fs.writeFile(filename, data, 'utf8', function(err) {
			if(err) {
				console.log(err);
			}
		});
	};
	
	instance.getDataOfYear = function (lawd_cd, deal_ymd, next) {
		var xhr = new XMLHttpRequest();
		var url = 'http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcRHTrade';
		var key = 'PPiKlLLG9jBJcNvGn1NH66usYobBBPGCSuAXht3gOJ5hCC1tKqlCwpSQDKqfIciXI9TYmqUcP3bRg7pw56Te8w%3D%3D';
		var queryParams = '?serviceKey=' + key; /*Service Key*/
		queryParams += '&' + encodeURIComponent('LAWD_CD') + '=' + encodeURIComponent(lawd_cd);
		queryParams += '&' + encodeURIComponent('DEAL_YMD') + '=' + encodeURIComponent(deal_ymd);
		xhr.open('GET', url + queryParams);
		xhr.onreadystatechange = function () {
		    if (this.readyState == 4) {
		    	strResponse = this.responseText;
		    	instance.writeCache(lawd_cd, deal_ymd, strResponse);
				next();
		    }
		};
		xhr.send('');
	}


}());
