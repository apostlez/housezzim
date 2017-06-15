var strResponse = undefined;
var searchResult = [];

var search_addr = "";
var search_detail_addr = "";
var search_type = "";

var numbers_of_result = {};
var searchAroundResult = [];
/*
item scheme of summary_of_result
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
	var ymEnd = "201705";
	var month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
	
	var dataHandler = require("./dataHandler.js");
	for(var i=yearStart;i<2017;i++) {
		for(var j=0;j<12;j++) {
			if(ymEnd == (i + month[j])) return; 
			strResponse = dataHandler.readCachedData(trade_type, lawd_cd, i + month[j]);
			if(!strResponse) {
				dataHandler.getDataOfYear(trade_type, lawd_cd, i + month[j], parseResponse);
			} else {
				parseResponse();
			}
		}
	}

//	strResponse = dataHandler.readCachedData("11680", "201604");
//	if(!strResponse) {
//		getDataOfYear( "201612", parseResponse);
//	}
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
	
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(strResponse,"text/xml");
	xml = xmlDoc;
	//console.log(xmlDoc.getElementsByTagName("items"));
	var itemArray = null;
	if(xmlDoc.getElementsByTagName("items")[0] != undefined ) {
		itemArray = xmlDoc.getElementsByTagName("items")[0].childNodes;
		for(var i = 0; i < itemArray.length; i++) {
			if( itemArray[i].getElementsByTagName("법정동")[0].innerHTML.trim() == dong) {
				// count volume of dong
				var year = itemArray[i].getElementsByTagName("년")[0].innerHTML.trim();
				var month = itemArray[i].getElementsByTagName("월")[0].innerHTML.trim();
				if(numbers_of_result[year] == undefined) numbers_of_result[year] = {};
				if(numbers_of_result[year][month] == undefined) numbers_of_result[year][month] = 0;
				numbers_of_result[year][month]++;
				// save record of full addr
				if( itemArray[i].getElementsByTagName("지번")[0].innerHTML == addr) {
					printItem(itemArray[i].childNodes);
					itemToJson(itemArray[i].childNodes);
				}
				// save record of same block
				if( itemArray[i].getElementsByTagName("지번")[0].innerHTML.split('-')[0] == addr.split('-')[0]) {
					var obj = {};
					var item = itemArray[i].childNodes;
					for(var j = 0; j < item.length; j++) {
						obj[item[j].tagName] = item[j].innerHTML.trim();
					}
					searchAroundResult.push(obj);
				}

			}
		}
	}
	makeTable();
	makeSummary();
	makeTableAround();
	//xml.getElementsByTagName("items")[0].childNodes[0].getElementsByTagName("지번")[0].innerHTML;
	//document.getElementById("demo").innerHTML = itemArray[0];
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

function makeTable() {
	if(searchResult.length == 0) return;

	//var strOutput = document.getElementById("demo").innerHTML + "<p>";
	document.getElementById("table").innerHTML = "";
	var strHeader = "";
	var strOutput = "";
	var keys;
	if(search_type == "house_trade") keys = trade_keys;
	else if(search_type == "house_rent") keys = rent_keys;
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
}