---
title: "为什么我们需要 TS ？"
excerpt: ""
coverImage: "/assets/blog/why-we-need-ts/cover.jpg"
date: "2016-04-17 21:27"
ogImage:
  url: "/assets/blog/why-we-need-ts/cover.jpg"
---

> 文中不少观点的想法系个人见解，有一定的个人局限性，欢迎交流

## 现状

### 1、通过 ESLint 检测代码错误

这里忽略 typescript-eslint，因为其本质是利用了 TS 的类型信息来辅助 lint

- ESLint 的错误检测，是通过 AST 层面实现，且只能诊断单文件内的错误
- ESLint 是对 潜在 Bug 检查 和编码风格的约束
- 受限于 AST 层面的分析，ESLint 解决不了以下问题
  - 比如 import 错误的模块路径，模块找不到
  - 比如 import 错误的模块路径，模块找到了但是方法签名不一致
  - 比如函数调用入参不符合
  - 比如不熟悉的 DOM API 传参问题
  - 等等

### 2、不丝滑的编码体验

- 函数的参数多为 object 格式，必须去看源码才知道准确入参格式和返回值
- 函数的出入参有可能是 optional 的（undefined），且具备传染性
- Egg.js 中方法和属性是挂载在全局 IoC 容器上，访问均需通过 context 获取，在对代码 base 不熟悉的情况下，对应的 ctx 上的方法和属性不知道在哪里找对应实现，也无法通过代码 reference 跳转到对应的实现中
- 不可靠的代码提示和补全
  - VSCode 中编辑器自带的关键字提示，依赖 grammar 的 tokenize 生成的 symbol 做补全，以及代码中的出现过的单词
  - 部分三方库的 d.ts 由 DefinitelyTyped 托管，以 React 为例，代码中锁定了 16.13.1 的版本，但是 vscode 的 ts server 会默认缓存其他项目已安装 @types/react ，这时代码提示可能已经是 React 17 版本的 API 了
  - 代码提示主要来自于

![image.png](/assets/blog/why-we-need-ts/image0.png)

- VSCode 中 JS 文件的 LSP 也是 TypeScript，但在没有类型辅助的情况下，自动类型推导是残缺的，比如 React 中 React.MouseEventHandler 是需要手动约束才能确定对应 callback 参数类型的；比如以下的代码提示也是不能用的，因为在 egg IoC 中，这些模板需要通过 this/ctx 等去访问。

![image.png](/assets/blog/why-we-need-ts/image1.png)

## 引入 TS

> _**TypeScript is like JavaScript but with no surprises.**_

相比于 JS，TS 设计的初衷是面向大型项目和工程的，目的是提升 JS 项目编码的生产效率和便利性的。

### 1、TS 流行趋势

下图是 [The State of Javascript 2018](https://2018.stateofjs.com/javascript-flavors/typescript/likes) 的调研结果，很明显开发者对于 TS 的健壮性和编码风格/模式非常喜爱。

![image.png](/assets/blog/why-we-need-ts/image2.png)

在随后的 [The State of Javascript 2021](https://2021.stateofjs.com/en-US/other-tools/#javascript_flavors) 编译到 JS 的语言中，TS 也有非常高的使用率。

![image.png](/assets/blog/why-we-need-ts/image3.png)

而 [StackOverflow 2020 年 开发者调研](https://insights.stackoverflow.com/survey/2020#technology-most-loved-dreaded-and-wanted-languages-loved) 中显示，TypeScript 是 2020 年第二受喜爱的编程语言。

![image.png](/assets/blog/why-we-need-ts/image4.png)

在随后的 [StackOverflow 2021 年 开发者调研](https://insights.stackoverflow.com/survey/2021#technology-most-loved-dreaded-and-wanted) 中 TypeScript 被选为开发者们最想尝试的语言之一。

![image.png](/assets/blog/why-we-need-ts/image5.png)

### 2、Pros

- 沉浸式编码体验，不需要过多查 API 文档
  - 使用原生 API (DOM/Node/Worker 等） 时，TS 团队提供了非常完善的原生类型定义包
  - 社区流行三方包一部分已经改用 TS 重写，一部分已提供 d.ts 类型定义，还有一些则由 DefinitelyTyped 提供三方类型定义包
- 强类型/静态类型的优势
  - 可预测性：变量/函数有类型，且不可更改
  - 具备自动类型推导能力，一些场景下不需要额外声明类型
  - 静态类型是可配置的，严格程度可按照项目/进度分别设置
  - 类型本身可充当文档，增强代码的自解释性（有意义的命名+合理的代码分割+编写类型及其注释），对于多人协同的项目尤其重要
  - 在重构代码，以及升级三方包时，可提升工作效率，通过类型检查即可及时发现和解决问题
  - 有 研究 表明使用 TS 在 compile 阶段可以提前发现 15% 的通用类型的 bug
- 更完整的 LSP 特性与体验，结合 IDE 使用（如 vscode），让代码重构更便捷，更安心
- 通过装饰器能力提升代码复用能力，通过注解能力引入 AOP 编程模型
- 通过 TS 可引入更多设计模式进来，提升代码的封装性及降低耦合性

### 3、Cons

- 类型系统存在一定的学习成本和上手曲线
- 代码需要编译为 JS，静态类型仅作用于 compile 阶段，runtime 是没有类型的。（因此我们亦不可过度依赖类型校验，如校验参数等场景依然需要 runtime 级别校验）
- NodeJS 项目代码需要 tsc 编译，相比于现在直接用 js 写，线上报错时代码的可阅读性稍微变差一些
- OOP 编程：编程理念更面向对象，跟现在的 React 推崇的 FP 不太一样
- 设置严格模式 strict：true 时，可能会需要手工编码很多类型，应考虑多借助自动类型推导/自动类型生成
- 单元测试代码需要 mock 对象时，需要构造完整的 mock 对象，比 js 中 mock 更麻烦（这其实也是优点）
- TS 升级一般不遵循 semver，偶尔需要处理升级带来的类型不兼容问题

## "竞争对手"

### 1、JSDoc

- 与 TS 是可并存的，用 TS 来编码类型，用 JSDoc 来写注释，各自发挥所常
- 用 JSDoc 编码类型时代码量比 TS 大
- 没有自动类型推导
- TS 官方基于 JSDoc 语法之上推出了 TSDoc，作为 TS 推荐的文档注释格式

### 2、Intellicode/Tabnine/Copilot

- Intellicode 是人工智能提示，通过学习当前代码和开源代码仓库，做代码提示，为代码智能类别的提示。Tabnine 实现原理类似
- Copilot 是人工智能辅助编码，目的是通过自然语言编写注释，结合 AI 分析 Github 开源代码，推荐生成代码。有版权风险，且为一次性生成，也不能解决编码的代码提示问题
- 三者皆有数据安全风险，Copilot 还存在一定的版权风险
- 与 TS 本身不冲突，可并存，它们的定位和要解决的问题跟 TS 并不一样。TS 提供的是 Language Server Protocol 层面各种 API 能力支持，Intellicode 主要是 Code Completion，Copilot 是基于自然语言的推荐 Code Snippets

### 3、Flow

- 基本只有 Meta 下的 repo 在用，在于 TypeScript 的竞争中已经掉队，自家人 Jest 也迁移到了 TS
- IDE 支持偏弱，流行程度和社区支持程度不如 TS
- 安装使用需依靠 ocaml（使用 ocaml 实现）

### 4、Kotlin/Elm/ReScript

- 可编译到 JS
- 上手成本和迁移成本偏高

### 5、Rust/Go

- 可编译为 WASM，node 层可以与 v8 做 js binding
- 上手成本和迁移成本偏高

对于上述提到的各类 “竞争对手”，我们可以看出，有一部分并非真正意义上的竞争对手，他们本身跟 TS 的引入没有冲突，并且可以合理的共存。也有部分竞争对手，或者被后浪拍死在沙滩上，或者并不适合与当前项目的技术选型。

## 总结

相较于学习成本/引入成本，我们相信引入 TS 会给项目注入更多生命力，而当我们引入 TS 之后，也依然有很长的路要走。毕竟

**any 一时爽，重构火葬场**
