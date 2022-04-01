# mapperjs

mapperjs是一个轻量化的对象映射util, 可以用与比如 Dto -> Entity 的转换

## Samples

### 默认映射配置

未特殊配置的情况下, mapperjs将执行默认映射, 即将 src类 与 dest类 具有相同名称的字段映射

如: 

```javascript
class A {
    constructor() {
        this.a = "B has no a";
        this.b = "b in A";
        this.c = "c in A";
        this.d = "d in A";
    }
}

class B {
    constructor() {
        this.b = "b in B";
        this.c = "c in B";
        this.d = "d in B";
        this.e = "A has no e";
    }
}

var a_var = new A();
var b_var = new B();
```

若将要执行从A -> B的映射:

- A B共有的b c d 字段将会实现映射即: `A.b -> B.b ` `A.c -> B.c ` `A.d -> B.d `

- A具有a字段, 而B不具有a字段, 则A.a字段不会执行映射
- B具有e字段, 而A不具有e字段, 则B.e仍保持其原有的值得, 不会执行映射

使用代码对A与B进行映射

配置部分代码 :

```javascript
const mapper = require("./mapper"); // 导入mapper

var factory = new mapper.MapperFactory(); // 推荐使用提供的MapperFactory来管理mapper类的生命周期
factory.registMapper("a-b-mapper", new mapper.Mapper());// 注册a-b-mapper, 使用默认配置
```

使用执行mapper部分代码 :

```javascript
factory.getMapper("a-b-mapper").map(a_var, b_var);
```

执行映射后b_var :

```bash
B {b: 'b in A', c: 'c in A', d: 'd in A', e: 'A has no e'}
```

可以看到, 执行了映射`A.b -> B.b ` `A.c -> B.c ` `A.d -> B.d `

>**!!!特别说明!!!**
>
>建议在程序初始化时就再工厂注册相应的mapper
>
>*在程序运行时边注册mapper边获得实例会产生并发冲突问题*

### 配置忽略字段

mapperjs允许配置忽略映射字段

如: 

```javascript
class A {
    constructor() {
        this.a = "B has no a";
        this.b = "b in A";
        this.c = "c in A";
        this.d = "d in A";
    }
}

class B {
    constructor() {

        this.b = "b in B";
        this.c = "c in B";
        this.d = "d in B";
        this.e = "A has no e";
    }
}

var a_var = new A();
var b_var = new B();
```

若使用默认映射配置, 则会执行`A.b -> B.b ` `A.c -> B.c ` `A.d -> B.d `的映射

但如果在业务中, A的b字段和B.b字段仅仅是同名, 但是并不存在映射关系, 就需要配置忽略B字段的映射

使用代码对A与B进行映射, 忽略共有b字段的映射: 

```javascript
const mapper = require("./mapper");

var factory = new mapper.MapperFactory();
factory.registMapper("a-b-mapper", new mapper.Mapper().setIgnore("b"));// 注册a-b-mapper, 配置忽略b字段映射
```

使用执行mapper部分代码 :

```javascript
factory.getMapper("a-b-mapper").map(a_var, b_var);
```

执行映射后b_var :

```javascript
B {b: 'b in B', c: 'c in A', d: 'd in A', e: 'A has no e'}
```

可以看到, b字段仍然保留原有的值

### 链式编程

mapperjs的Mapper类的`setMapping()` `delMapping() ``setIgnore() ` `delIgnore()`方法支持链式编程写法

例如, 可以使用链式编程配置多个Ignore:

```javascript
factory.registMapper("a-b-mapper",
    new mapper.Mapper()
        .setIgnore("b")
        .setIgnore("c")
        .setIgnore("d")); // 注册a-b-mapper, 使用链式编程写法配置忽略b c d字段映射
```

###  配置复杂字段映射规则

在实际业务场景中, 可能需要执行比较复杂的映射操作

如在业务场景中下列A类型的fullname需要映射到B类型的name:

```javascript
class A {
    constructor() {
        this.a = "B has no a";
        this.b = "b in A";
        this.c = "c in A";
        this.d = "d in A";
        this.fullname = "rock in a";
    }
}

class B {
    constructor() {
        this.b = "b in B";
        this.c = "c in B";
        this.d = "d in B";
        this.e = "A has no e";
        this.name = "rock in B";
    }
}
var a_var = new A();
var b_var = new B();
```

mapperjs的Mapper类的提供了setMapping()方法来解决这类问题

```javascript
setMapping(dist, src, opt)
```

- dist: 目标类型中的字段名
- src: 源类型相关字段**数组**
- opt: 需要执行的转换操作**函数**

在本例中, 目标类型字段名dist就是B的name字段, 而name字段相关的源类型字段只有fullname, 因此src就是["fullname"]

那么opt是什么?

在本例中opt为 :

```javascript
opt = (fullname) => {
    return fullname;
};
```

opt是执行字段转换的函数, mapper会按照src指明的顺序, 将源类型的相关字段依次传入该函数

这个例子中, src就是["fullname"], 那么这个函数只会接收一个参数, 即源类型的fullname字段值



而这个函数的返回值就是目标类型被映射字段的值

这个例子中, 返回了fullname, 那么目标类型的dist字段的值将会被映射为fullname



使用代码对A与B进行映射, 配置A.fullname -> B.name的复杂映射

配置部分代码 :

```javascript
var factory = new mapper.MapperFactory();

factory.registMapper("a-b-mapper", new mapper.Mapper()
    .setMapping("name", ["fullname"], (fullname) => { return fullname })); // 配置A.fullname -> B.name
```

执行mapper部分代码 :

```javascript
factory.getMapper("a-b-mapper").map(a_var, b_var);
```

执行映射后b_var :

```bash
B {b: 'b in A', c: 'c in A', d: 'd in A', e: 'A has no e', name: 'rock in a'}
```

#### More: 字段多对一的映射例子

这个例子中,  B的fullName是A的firstName和lastName字段的映射

```javascript
class A {
    constructor() {
        this.firstName = "rock";
        this.lastName = "white";
    }
}

class B {
    constructor() {
        this.fullName = "";
    }
}
```

配置部分代码 :

```javascript
var factory = new mapper.MapperFactory();

// 使dist的fullName字段为src的 firstName + " " + lastName 
factory.registMapper("a-b-mapper", new mapper.Mapper()
    .setMapping("fullName", ["firstName", "lastName"], (firstName, lastName) => { return firstName + " " + lastName; }));
```

执行mapper部分代码 :

```javascript
factory.getMapper("a-b-mapper").map(a_var, b_var);
```

执行映射后b_var :

```bash
B {fullName: 'Rock White'}
```

#### 映射规则优先级

mapperjs的映射规则优先级是:

>setMapping配置的规则
>
>setIgnore配置的规则
>
>默认同名映射规则

若同一个字段同时被配置了Mapping规则和Ignore规则, 将会按照Mapping规则执行映射

```javascript
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

const mapper = require("./mapper");

var factory = new mapper.MapperFactory();

factory.registMapper("a-b-mapper", new mapper.Mapper()
    .setIgnore("fullName")
    .setMapping("fullName", ["firstName", "lastName"], (firstName, lastName) => { return firstName + " " + lastName;
}));

factory.getMapper("a-b-mapper").map(a_var, b_var);
```

执行映射结果:

```bash
B {fullName: 'Rock White'}
```

### 删除映射规则

mapperjs的Mapper类的 `delMapping() ``setIgnore() `方法能删除已经配置的规则
