![](https://imgkr2.cn-bj.ufileos.com/8d6e7edb-a9f1-40ce-881b-ffa352312e55.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=1cscUK%252BYjeK7rUUbyKAHX1rueJo%253D&Expires=1604128009)

# vscode 插件——GDeploy(一键打包上传项目)

上传文件至服务器常用方法：

1. 通过 Xshell 命令上传
2. 通过 filezilla 可视化界面上传
3. 脚本代码通过 ssh 进行上传（可自行配置业务代码）
4. 通过 Jenkins 进项项目配置上传（关联 git 仓库）

公司内部团队基于`node-ssh`封装了内部打包脚手架，基于“能懒则懒”的原则，脚手架始还是得输入一次命令行，Jenkins 由于没有关联 git 仓库进行自动更新（原因嘛，喜欢看得见摸得着的更新，更具有安全感），so 参考[前端一键自动部署工具](https://juejin.im/post/6872914108979609614)，完成了基于 vscode 的插件，实现一键上传服务器功能。

## 插件功能

1. 🔨 自动构建打包项目
2. 🔨 自动压缩
3. 🔨 自动上传服务器发布

## 项目地址

1. git 地址： [https://github.com/15669028801/vscode-ssh.git](https://github.com/15669028801/vscode-ssh.git)

## 使用介绍

1. vscode 扩展搜索“GDeploy”，下载安装。
2. 在工作区根路径下添加 deploy.config 文件
3. 配置项目如下

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

可配置多个环境下的服务器地址及对应的配置项，配置参数说明 📚📚📚。

| 参数       | 说明                      |
| ---------- | ------------------------- |
| host       | 服务器地址                |
| username   | 用户名                    |
| password   | 密码 🔑                   |
| remotePath | 服务器项目文件目录        |
| build      | 构建代码命令              |
| distPath   | 打包文件夹名称, 默认 dist |
| privateKey | 秘钥地址 🔑               |

## 项目演示

![](https://imgkr2.cn-bj.ufileos.com/43f23f0c-70d4-4748-a48d-c10ebec54ba5.gif?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=WuB4lGUqT8UimKJtySQfFJZOpy4%253D&Expires=1604127254)

## 🙂🙂😆😘😁😝😋😄

又可以快乐的偷懒了...

打扰了，还有砖没搬完...
