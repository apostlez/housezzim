var strResponse = undefined;
var searchResult = [];

var search_addr = "";
var search_detail_addr = "";
var search_type = "";

var numbers_of_result = {};
var searchAroundResult = [];
var chart = null;
var average = {};


/*
item scheme of numbers_of_result
{
	<year> : {
		<month>: <number>,
		...
	},
	...
}
*/
var summary_of_result = {};

function getData(trade_type, lawd_cd, addr, detail_addr) {
	search_type = trade_type;
	search_addr = addr;
	search_detail_addr = detail_addr;
	var yearStart = 2006;
	var ymEnd = "201706";
	var month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
	
	var dataHandler = require("./dataHandler.js");
	for(var i=yearStart;i<2018;i++) {
		for(var j=0;j<12;j++) {
			if(ymEnd == (i + month[j])) break; 
			strResponse = dataHandler.readCachedData(trade_type, lawd_cd, i + month[j]);
			if(!strResponse) {
				dataHandler.getDataOfYear(trade_type, lawd_cd, i + month[j], parseResponse);
			} else {
				parseResponse();
			}
		}
	}
	createChart();
	updateChart();
}

/*
 * <items>
<item>
<거래금액>32,000</거래금액>
<년>2017</년>
<대지권면적>33</대지권면적>
<법정동>방배동</법정동>
<연립다세대>(987-13)</연립다세대>
<월>5</월>
<일>1~10</일>
<전용면적>74.55</전용면적>
<지번>987-13</지번>
<지역코드>11650</지역코드>
<층>2</층>
</item>
</items> 테스트
 */
var xml;

function parseResponse() {
	var addr = search_detail_addr;
	var dong = search_addr;
	//var addr = "387-2";
	//var addr = "1170-3";
	var sum_price = 0;
	var sum_size = 0;
	
	var parser = new DOMParser();
	// hot spot
	var xmlDoc = parser.parseFromString(strResponse,"text/xml");
	xml = xmlDoc;
	//console.log(xmlDoc.getElementsByTagName("items"));
	var itemArray = null;
	if(xmlDoc.getElementsByTagName("items")[0] != undefined ) {
		itemArray = xmlDoc.getElementsByTagName("items")[0].childNodes;
		
		var year = itemArray[0].getElementsByTagName("년")[0].innerHTML.trim();
		var month = itemArray[0].getElementsByTagName("월")[0].innerHTML.trim();
		if(numbers_of_result[year] == undefined) numbers_of_result[year] = {};
		if(numbers_of_result[year][month] == undefined) numbers_of_result[year][month] = 0;

		
		for(var i = 0; i < itemArray.length; i++) {
			if( itemArray[i].getElementsByTagName("법정동")[0].innerHTML.trim() == dong) {
				// count volume of dong
				numbers_of_result[year][month]++;
				// save record of full addr
				if( itemArray[i].getElementsByTagName("지번")[0].innerHTML == addr) {
					//printItem(itemArray[i].childNodes);
					itemToJson(itemArray[i].childNodes);
				}
				// save record of same block
				else if( itemArray[i].getElementsByTagName("지번")[0].innerHTML.split('-')[0] == addr.split('-')[0]) {
					var obj = {};
					var item = itemArray[i].childNodes;
					for(var j = 0; j < item.length; j++) {
						obj[item[j].tagName] = item[j].innerHTML.trim();
					}
					searchAroundResult.push(obj);
				}
				// data collect to calc average
				sum_price += itemArray[i].getElementsByTagName("거래금액")[0].innerHTML.replace(",", "") *1;
				sum_size += itemArray[i].getElementsByTagName("전용면적")[0].innerHTML *1;


			}
		}
		// calc average
		if(sum_price > 0) {
			if(average[year] == undefined) average[year] = {};
			//average[year][month] = parseFloat(((sum_price / sum_size) * 50).toFixed(2)); // / itemArray.length 
			average[year][month] = ((sum_price / sum_size) * 50).toFixed(2) *1; // / itemArray.length
			//console.log(average);
		}
	}
	makeTable();
	makeSummary();
	makeTableAround();
}

function itemToJson(item) {
	var obj = {};
	for(var j = 0; j < item.length; j++) {
		obj[item[j].tagName] = item[j].innerHTML.trim();
	}
	searchResult.push(obj);
}

function printItem(item) {
	var demo = document.getElementById("output");
	for(var j = 0; j < item.length; j++) {
		//demo.innerHTML += item[j].tagName + " : " + item[j].innerHTML.trim() + "<br>";
		console.log(item[j].tagName + " : " + item[j].innerHTML.trim());
	}
}

var trade_keys = ["년", "월", "거래금액", "층", "전용면적", "대지권면적", "법정동", "지번"];
var rent_keys = ["년", "월", "보증금액", "월세금액", "층", "전용면적", "법정동", "지번"];
var trade_keys_apart = ["년", "월", "거래금액", "아파트", "층", "전용면적", "법정동", "지번"];

function makeTable() {
	if(searchResult.length == 0) return;

	//var strOutput = document.getElementById("demo").innerHTML + "<p>";
	document.getElementById("table").innerHTML = "";
	var strHeader = "";
	var strOutput = "";
	var keys;
	if(search_type == "house_trade") keys = trade_keys;
	else if(search_type == "house_rent") keys = rent_keys;
	else if(search_type == "apart_trade") keys = trade_keys_apart;
	else {
		console.log("not implemented:" + search_type);
		return; 
	}
	//alert(keys.toString());
	strOutput += "<table>";
	for(var j = 0; j < keys.length; j++) {
		strOutput += "<tr>";
		strOutput += "<td>" + keys[j] + "</td>";
		for(var i = 0; i < searchResult.length; i++) {
			strOutput += "<td>" + searchResult[i][keys[j]] + "</td>";
		}
		strOutput += "</tr>";
	}
	strOutput += "</table>";
	document.getElementById("table").innerHTML = strOutput;
};

function makeSummary() {
	var strOutput = "";
	strOutput += "<table>";
	
	if(Object.keys(numbers_of_result).length == 0) return;
	var yearList = Object.keys(numbers_of_result);
	
	strOutput += "<tr><td></td>";
	for(var j=0;j < Object.keys(numbers_of_result).length; j++) {
		strOutput += "<td>" + Object.keys(numbers_of_result)[j] + "</td>";
	}
	strOutput += "</tr>";

	for(var i=0; i<12; i++) {
		strOutput += "<tr>";
		strOutput += "<td>" + (i+1) + "</td>";
		for(var j=0;j < Object.keys(numbers_of_result).length; j++) {
			var value = numbers_of_result[yearList[j]][i+1];
			if(value)
				strOutput += "<td>" + value + "</td>";
			else
				strOutput += "<td>" + 0 + "</td>";
		}
		strOutput += "</tr>";
	}
	strOutput += "</table>";
	document.getElementById("volume_table").innerHTML = strOutput;
};

function makeTableAround() {
	if(searchAroundResult.length == 0) return;

	//var strOutput = document.getElementById("demo").innerHTML + "<p>";
	document.getElementById("table_around").innerHTML = "";
	var strHeader = "";
	var strOutput = "";
	var keys;
	if(search_type == "house_trade") keys = trade_keys;
	else if(search_type == "house_rent") keys = rent_keys;
	else if(search_type == "apart_trade") keys = trade_keys_apart;
	else {
		console.log("not implemented:" + search_type);
		return; 
	}
	//alert(keys.toString());
	strOutput += "<table>";
	for(var j = 0; j < keys.length; j++) {
		strOutput += "<tr>";
		strOutput += "<td>" + keys[j] + "</td>";
		for(var i = 0; i < searchAroundResult.length; i++) {
			strOutput += "<td>" + searchAroundResult[i][keys[j]] + "</td>";
		}
		strOutput += "</tr>";
	}
	strOutput += "</table>";
	document.getElementById("table_around").innerHTML = strOutput;
};


function clear() {
	delete searchResult;
	delete numbers_of_result;
	delete summary_of_result;
	searchResult = [];
	numbers_of_result = {};
	summary_of_result = {};
	searchAroundResult = [];
	average = [];
};

function createChart() {
	chart = Highcharts.chart('chart_container', {
    title: {
        text: 'Record of Trade'
    },

    yAxis: {
        title: {
            text: 'Number'
        }
    },
	xAxis: {
		type: 'datetime',
		labels: {
			format: '{value:%Y-%m}',
		}
	},
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },
    series: []
});
};

function updateChart() {
	var series_list = {};

	if(searchResult.length == 0) return;
	var keys;
	var type;
	if(search_type == "house_trade") {
		keys = trade_keys;
		type = "매매";
	}
	else if(search_type == "house_rent") {
		keys = rent_keys;
		type = "전월세";
	}
	else if(search_type == "apart_trade") {
		keys = trade_keys_apart;
		type = "아파트 매매";
	}
	else {
		console.log("not implemented:" + search_type);
		return; 
	}
	// trade recode
	for(var i = 0; i < searchResult.length; i++) {
		var size = type + " " + searchResult[i]["법정동"] + " " + searchResult[i]["전용면적"];
		if(!series_list[size]) {
			series_list[size] = chart.addSeries({
				name:size,
				data:[]
			});
		}
		var d = Date.UTC(parseInt(searchResult[i]["년"]), parseInt(searchResult[i]["월"])-1);
		series_list[size].addPoint([d, parseInt(searchResult[i]["거래금액"].replace(",", ""))]);
	}
	// trade around
	for(var i = 0; i < searchAroundResult.length; i++) {
		//console.log(searchAroundResult[i]);
		var size = type + " " + searchAroundResult[i]["법정동"] + " " + searchAroundResult[i]["전용면적"];
		if(!series_list[size]) {
			series_list[size] = chart.addSeries({
				name:size,
				data:[]
			});
		}
		var d = Date.UTC(parseInt(searchAroundResult[i]["년"]), parseInt(searchAroundResult[i]["월"])-1);
		series_list[size].addPoint([d, parseInt(searchAroundResult[i]["거래금액"].replace(",", ""))]);
		//console.log([d, parseInt(searchAroundResult[i]["거래금액"].replace(",", ""))]);
	}
	// trade average of dong
	var avg_series_name = "50기준 평균";
	if(!series_list[avg_series_name]) {
		series_list[avg_series_name] = chart.addSeries({
			name:avg_series_name,
			data:[]
		});
	}
	var avg_year_array = Object.keys(average);
	for(var i = 0; i < avg_year_array.length; i++) {
		var avg_month_array = Object.keys(average[avg_year_array[i]]);
		for(var j = 0; j < avg_month_array.length; j++) {
			var avg = average[avg_year_array[i]][avg_month_array[j]];
			var d = Date.UTC(parseInt(avg_year_array[i]), parseInt(avg_month_array[j])-1);
			var p = [d, avg];
			//console.log(p);
			series_list[avg_series_name].addPoint([d, avg]);
		}
	}
}

function makeCache2Json(trade_type, lawd_cd, year_month) {
	var dataHandler = require("./dataHandler.js");
	dataHandler.cacheXml2json(trade_type, lawd_cd, year_month, function(err, data) {
		console.log(data);
	});
};
