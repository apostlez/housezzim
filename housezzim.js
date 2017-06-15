var strResponse = undefined;
var searchResult = [];

var search_addr = "";
var search_detail_addr = "";

var numbers_of_result = {};
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

function getData(lawd_cd, addr, detail_addr) {
	search_addr = addr;
	search_detail_addr = detail_addr;
	var yearStart = 2006;
	var ymEnd = "201705";
	var month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
	var trade_type = "house_rent";
	
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
				var year = itemArray[i].getElementsByTagName("년")[0].innerHTML.trim();
				var month = itemArray[i].getElementsByTagName("월")[0].innerHTML.trim();
				if(numbers_of_result[year] == undefined) numbers_of_result[year] = {};
				if(numbers_of_result[year][month] == undefined) numbers_of_result[year][month] = 0;
				numbers_of_result[year][month]++;
				
				if( itemArray[i].getElementsByTagName("지번")[0].innerHTML == addr) {
					printItem(itemArray[i].childNodes);
					itemToJson(itemArray[i].childNodes);
				}
			}
		}
	}
	makeTable();
	makeSummary();
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

function makeTable() {
	if(searchResult.length == 0) return;

	//var strOutput = document.getElementById("demo").innerHTML + "<p>";
	document.getElementById("table").innerHTML = "";
	var strHeader = "";
	var strOutput = "";
	var keys = ["년", "월", "거래금액", "보증금액", "층", "전용면적", "대지권면적", "법정동"];
	// "월세금액"
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
	// numbers_of_result
	strOutput += "<table>";
	
	for(var j in Object.keys(numbers_of_result)) {
		strOutput += "<tr>";
		strOutput += "<td>" + j + "</td>";
		for(var i in Object.keys(numbers_of_result[j])) {
			strOutput += "<td>" + i + "</td>";
			strOutput += "<td>" + numbers_of_result[j][i] + "</td>";
		}
		strOutput += "</tr>";
	}
	strOutput += "</table>";
	document.getElementById("table").innerHTML = strOutput;
};