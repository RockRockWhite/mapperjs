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

class Mapping {
    constructor() {
        this.src;
        this.opt;
    }
}

class Mapper {
    constructor() {
        this.mapping_table = new Map();
        this.ignore_table = new Array();
    }

    setMapping(dist, src, opt) {
        var mapping = new Mapping();
        mapping.src = src;
        mapping.opt = opt;

        this.mapping_table.set(dist, mapping);
    }

    getMapping(dist) {
        if (!myMap.has(key)) {
            throw new Error(`mapper has no mapping to ${dist}`)
        }
        return this.mapping_table.get(dist);
    }

    delMapping(dist) {
        if (!this.mapping_table.has(dist)) {
            throw new Error(`mapper has no mapping to ${dist}`)
        }
        this.mapping_table.delete(dist)
    }

    setIgnore(dist) {
        this.ignore_table.push(dist);
    }

    getIgnores() {
        return this.ignore_table;
    }

    delIgnore(dist) {
        var pos = this.ignore_table.indexOf(dist);
        if (pos == -1) {
            throw new Error(`mapper has no ignore to ${dist}`)
        }
        this.ignore_table.splice(this.ignore_table.indexOf(dist), 1);
    }

    map(src, dist) {

        // 获得dist所有的参数
        var dist_properties = Reflect.ownKeys(dist);

        // 映射配置过mapping的字段
        {
            this.mapping_table.forEach((mapping, dist_property) => {
                // 判断dist是否有对应字段
                if (!Reflect.has(dist, dist_property)) {
                    throw new Error(`dist class has no property ${dist_property}`)
                }

                // 获得参数
                var args = new Array();
                mapping.src.forEach(each => {
                    // 判断src是否有对应字段
                    if (!Reflect.has(src, each)) {
                        throw new Error(`src class has no property ${each}`)
                    }
                    args.push(Reflect.get(src, each))
                });

                // 调用opt设置值
                var dist_value = mapping.opt.apply(null, args);
                Reflect.set(dist, dist_property, dist_value)

                // 从待处理数组中移除
                dist_properties.splice(dist_properties.indexOf(dist_property), 1)
            })
        }

        // 移除标记为ignore的字段
        {
            this.ignore_table.forEach(each => {
                // 判断dist是否有对应字段
                if (!Reflect.has(dist, each)) {
                    throw new Error(`dist class has no property ${each}`)
                }
                dist_properties.splice(dist_properties.indexOf(each), 1)
            })
        }

        // 为未配置规则的字段执行默认映射
        {
            dist_properties.forEach(each => {
                // 判断src是否有对应字段,没有则跳过映射
                if (!Reflect.has(src, each)) {
                    return;
                }

                var dist_value = Reflect.get(src, each);
                Reflect.set(dist, each, dist_value);
            })

        }
    }
}

console.log("value, key")
var a = new A()
a.data = 233

var b = new B()
var mapper = new Mapper()
mapper.setMapping("data", ["data"], (data) => {
    return data + 1
})
mapper.setIgnore("b")

mapper.delIgnore("b")
mapper.map(a, b)
console.log(b)