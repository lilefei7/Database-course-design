//草稿纸

//这是在决定前后端传送数据用的接口的时候写的文件，这个系统先写的后端。
// 这里记录了前后端四种操作的接口，这个文件不会被界面使用
var data = {
    operation: "query insert delete update",//前端想要执行的操作，增删查改
    table: "studentIformation course score",//想要操作的表
    column: "各个表中的列名",
    //studentID gender dateOfBirth class major department等
    parameter: "参数信息"
    /*
        查询操作的参数：就是需要传进数据库查询的值。
    所以前端在传递查询操作的时候，只用传两个参数，服务器也只用处理两个参数
        插入操作的参数，一条数据中，当前表的各列所对应的值
    当执行的操作是插入的时候，parameter是一个对象，里面包含了许多列名和它们对应的值。
        删除操作的参数，当前列的主键对应的值。
        更改操作的参数，当前列的主键对应的值。
    用户一般会同时更改多个值，因为是在界面上修改，所以是一个表的内容，但是可能是多个列的
    传到服务器的数据要知道是哪一列，也就是要把修改列的主键传过来（一个字段主键可能有两个），
    因为data的操作只有四种，不同的操作处理的对象的属性也不一样，可以直接写死，不同的操作传递不同的对象，
    更改操作传递的对象应包括：1、需要更改的字段的主键（一到两个，主键数量在每一个表中是一定的），
    2、对应字段更改的内容，因为字段更改的列的个数不确定，应该以数组存储,如下：updateData对象。
    当前端提交多个字段时，每一个字段发一次请求，数据库的连接只建立一次，只不过查询的次数变多了
    */
}


updateData = {
    operation: "update",
    table: "studentIformation",
    condition: {
        studentID: "201720812",
        // null : "value2"
    },
    updateValues: {
        class: "2017207",
        gender: "女",
        // key5: "value5"
    }

}
insertData = {
    operation: "insert",
    table: "studentIformation",
    insertValues: {
        studentID: '201720814',
        gender: "女",
        dateOfBirth: '19990221',
        class: "2017208",
        major: "软件工程",
        department: "信息工程学院"
    }

}
deleteData = {
    operation: "delete",
    table: "studentIformation",
    deleteValues: {
        studentID: '201720814',
        gender: "女"
    }

}
var item, key;
var sql = insertData.operation + " into ";
sql += insertData.table + "  (";
var flag = true;//需要更改的数据是不是这条sql语句的第一个

for (key in insertData.insertValues) {
    if (!flag) {//如果不是这条语句第一个更改的数据，加上“，”。
        sql += ",";
    }
    flag = false;
    sql += key;
}
sql += ") values ("
flag = true;
for (key in insertData.insertValues) {
    if (!flag) {//如果不是这条语句第一个更改的数据，加上“，”。
        sql += ",";
    }
    flag = false;
    sql += '"' + insertData.insertValues[key] + '"';
}

sql += ");";
console.log(sql);
