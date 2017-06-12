var strResponse = undefined;
var searchResult = [];

function getData() {
	var yearStart = 2016;
	var month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
/*	
	for(var i=yearStart;i<2017;i++) {
		for(var j=0;j<12;j++) {
			getDataOfYear( i + month[j], parseResponse);
		}
	}
*/
	getDataOfYear( "201604", parseResponse);
	getDataOfYear( "201612", parseResponse);
	makeTable();
}

function getDataOfYear(deal_ymd, next) {
	var xhr = new XMLHttpRequest();
	var url = 'http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcRHTrade';
	var key = 'PPiKlLLG9jBJcNvGn1NH66usYobBBPGCSuAXht3gOJ5hCC1tKqlCwpSQDKqfIciXI9TYmqUcP3bRg7pw56Te8w%3D%3D';
	var queryParams = '?serviceKey=' + key; /*Service Key*/
	//queryParams += '&' + encodeURIComponent('LAWD_CD') + '=' + encodeURIComponent('11650'); /*���ʱ�*/
	queryParams += '&' + encodeURIComponent('LAWD_CD') + '=' + encodeURIComponent('11680'); /*������*/
	queryParams += '&' + encodeURIComponent('DEAL_YMD') + '=' + encodeURIComponent(deal_ymd); /*�Ķ���ͼ���*/
	xhr.open('GET', url + queryParams);
	xhr.onreadystatechange = function () {
	    if (this.readyState == 4) {
	    	strResponse = this.responseText;
			next();
	    }
	};
	xhr.send('');
}

/* 
<�ŷ��ݾ�>    32,000</�ŷ��ݾ�>
<��>2017</��>
<�����Ǹ���>33</�����Ǹ���>
<������>��赿</������>
<�����ټ���>(987-13)</�����ټ���>
<��>5</��>
<��>1~10</��>
<�������>74.55</�������>
<����>987-13</����>
<�����ڵ�>11650</�����ڵ�>
<��>2</��>
*/
var xml;

function parseResponse() {
	
	var addr = "1170-3";
	
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(strResponse,"text/xml");
	xml = xmlDoc;
	//console.log(xmlDoc.getElementsByTagName("items"));
	var itemArray = null;
	if(xmlDoc.getElementsByTagName("items")[0] != undefined ) {
		itemArray = xmlDoc.getElementsByTagName("items")[0].childNodes
	}
	xml.getElementsByTagName("items")[0].childNodes[0].getElementsByTagName("����")[0].innerHTML
	
	//document.getElementById("demo").innerHTML = itemArray[0];
	for(var i = 0; i < itemArray.length; i++) {
		if( itemArray[i].getElementsByTagName("����")[0].innerHTML == addr) {
			printItem(itemArray[i].childNodes);
			itemToJson(itemArray[i].childNodes);
		}
	}
}

function itemToJson(item) {
	var obj = {};
	for(var j = 0; j < item.length; j++) {
		obj[item[j].tagName] = item[j].innerHTML.trim();
	}
	searchResult.push(obj);
}

function printItem(item) {
	var demo = document.getElementById("demo");
	for(var j = 0; j < item.length; j++) {
		//demo.innerHTML += item[j].tagName + " : " + item[j].innerHTML.trim() + "<br>";
		console.log(item[j].tagName + " : " + item[j].innerHTML.trim());
	}
}

function makeTable() {
	var strOutput = "";
	var keys = ["��", "�ŷ��ݾ�", "�������", "��"];
	strOutput += "<table>";
	for(var j = 0; j < keys.length; j++) {
		strOutput += "<tr>";
		for(var i = 0; i < searchResult.length; i++) {
			strOutput += "<td>" + searchResult[i][keys[j]] + "</td>";
		}
		strOutput += "</tr>";
	}
	strOutput += "</table>";
	document.getElementById("demo").innerHTML = strOutput;
}