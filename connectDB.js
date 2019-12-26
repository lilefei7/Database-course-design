//这个文件里写了一些对数据库进行增删查改操作的函数和登录操作
//对数据库操作的函数：包括拼接数据库的sql语句，处理操作之后返回的结果
//操作数据库的函数都需要传递三个参数：在server.js与数据库建立的连接，与客户端简历的socket连接，客户端发来的data
function queryDB(connection, io, data) {
    // io.sockets.emit('test', "url123");
    var sql = "select * from " + data.table + ";";
    //拼接数据库的sql语句
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("查询数据失败。" + err.message);
            console.log("sql语句:----" + sql);
        } else {
            var index = 0;
            while (result[index] != undefined) {//如果查询不到结果，result[index]就是undefined
                // console.log(result[index++].studentID);
                //将查询到的结果发给前端，让前端去处理数据库返回每一列的数据
                io.sockets.emit('sendQueryResult', result[index++]);
                // var message = "查询成功。";
                // io.sockets.emit('sendMessage', message);
            }
        }
    });
    // 设置这个提示会阻止前端的页面渲染，所以查询操作没有提示，用户能直接看到查询结果
    // var message = "查询成功。";
    // io.sockets.emit('sendMessage', message);
}

function updateDB(connection, io, data) {
    var key;
    console.log(data.updateValues);
    // var b = (JSON.stringify(data.updateValues) == "{}");
    
    var sql = data.operation + " ";//创建sql语句
    //下面的循环生成sql语句
    var flag = true;//需要更改的数据是不是这条sql语句的第一个
    sql += data.table + " set ";
    for (key in data.updateValues) {
        if (!flag) {//如果不是这条语句第一个更改的数据，加上“，”。
            sql += ",";
        }
        flag = false;
        sql += key + "=" + '"' + data.updateValues[key] + '"';
    }
    flag = true;//限制条件的个数也不一定是一个，这个flag再给限制条件用
    sql += " where ";
    for (key in data.condition) {
        if (!flag) {//如果不是这条语句第一个限制条件的数据，加上“and”。
            sql += " and ";
        }
        flag = false;
        sql += key + "=" + '"' + data.condition[key] + '"';
    }
    sql += ";";

    connection.query(sql, function (err, result) {
        if (err) {
            console.log("修改数据失败。" + err.message);
            console.log("sql语句:----" + sql);
        }else{
            // io.sockets.emit('sendMessage', "修改了" + result.affectedRows+ "行。");
            io.sockets.emit('sendMessage', "修改成功。");
            // console.log(result);//返回值举例：Rows matched: 1  Changed: 0  Warnings: 0

        }
    });
}

function insertDB(connection, io, data) {
    var sql = data.operation + " into ";
    sql += data.table + "  (";
    var flag = true;//需要更改的数据是不是这条sql语句的第一个

    for (key in data.insertValues) {
        if (!flag) {//如果不是这条语句第一个更改的数据，加上“，”。
            sql += ",";
        }
        flag = false;
        sql += key;
    }
    sql += ") values ("
    flag = true;
    for (key in data.insertValues) {
        if (!flag) {//如果不是这条语句第一个更改的数据，加上“，”。
            sql += ",";
        }
        flag = false;
        sql += '"' + data.insertValues[key] + '"';
    }

    sql += ");";

    connection.query(sql, function (err, result) {
        if (err) {
            console.log("插入数据失败。" + err);
            io.sockets.emit('sendMessage', err.message);
            io.sockets.emit('execFunction', "query");
            //插入数据失败了，但是表头已经创建了，为了删除表头，让客户端执行一次query函数
            console.log("sql语句:----" + sql);  
        } else {
            io.sockets.emit('sendMessage', "插入成功。");
            console.log(result.message);//返回值举例：Rows matched: 1  Changed: 0  Warnings: 0
        }
    });
}

function deleteDB(connection, io, data) {
    var sql = data.operation + " from " + data.table + " where ";
    var flag = true;
    //只要table和主键这两个参数
    for (const key in data.deleteValues) {
        if (!flag) {//如果不是这条语句第一个限制条件的数据，加上“，”。
            sql += " and ";
        }
        flag = false;
        sql += key + "=" + '"' + data.deleteValues[key] + '"';
    }
    sql += ";";
    // console.log("函数里的sql语句：" + sql);
    connection.query(sql, function (err) {
        if (err) {
            console.log("删除数据失败。" + err.message);
            console.log("sql语句:----" + sql);
            io.sockets.emit('sendMessage', err.message);
        } else {
            io.sockets.emit('sendMessage', "删除成功。");
            io.sockets.emit('execFunction', "query");

        }
    });
}

function login(connection, io, data) {
    // console.log("调试：------" + data);
    // console.log(io);
    // io.sockets.emit('test', "url123");
    var flag = true;//拼接sql语句使用,来决定是否加and
    var sql = "select * from admin where ";
    for (const key in data.loginValues) {
        if (!flag) {//将用户名和密码有and拼接，对象的键只有两个，为了方便直接复制上面的
            sql += " and ";
        }
        flag = false;
        sql += key + "=" + '"' + data.loginValues[key] + '"';
    }
    // console.log("sql语句----"+sql);

    connection.query(sql, function (err, result) {
        if (err) {
            io.sockets.emit('sendMessage', "连接数据库失败，可能没有联网。");
            console.log("登录失败。" + err.message);
            console.log("sql语句:----" + sql);
        } else {

            if (result[0] == undefined) {
                var message = "账号或密码错误";
                io.sockets.emit('sendMessage', message);
                console.log("登录失败，sql------" + sql);
            } else {
                var url;
                //下面判断是一般用户还是管理员
                if (data.loginValues.isAdmin == 1) {
                    url = "./public/manager.html";
                } else {
                    url = "./public/managerOnlyQuery.html";
                }
                io.sockets.emit('redirect', url);
                console.log("登录成功。");
            }
        }
        // console.log(result[0]);
    });
}

module.exports = {
    queryDB,
    insertDB,
    updateDB,
    deleteDB,
    login
};