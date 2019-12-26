var sendData;
data = {
    operation: "login",
    loginValues: {
        name: "admin2",
        password: "12345"
    }
}
function window_onload() {
    sendData = document.getElementById('sendData');

}
function sendData_onclick() {
    // console.log("按钮被点击了");
    socket = io.connect();//与服务器建立连接
    socket.on('connect', function () {
        socket.emit('sendDataToServer', data);
    });
    // alert("发送数据");
}
// sendData_onclick();
document.onkeydown = function (event) {
    let e = event || window.event || arguments.callee.caller.arguments[0];
    if (e && e.keyCode == 13) { // 按Enter 
        sendData_onclick();
    }
};
//生成随机数据