var sendData;//登录按钮对象
var data;//登录所需数据
data = {
    operation: "login",
    loginValues: {
        isAdmin: "",//用户选择的身份
        name: "",//用户名
        password: ""//密码
    }
};

var socket = io.connect();//与服务器建立连接
//与服务器的连接最好设置成全局的，不然执行一次函数建立一个连接，会产生不必要问题
// console.log("socket---------"+ socket);

socket.on('redirect',function (url) {
    console.log(url);
    window.location = url;
});//后台确认完身份类型之后，会把管理页面的url发给登录页面，这里负责跳转

socket.on('sendMessage',function (message) {
    // console.log(message);
    alert(message);
});//接收服务器发来的小提示，如密码错误

socket.on('connect', function () {
    // socket.emit('sendDataToServer', data);
    console.log("socket连接成功。");
    
});//提示连接成功

function sendData_onclick() {
    // 获取三个参数
    // console.log("开始获取isadmin");
    //获取单选框里的值
    var item = null;
    var obj = document.getElementsByName("isAdmin")
    for (var i = 0; i < obj.length; i++) { //遍历Radio 
        if (obj[i].checked) {
            item = obj[i].value;                   
        }
    }//通过遍历获取身份
    data.loginValues.isAdmin = item;//将身份并将其传入data
    //下面获取用户名和密码
    objName = document.getElementById("name");
    objPassword = document.getElementById("password");
    //用户名和密码传入data
    data.loginValues.name = objName.value;
    data.loginValues.password = objPassword.value;
    // console.log(data);
    //下面把data发送到服务器
    socket.emit('sendDataToServer', data);
}//绑定登录按钮

document.onkeydown = function (event) {
    let e = event || window.event || arguments.callee.caller.arguments[0];
    if (e && e.keyCode == 13) { // 按Enter 
        sendData_onclick();
    }
};//如果用户按Enter键，也能登陆

function window_onload() {
    sendData = document.getElementById('sendData');
}//获取到发送按钮