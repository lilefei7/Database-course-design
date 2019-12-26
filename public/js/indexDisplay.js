var sendData;
var count = 0;
var dataNumTemperature;
function window_onload() {
    sendData = document.getElementById('sendData');
}
socket = io.connect();//与服务器建立连接
socket.on('connect', function () {
    socket.on('sendQueryResult', function (data) {//接收服务器传来的数据，更新数据表
        console.log(data);

    });
});