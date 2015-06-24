#JavaScript Refactor

只有[Skilltree](https://github.com/phodal/skillock)和[Developer学习路线图](https://github.com/phodal/awesome-developer) 是远远不够的。

说明: 在构建[EchoesWorks](https://github.com/phodal/echoesworks)的时候用到了这个库，这是一个用于生成Markdown的Micro Markdown库。

由于对代码重构的最大难题是``没有测试``，在这里我们提供了尽可能高的测试覆盖率。至于功能见测试用例，``测试用例是最好的文档``。

``注意``: 这里并没有说原来的代码写得不好，只是在这里可以让我们学习重构。

你要面对的挑战有:

- 注释 (Comments) (ps: 合理的函数名、变量名可以取代注释)
- 重复代码 (Duplicated Code）
- 过大的类 (Large Class)
- 多层嵌套
- 。。。

可以参考的模式:

 - Decorator (装饰)
 - Composite (组成)
 
或者当时我想用的

 - Pipes and Filters

可以参考的书籍:

《重构与模式》

《重构: 改善既有代码的设计》

测试代码质量:

[CodeClimate](https://codeclimate.com/)(ps: [用code climate来clean code与重构](http://www.phodal.com/blog/use-code-climate-clean-code-and-refactor/))

相关文章: 

[前端技能训练: 重构一](http://www.phodal.com/blog/frontend-improve-refactor-javascript-code/)

##Setup

1.Install 

    npm install
    
2.Test
    
    npm test


ps: 在ThoughtWorks，写出功能代码只是走了一半的路，``红``->``绿``->``重构``。


Enjoy it!

##订阅

QQ交流群: 321689806

推荐IDE: WebStorm

请到[https://github.com/artisanstack/summary](https://github.com/artisanstack/summary)

点击右上角的``watch``即可订阅。

##加入手工艺人成长计划

当前我只是一名普通的程序员，经历过一些学习的过程，也想分享一个成长的过程。并非给每个人一万小时，每个人都可以成长到一定的水平。当然，没有``银弹``，如果你想加速成长就来试试吧。

1.申请加入``Trainee``Team，即可加入这个计划

2.在相应的repo上创建一个新的分支(你的github)名，如我叫phodal:

    git checkout -b phodal
    
3.相应的代码提交
    
    git push origin 你的github
    
4.如果数量较少，我很乐意对每期地代码进行review。    

:weary::weary: 动机: 作为一个未来的咨询师，我还是想了解如何去coach别人。

##License##

© 2015 [Phodal Huang](http://www.phodal.com). This code is distributed under the MIT license. See `LICENSE.txt` in this directory.

[待我代码编成，娶你为妻可好](http://www.xuntayizhan.com/blog/ji-ke-ai-qing-zhi-er-shi-dai-wo-dai-ma-bian-cheng-qu-ni-wei-qi-ke-hao-wan/)
     
