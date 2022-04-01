const mapper = require("./mapper")

class A {
    constructor() {
        this.data = 0
        this.b = 1
        this.c = 2
        this.d = 3
        this.e = 4
        this.f = 5
        this.str = "hello"
    }

}
class B {
    constructor() {
        this.data = 0
        this.b = 233
        this.c = 0
        this.d = 0
        this.g = 0
    }
}

var factory = new mapper.MapperFactory()
factory.registMapper("a-b-mapper", new mapper.Mapper()
    .setMapping("data", ["data"], (data) => { return data + 2 })
    .setIgnore("b"))

console.log("value, key")
var a = new A()
a.data = 233

var b = new B()

factory.getMapper("a-b-mapper").map(a, b)
console.log(b)
