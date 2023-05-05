---
title: '初识 NAPI-RS'
excerpt: ''
coverImage: '/assets/blog/learn-napi-rs/cover.png'
date: '2023-04-27 21:21'
ogImage:
  url: '/assets/blog/learn-napi-rs/cover.png'
---

> - 建议查阅 napi-rs 官网 [https://napi.rs/](https://napi.rs/)
> - 对于更深入的部分理解，可阅读 [https://juejin.cn/post/7202541740934709303](https://juejin.cn/post/7202541740934709303)

## 如何接入

目前提供：

- 提供自动化的多平台编译发布的解决方案：使用 `@napi-rs/cli` 初始化项目，或者通过 `napi-rs/package-template` 从 github 模板初始化。
- 提供 [全平台自动化跨平台编译](https://napi.rs/docs/cross-build/summary) 的解决方案，示例参考 [https://github.com/napi-rs/cross-build](https://github.com/napi-rs/cross-build)，提供基于 GitHub Linux CI 构建跨平台（横跨 Windows、macOS、Linux、Android 等不同 os、不同 libc、不同 arch 指令集平台），通过 zig + cargo-xwin 实现。
- 提供 cli 覆盖本地开发和 **github CI** （可选）全流程。

## 生成的项目的目录结构

```typescript
.
├── Cargo.lock
├── Cargo.toml
├── README.md
├── __tests__
│   └── index.spec.mjs
├── build.rs
├── html-text-content.darwin-arm64.node
├── index.d.ts // 依据 rust 源码中类型自动生成的 d.ts
├── index.js // 自动判断平台决定加载/使用的合适的产物 .node 文件
├── npm
│   ├── android-arm-eabi
│   │   ├── README.md
│   │   └── package.json
│   ├── android-arm64
│   │   ├── README.md
│   │   └── package.json
│   ├── darwin-arm64
│   │   ├── README.md
│   │   └── package.json
│   ├── darwin-x64
│   │   ├── README.md
│   │   └── package.json
│   ├── freebsd-x64
│   │   ├── README.md
│   │   └── package.json
│   ├── linux-arm-gnueabihf
│   │   ├── README.md
│   │   └── package.json
│   ├── linux-arm64-gnu
│   │   ├── README.md
│   │   └── package.json
│   ├── linux-arm64-musl
│   │   ├── README.md
│   │   └── package.json
│   ├── linux-x64-gnu
│   │   ├── README.md
│   │   └── package.json
│   ├── linux-x64-musl
│   │   ├── README.md
│   │   └── package.json
│   ├── win32-arm64-msvc
│   │   ├── README.md
│   │   └── package.json
│   ├── win32-ia32-msvc
│   │   ├── README.md
│   │   └── package.json
│   └── win32-x64-msvc
│       ├── README.md
│       └── package.json
├── package.json
├── rustfmt.toml
└── src
     └── lib.rs // rust 源码

```

### 自动按平台分发安装包

不同于 node-gyp 本地编译 C++ 包的方式，napi-rs 框架设计为

- 为各个 triples 分配一个 npm 包，并指定 os、cpu、libc 的值，按照对应的 triples 提前编译好对应的 .node 文件，并作为 main 字段导出。

```json
{
  "name": "@node-rs/xxhash-linux-arm64-gnu",
  "version": "1.3.0",
  "os": ["linux"],
  "cpu": ["arm64"],
  "libc": ["glibc"],
  "main": "xxhash.linux-arm64-gnu.node",
  "files": ["xxhash.linux-arm64-gnu.node"],
  "description": "Fastest xxhash implementation in Node.js",
  "license": "MIT",
  "engines": {
    "node": ">= 12"
  }
}
```

- 主包中，将所有平台的包作为 optionalDependencies 进行声明。

```json
{
  "name": "@node-rs/xxhash",
  "version": "1.3.0",
  "description": "Fastest xxhash implementation in Node.js",
  "main": "index.js",
  "typings": "index.d.ts",
  "files": ["index.js", "index.d.ts"],
  "napi": {
    "name": "xxhash",
    "triples": {
      "defaults": true,
      "additional": [
        "i686-pc-windows-msvc",
        "x86_64-unknown-linux-musl",
        "aarch64-unknown-linux-gnu",
        "armv7-unknown-linux-gnueabihf",
        "aarch64-apple-darwin",
        "aarch64-linux-android",
        "armv7-linux-androideabi",
        "x86_64-unknown-freebsd",
        "aarch64-unknown-linux-musl",
        "aarch64-pc-windows-msvc"
      ]
    }
  },
  "engines": {
    "node": ">= 12"
  },
  "optionalDependencies": {
    "@node-rs/xxhash-win32-x64-msvc": "1.3.0",
    "@node-rs/xxhash-darwin-x64": "1.3.0",
    "@node-rs/xxhash-linux-x64-gnu": "1.3.0",
    "@node-rs/xxhash-win32-ia32-msvc": "1.3.0",
    "@node-rs/xxhash-linux-x64-musl": "1.3.0",
    "@node-rs/xxhash-linux-arm64-gnu": "1.3.0",
    "@node-rs/xxhash-linux-arm-gnueabihf": "1.3.0",
    "@node-rs/xxhash-darwin-arm64": "1.3.0",
    "@node-rs/xxhash-android-arm64": "1.3.0",
    "@node-rs/xxhash-android-arm-eabi": "1.3.0",
    "@node-rs/xxhash-freebsd-x64": "1.3.0",
    "@node-rs/xxhash-linux-arm64-musl": "1.3.0",
    "@node-rs/xxhash-win32-arm64-msvc": "1.3.0"
  }
}
```

- 当用户安装主包时，会安装当前机器对应的 optionalDependencies 下来。比如在 mac 下安装 `@node-rs/xxhash`，则会同时安装 `@node-rs/xxhash-darwin-arm64` 包下来。

![image.png](/assets/blog/learn-napi-rs/deps-folder-structure.png)

- 用户通过导入主包的形式进行使用，主包的 index.js 中会判断好 os、arch、libc 类型，来决定 require 哪个平台包（或者是本地 .node 文件）

```javascript
switch (platform) {
  case 'android':
    // ...
    break;
  case 'win32':
    // ...
    break;
  case 'darwin':
    // ...
    break;
  case 'freebsd':
    // ...
    break;
  case 'linux':
    switch (arch) {
      case 'x64':
        if (isMusl()) {
          localFileExisted = existsSync(
            join(__dirname, 'xxhash.linux-x64-musl.node')
          );
          try {
            if (localFileExisted) {
              nativeBinding = require('./xxhash.linux-x64-musl.node');
            } else {
              nativeBinding = require('@node-rs/xxhash-linux-x64-musl');
            }
          } catch (e) {
            loadError = e;
          }
        } else {
          localFileExisted = existsSync(
            join(__dirname, 'xxhash.linux-x64-gnu.node')
          );
          try {
            if (localFileExisted) {
              nativeBinding = require('./xxhash.linux-x64-gnu.node');
            } else {
              nativeBinding = require('@node-rs/xxhash-linux-x64-gnu');
            }
          } catch (e) {
            loadError = e;
          }
        }
        break;
      case 'arm64':
        // ...
        break;
      case 'arm':
        // ...
        break;
      default:
        throw new Error(`Unsupported architecture on Linux: ${arch}`);
    }
    break;
  default:
    throw new Error(`Unsupported OS: ${platform}, architecture: ${arch}`);
}
```

## 一些用法

### 自动生成 d.ts

- napi-rs 提供了额外的类型支持，以便生成跟 ts 对应的上的类型文件。
- 将对应的 Rust 代码中的类型生成相应的 .d.ts 文件，为 binding 库提供类型支持。

### 命名转换

- 默认将 Rust 风格的蛇形转为驼峰风格，`hello_world` -> `helloWorld`
- 通过 `#[napi(js_name = "yourFnName")]` 修改宏的行为来自定义 js 中变量名

### JS 类型映射

> bindgen_prelude

JS 的基本类型的映射支持如下，具体可见 [https://napi.rs/docs/concepts/values](https://napi.rs/docs/concepts/values)

- Undefined
- Null
- Number/BigInt
- String
- Boolean
- Buffer
- Object
- Array
- TypedArray

关于 JSValue 可见 [https://napi.rs/docs/compat-mode/concepts/js-values](https://napi.rs/docs/compat-mode/concepts/js-values)

## 工作机制

### 模块注册

> #[napi] 宏自动编译生成对应的模块导出，相比于 v1，v2 版本通过宏编译 + 约定的方式简化了写法。

```rust
use napi_derive::napi;

#[napi]
pub fn plus_100(input: u32, input1: u32) -> u32 {
  input + input1 + 100
}
```

上述代码的目的是将 `plus_100`导出并暴露给 JS 使用。我们来看看 napi-rs 的宏是怎么编译这段代码的。看的顺序是从下往上的反过来。

补充 FFI 和 ABI 的基本概念 FFI（Foreign Function Interface/外部函数接口）和 ABI（Application Binary Interface/应用程序二进制接口）是两个相关但不同的概念，它们都涉及到不同语言或系统之间的函数调用和数据交换。
FFI 是实现不同语言间交互的接口或者说是机制，允许不同语言编写的程序互相通信和调用，且不需要额外的转换或者序列化/反序列化。
ABI 则类似规范/协议，定义了不同语言或系统之间的函数调用和数据交换的细节，例如函数参数和返回值的传递方式、寄存器和栈的使用、可执行文件的格式、虚拟地址空间布局等等。
FFI 依赖于 ABI 来实现跨语言或跨系统的函数调用，FFI 通过 ABI 来确认函数的签名，包括函数的名称、参数类型、返回类型，以及函数的地址（即函数在内存中的位置）。
FFI 可以看作是 ABI 的一个高层抽象，它隐藏了 ABI 的复杂性，提供了一个简单易用的接口。

```rust
// 用于指定 __napi_register__plus_100 在程序启动时自动运行
// 将 Rust 函数 `plus_100_js_function` 函数注册为模块的导出项
#[napi::bindgen_prelude::ctor]
fn __napi_register__plus_100() {
  napi::bindgen_prelude::register_module_export(None, "plus100\u{0}", plus_100_js_function);
}

// 包装函数：注册一个 js 函数 plus100
// 其内部调用 `__napi__plus_100`
unsafe fn plus_100_js_function(
  env: napi::bindgen_prelude::sys::napi_env,
) -> napi::bindgen_prelude::Result<napi::bindgen_prelude::sys::napi_value> {
  // https://nodejs.org/api/n-api.html#napi_create_function
  // 用来保存 napi_create_function 调用返回的 napi_value
  // 这个 napi_value 指向创建好的 js 函数
  let mut fn_ptr = std::ptr::null_mut();
  // 调用 napi_create_function 注册
  napi::bindgen_prelude::check_status!(
    napi::bindgen_prelude::sys::napi_create_function(
      env,
      "plus100\u{0}".as_ptr() as *const _,
      8usize,
      Some(__napi__plus_100), // napi callback
      std::ptr::null_mut(),
      &mut fn_ptr, // 函数对应的 napi_value 引用传给了 fn_ptr
    ),
    "Failed to register function `{}`",
    "plus_100",
  )?;

  // 将 js_function 与下方的 __napi__plus_100 关联起来
  napi::bindgen_prelude::register_js_function(
    "plus100\u{0}", // JS 函数名
    plus_100_js_function, // 自身
    Some(__napi__plus_100), // Rust ABI 函数
  );
  // 将 js 函数引用的 napi_value 返回
  Ok(fn_ptr)
}

// __napi__plus_100 是一个暴露给 C 调用的 FFI 函数
// 接入 env 环境参数和 cb 回调信息两个参数
// 然后从 cb 回调信息中提取 plus_100 函数执行所需的参数
// 最后执行 plus_100 并将值再转为 napi_value 返回
extern "C" fn __napi__plus_100(
  env: napi::bindgen_prelude::sys::napi_env,
  cb: napi::bindgen_prelude::sys::napi_callback_info,
) -> napi::bindgen_prelude::sys::napi_value {
  unsafe {
    napi::bindgen_prelude::CallbackInfo::<2usize>::new(env, cb, None)
      .and_then(|mut cb| {
        let arg0 = {
          <u32 as napi::bindgen_prelude::FromNapiValue>::from_napi_value(env, cb.get_arg(0usize))?
        };
        let arg1 = {
          <u32 as napi::bindgen_prelude::FromNapiValue>::from_napi_value(env, cb.get_arg(1usize))?
        };
        napi::bindgen_prelude::within_runtime_if_available(move || {
          let _ret = { plus_100(arg0, arg1) };
          <u32 as napi::bindgen_prelude::ToNapiValue>::to_napi_value(env, _ret)
        })
      })
      .unwrap_or_else(|e| {
        napi::bindgen_prelude::JsError::from(e).throw_into(env);
        std::ptr::null_mut::<napi::bindgen_prelude::sys::napi_value__>()
      })
  }
}

// 你写的 Rust 函数
pub fn plus_100(input: u32, input1: u32) -> u32 {
  input + input1 + 100
}

```

> 而 `register_module_export` 会在 addon 程序被初次载入时：
>
> - 将函数的指针放到一个 local thread queue 中
> - 在 Node 初始化 addon 后，会调用 addon 中 `napi_register_module_v1` 函数，传入 env 和 exports 对象
> - NAPI-RS 在 `napi_register_module_v1` 中拿到 env 后遍历 local thread queque 中存储的函数并传入 `env`，进而得到 `register_js_function` 等 register_xxx 注册的值（函数/常量/Class）等，挂载到 exports 对象上
>
> 这就是初始化的完整过程。更多可见源码 `napi/src/bindgen_runtime/module_register.rs` 中的实现。

### 调用顺序

> Node 和 Rust 互相调用建立在 C ABI 基础上的 FFI 调用

Node.js 中调用 plus100 -> 调用到 FFI 函数 `__napi__plus_100` -> 提取参数给 Rust fn plus_100

![image.png](/assets/blog/learn-napi-rs/node-call-rust.png)

## 要注意的点

### 包名修改

强烈建议直接使用 `napi rename` 命令执行：会直接更新模板里所有跟 pkg.json#name 和 pkg.json#napi.name 相关的变量命名。

- 初始化项目时，后续若要修改 root 下 package.json 中包名（name），需要将 npm 目录下所有的平台产物包名也要同步修改。
- package.json 下的 `napi.name` 修改时，会影响生成的 .node 产物命名，需要修改掉：
  - index.js 中针对不同平台时 require local 和 require 对应 npm 包名的规则

```javascript
case 'arm64':
  try {
    if (localFileExisted) {
      nativeBinding = require('./test-1.win32-arm64-msvc.node')
    } else {
      nativeBinding = require('test-1-win32-arm64-msvc')
    }
  } catch (e) {
    loadError = e
  }
  break
```

- CI 配置中的 env.app_name，影响到 job 间持久化产物的规则，类似 [https://github.com/vagusX/rs-html-text-content/actions/runs/4459416487/jobs/7831855982](https://github.com/vagusX/rs-html-text-content/actions/runs/4459416487/jobs/7831855982)
- 平台产物包的 main 字段以及 files 字段

### Rust Eum 与 TS Enum 不对等

js 中没有 Enum，而 TS 中 enum 长这样。

```typescript
// 编译前
export enum Kind {
  Duck,
  Dog,
  Cat,
}

// ts 编译为 js 产物
var Kind;
(function (Kind) {
  Kind[(Kind['Duck'] = 0)] = 'Duck';
  Kind[(Kind['Dog'] = 1)] = 'Dog';
  Kind[(Kind['Cat'] = 2)] = 'Cat';
})(Kind || (Kind = {}));
```

Rust 的 enum 通过 napi 导出到 js 后，跟 TS 中 enum 的区别是：缺少 TS 中 [**reverse mapping 的行为**](https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings)

```rust
#[napi]
pub enum Kind {
  Duck,
  Dog,
  Cat,
}
```

```rust
{
    "Duck":0,
    "Dog":1,
    "Cat":2
}
```

### JS 和 Rust 之间的 Object 转换成本比其他基本类型高

每次调用 `Object.get("key")` 实际上都会分派到 Node，包括两个步骤：fetch value、将 JS 值转为 Rust 值，调用 `Object.set("key", v)` 也是一样。同样的 JS Array 也是一样。
推荐将对应的参数通过 `struct`定义好，这样避免直接使用 `Object`类型。

```rust
#[napi(object)] // cloned from JS Object，为独立副本，不会影响 JS 值
struct PackageJson {
	pub name: String,
	pub version: String,
	pub dependencies: Option<HashMap<String, String>>,
	pub dev_dependencies: Option<HashMap<String, String>>,
}

#[napi]
fn read_package_json(pkgJSON: PackageJson) -> PackageJson {
	pkgJSON
}

#[napi]
fn read_pkg_json(pkgJSON: Object) -> Object {
	pkgJSON
}
```

```javascript
const { readPackageJson, readPkgJson } = require('./index');

// { name: 'test-3333', version: '1.0.0' }
console.log(
  readPackageJson({
    name: 'test-3333',
    version: '1.0.0',
    platform: 'linux',
  })
);

// { name: 'test-3333', version: '1.0.0', platform: 'linux' }
console.log(
  readPkgJson({
    name: 'test-3333',
    version: '1.0.0',
    platform: 'linux',
  })
);
```

### TypedArray 可在 Node 和 Rust 间共享数据

同理 Buffer 也是 Unit8Array 的子类，具体参见 [https://napi.rs/docs/concepts/typed-array](https://napi.rs/docs/concepts/typed-array)

## 高级用法

- Rust 类型中 `u64`, `u128`, `i128`，转为 JS 需要配置 napi6（[node 10.7](https://nodejs.org/api/n-api.html#napi_create_bigint_int64)） 开启 BigInt 支持，开启方式：在 `Cargo.toml`中开启 `features = ["napi6"]`。（默认为 napi4）

```yaml
[dependencies]
napi = { version = "2.0.2", default-features = false, features = ["napi6"] }
```

- Types Overwrite：使用字符串作为 napi 宏的参数，达到覆盖掉自动生成类型的效果。可以覆盖参数、返回值、`struct` 中的字段。

```typescript
#[napi(ts_args_type="callback: (err: null | Error, result: number) => void")]
fn call_threadsafe_function(callback: JsFunction) -> Result<()> {
  Ok(())
}
```

```typescript
// origin
export function callThreadsafeFunction(callback: (...args: any[]) => any): void;

// modified
export function callThreadsafeFunction(
  callback: (err: null | Error, result: number) => void
): void;
```

- Async/Await：配合 [tokio](https://tokio.rs/) 一起使用
  - Rust 传给 js 一个 Promise 作为结果：
  - js 传给 Rust 一个 Promise 作为参数：高级用法，但是可以不用
- 使用 [AsyncTask/Task](https://napi.rs/docs/concepts/async-task) （前者是后者的 wrapper，让 js 可以调用）：Task 让我们具备在 libuv 线程池中异步执行任务（如一些高 cpu 耗时任务），而不阻塞 Node.js 的 Event Loop。
- [External](https://napi.rs/docs/concepts/external)：**在 JS 中**，调用后产生一个对象以表示 Native 值，该对象上有一些方法可以再跟 Native 交互。

## 如何调试

### 调试宏

vscode rust-analyzer 自带

![image.png](/assets/blog/learn-napi-rs/expand-macro-recursively.png)
![image.png](/assets/blog/learn-napi-rs/expanded-marco.png)

### 调试源码

> 以下部分展示的是使用同一个 js 入口文件进行调试

#### 调试 nodejs 部分

使用标准的 vscode js debugger 配置即可，或者创建一个 JavaScript Debug Terminal

```json
{
  "configurations": [
    {
      "name": "debug js",
      "type": "node",
      "request": "launch",
      "skipFiles": ["<node_internals>/**"],
      "cwd": "${workspaceFolder}",
      "program": "${file}",
    },
}
```

#### 调试 Rust 部分

需要先构建出一个支持调试的产物，再使用 lldb 进行调试

```shell
# 构建支持调试的产物
napi build --platform
# 使用 lldb 启动并调试
lldb -- /usr/local/bin/node app.js
```

我将它编写为两个配置文件，分别是 .vscode/tasks.json 和 .vscode/launch.json

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "build:debug",
      "group": "build",
      "problemMatcher": [],
      "label": "npm: build:debug"
    }
  ]
}
```

```json
{
  "configurations": [
    {
      "type": "lldb",
      "request": "launch",
      "sourceLanguages": ["rust"],
      "name": "debug rust",
      "program": "node",
      "preLaunchTask": "npm: build:debug",
      "args": ["--inspect", "${file}"]
    }
  ]
}
```
