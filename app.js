

class A {
    constructor() {
        this.firstName = "Rock";
        this.lastName = "White";
    }
}

class B {
    constructor() {
        this.fullName = "";
    }
}
var a_var = new A();
var b_var = new B();

const mapper = require("./mapper")

var factory = new mapper.MapperFactory()
// factory.registMapper("a-b-mapper",
//     new mapper.Mapper()
//         .setIgnore("b")
//         .setIgnore("c")
//         .setIgnore("d")) // 注册a-b-mapper, 使用链式编程写法配置忽略b c d字段映射

factory.registMapper("a-b-mapper", new mapper.Mapper()
    .setIgnore("fullName")
    .setMapping("fullName", ["firstName", "lastName"], (firstName, lastName) => { return firstName + " " + lastName }));
console.log("value, key")


factory.getMapper("a-b-mapper").map(a_var, b_var);
console.log(b_var)
