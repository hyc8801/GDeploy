![](https://files.mdnice.com/logo.svg)

# vscode插件——ssh一键上传

上传文件至服务器常用方法：
1. 通过Xshell 命令上传
2. 通过filezilla 可视化界面拖动上传
3. 脚本代码通过ssh进行上传（可自行配置业务代码）
4. 通过Jenkins 进项项目配置上传（关联git仓库）

公司内部团队基于`node-ssh`封装了内部打包脚手架，基于“能懒则懒”的原则，脚手架始还是得输入一次命令行，Jenkins由于没有关联git仓库进行自动更新（原因嘛，喜欢看得见摸得着的更新，更具有安全感），so参考[前端一键自动部署工具](https://juejin.im/post/6872914108979609614)，完成了基于vscode的插件，实现一键上传服务器功能。

## 插件功能
1. 自动构建打包项目
2. 自动压缩
3. 自动上传服务器发布

## 项目地址
1. git地址 []()

## 使用介绍
1. 在工作区根路径下添加deploy.config文件
2. 配置项目如下
```javascript

const config = {
  test: {
    host: '127.0.0.1', // 服务器地址
    user: 'root', // 登录用户名
    password: 'password', // 登录密码
    remotePath: '/home/www/admin', // 项目上传的服务器文件目录
    build: 'yarn build:test', // 构建执行的命令
  },
  preprod: {
    host: '192.168.0.1',
    user: 'root',
    password: 'password',
    remotePath: '/home/www/admin', 
    build: 'yarn build:pre',
  },
  master: {
    host: '192.168.0.2',
    user: 'root',
    password: 'password',
    remotePath: '/home/www/admin', 
    build: 'yarn build',
  },
};

module.exports = config;
```

可配置多个环境下的服务器地址及对应的配置项，配置参数说明。

| 参数    | 说明    |
| --- | --- |
|   host  |  服务器地址   |
|  username   |  用户名   |
|   password  |   密码  |
|  remotePath   |  服务器项目文件目录   |
|  build   |  构建代码命令   |
|   distPath  |  打包文件夹名称, 默认 dist   |
|   privateKey  |  string   |

## 项目演示

![]()

## 🙂🙂😆😘😁😝😋😄

又可以快乐的偷懒了...