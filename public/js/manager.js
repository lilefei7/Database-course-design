// 两种用户共同使用一个前端js文件，权限的区分仅仅通过HTML页面的不同
var socket = io.connect();//与服务器建立连接,当这个页面被加载的时候，会建立一个全局的socket，它会被四种操作共用
var flag = true; //在显示查询结果的时候，要不要创建表头
var insertFlag = false;// 是否进入了插入模式
var focuseNodeValue = null;//记录获取焦点的元素文本内容
var focusedElement = null;//记录获取焦点的元素
//插入操作使用的参数较少，不用专门建一个对象

//除了查询操作之外，其它的三种操作都需要记录全局的一些变化，所以用的data都是下面的全局对象
var queryData = {
    operation: "query",
    table: ""
}//查询操作使用的对象，未被使用。在query函数里还会创建这样的对象，将它写在这里是为了能够统一查看前后端的数据接口
var updateData = {
    operation: "update",
    table: "",
    condition: {},//sql语句的where部分，将信息的主键作为要改变的信息的限制条件
    updateValues: {}//sql语句的set后面的部分，数据库中要改变的信息

}//记录表格中数值变化的对象，暂且只记录一行数据的变化，修改操作使用的对象
var deleteData = {
    operation: "delete",
    table: "",
    deleteValues: {}

}//删除数据使用的对象
var insertData = {
    operation: "insert",
    table: "",
    insertValues: {}

}//插入操作使用的对象
var thead;//插入数据的时候列的个数
//打开管理页面的时候就与服务器建立连接
function query() {
    var data = {
        operation: "query",
        table: ""
    }//前后端传输的数据
    flag = true;//查询的表可能不同，要改变表头
    //获取单选框里的值,得到需要查询的表
    $("#resultTable").empty();//清空上一次查询的结果
    // console.log("开始获取tableName");
    var item = null;
    var obj = document.getElementsByName("selectDBTable")
    for (var i = 0; i < obj.length; i++) { //遍历Radio 
        if (obj[i].checked) {
            item = obj[i].value;
        }
    }//获取tableName
    // alert(item);
    data.table = item;
    socket.emit('sendDataToServer', data);//将数据发到服务器
}//查询按钮的单击响应函数

function update() {//获取修改的数据是通过单元格上绑定的函数，所以这个函数里的操作不多
    
    thead = document.getElementsByTagName("th").length;//获取表头的数量
    if (thead == 0) {//如果thead等于0，说明用户没有查询就进行了插入操作
        alert("请先查询。");
        return -1;
    }else{
        if (JSON.stringify(updateData.updateValues) == "{}") {//如果updateValues里面没键值对，说明用户没有修改数据
            alert("请先修改要修改的数据。");
        }
    }
    
    //获取单选框里的值,得到需要查询的表
    updateData.table = getTableName();//将表名信息存入即将发送的对象
    socket.emit('sendDataToServer', updateData);//向服务器发送数据
    updateData.condition = {};//把这个全局变量变成原来的样子
    updateData.updateValues = {};//把这个全局变量变成原来的样子
}//修改按钮的单击响应函数

function insert() {
    //获取单选框里的值,得到需要查询的表
    if (!insertFlag) {
        //插入模式：在表头下面生成一个空行
        thead = document.getElementsByTagName("th").length;//获取表头的数量
        if (thead == 0) {//如果thead等于0，说明用户没有查询就进行了插入操作
            alert("请先查询。");
            return -1;
        }
        var str = '<tr>';//创建待插入数据的空表格的html代码
        for (let index = 0; index < thead; index++) {
            str += " <td contentEditable='true'></td>";
        }//创建空的单元格，同时设置其可编辑
        str += '</tr>';
        $("#resultTable").prepend(str);//将空的单元格添加到表头的下面
        insertFlag = true;//再次点击按钮的时候不用创建表头了，该发送数据了
    } else {
        // console.log(thead);
        var index = 1;//列的序号，按照列的顺序获取表格中的元素
        //已经生成了空行，需要记录下空行里的值
        var td = $("#resultTable").find("tr:first");//找到第一行的第一个tr，里面包含着需要用的td
        var th = $("#resultTable");//为了后面获取插入数据对应的列名，这里得到表头的信息
        while (index <= thead) {
            queryStr1 = ":nth-child(" + index + ")";
            queryStr2 = "th:nth-child(" + index + ")";
            index++;
            // console.log("queryStr:" + queryStr1);
            var value = td.find(queryStr1).text();
            var key = th.find(queryStr2).text();
            // console.log(value);
            insertData.insertValues[key] = value;
            //将需要插入数据库的信息存入对象insertData中
        }
        //获取当前table的名字
        var item = null;
        var obj = document.getElementsByName("selectDBTable");
        for (var i = 0; i < obj.length; i++) { //遍历Radio 
            if (obj[i].checked) {
                item = obj[i].value;
            }
        }
        // alert(item);
        insertData.table = getTableName();//获取当前正在操作的表名，存入即将发送的对象
        // console.log(insertData);
        // console.log(JSON.stringify(insertData.insertValues) == "{}");
        var isEmptyStr = "";//判断用户是否输入了数据
        for (const key in insertData.insertValues) {
            isEmptyStr += insertData.insertValues[key];
        }
        if (isEmptyStr) {//如果insertValuess里面没键值对，说明用户没有输入数据
            socket.emit('sendDataToServer', insertData);
        }else{
            alert("请先输入数据。");
            query();//刷新页面
        }
        insertFlag = false;//再次点击插入还能插入数据
        // insertData.insertValues = {};//插入操作已经完成，清空以前记录的书籍
    }
}//修改按钮的单击响应函数


function deleteRow() {
    //获取单选框里的值,得到需要查询的表
    // console.log("开始获取tableName");
    deleteData.table = getTableName();//获取当前正在操作的表
    // alert(deleteData.table);
    var primakey;
    if (focusedElement != null) {//如果用户没有选定单元格，那么就不执行下面操作
        primakey = focusedElement.getAttribute("remarks");
        deleteData.deleteValues = JSON.parse(primakey);//将对象转换为字符串
    }  else{
        alert("请先选定数据。");
    }
    //焦点所在的字段的主键一直被存在primakey
    // console.log(deleteData);
    socket.emit('sendDataToServer', deleteData);
    deleteData.deleteValues = {};//把这个全局变量变成原来的样子

}//修改按钮的单击响应函数

function getFocus() {//元素得到了焦点
    focusedElement = document.activeElement;//获取焦点所在的对象
    focuseNodeValue = focusedElement.textContent;//获取现在焦点所在元素的值
}//当表格中的元素获取焦点时，修改和删除操作要用

function loseFocus() {//元素失去了焦点
    var newFocuseNodeValue = focusedElement.textContent;//获取以前的焦点所在的元素的值
    // console.log(newFocuseNodeValue);
    if (focuseNodeValue != newFocuseNodeValue) {//对比焦点改变前后，元素的值是否发生了变化
        //当元素失去焦点的时候，检查现在元素的值和之前是否相等
        //如果不相等
        // console.log(focuseNodeValue + "==" + newFocuseNodeValue);
        var key = focusedElement.getAttribute('thiskey');//获取元素所在列的列名
        // console.log(key);
        updateData.updateValues[key] = newFocuseNodeValue;
        //将列名和新变化的值都存入对象，因为key不存在，所以对象会自动创建key，并复制
        // console.log(focusedElement);
        var primakey = focusedElement.getAttribute("remarks");//获取数据变化的列的主键信息
        // console.log(primakey);
        var strToObj = JSON.parse(primakey);//将主键字符串解析成对象
        for (const key in strToObj) {
            updateData.condition[key] = strToObj[key];
            //将主键信息存入对象，因为主键的数量不确定，所以要遍历
        }
        // console.log(updateData);
    }
}//当表格中的一个数据失去焦点时，修改操作要用

function getPrimary(tableName) {//通过表名获取主键的函数
    var primakey;
    switch (tableName) {
        case "studentIformation":
            primakey = {
                studentID: ""
            }
            break;
        case "course":
            primakey = {
                courseNumber: "",
                courseName: ""
            }
            break;
        case "score":
            primakey = {
                studentID: "",
                courseName: ""
            }
            break;
        default:
            console.error("获取主键信息时发生意外。");
            break;
    }
    return primakey;// 单出口
}//通过表名得到表的主键，修改和删除操作要用

function getTableName(params) {
    var obj = document.getElementsByName("selectDBTable");
    var item = null;
    for (var i = 0; i < obj.length; i++) { //遍历Radio 
        if (obj[i].checked) {
            item = obj[i].value;
        }
    }
    //  alert(item);
    return item;
}//这个函数来获取当前正在操作的表

socket.on('sendMessage', function (message) {
    alert(message);
});// 接收后台发送的一些小提示(alert)，包括密码错误，插入成功等等

socket.on('sendQueryResult', function (queryResult) {
    var str;//表头的HTML代码

    if (flag) {//是否要创建表头
        str = " <thead><tr>";
        for (const key in queryResult) {
            str += " <th scope='col'>" + key + "</th>";
            // console.log("遍历中的key-----" + key);
        }//循环结束

        str += "</tr></thead>"
        flag = false;//表头已经被创建，查询结果的下一个字段返回的时候不用创建表头
        $("#resultTable").append(str);//把表头加入到table中
    }
    // console.log(queryResult);
    //收到查询结果后，将数据变成表格
    //获取这个字段的主键信息
    // primakey1;
    // var Remarks = ;
    var obj = document.getElementsByName("selectDBTable")
    for (var i = 0; i < obj.length; i++) { //遍历Radio 
        if (obj[i].checked) {
            item = obj[i].value;
        }
    }//用循环找到现在被选中的表名tableName
    // alert(item);
    var tableName = item;
    var primakey = getPrimary(tableName);//通过表名得到表的主键，将主键作为对象的键存入primakey
    for (const key1 in queryResult) {
        for (const key2 in primakey) {
            if (key1 == key2) {
                primakey[key2] = queryResult[key1];
            }
        }
    }// 循环查询结果的一个字段，得到当前字段的主键对应的值
    // console.log(primakey);
    //下面的str根据查询到的结果，创建表格
    str = "<tr>";//重置str的值，上面的str已经添加到界面了
    for (const key in queryResult) {
        // console.log("遍历中的key-----" + key);
        str += "<td ";
        //下面将主键信息加入每个表格元素
        str += "remarks = " + JSON.stringify(primakey);//将主键信息（remarks）以字符串的形式存入节点
        str += " " + "thisKey=" + key + " ";//thisKey表示这个单元格对应的列名
        str += "contentEditable='true' onfocus='getFocus()' onblur='loseFocus()' >" + queryResult[key] + "</td>";
    }//contentEditable设置表格可被编辑，用两个函数监测焦点的变化来随时记录表格中数据的变化
    str += "</tr>";
    // str += "</tbody>";//去掉tbody是应为这个标签不好处理，前端界面受的影响不大
    $("#resultTable").append(str);//将生成html代码插入表格
});//sendQueryResult事件会在前端发出查询（query）请求并且受到服务器返回来的数据之后，在前端创建html表格

socket.on('execFunction', function (functionName) {
    eval(functionName+'()');
});// 服务器控制前端执行一些函数