# vscode 扩展笔记（常用方法）

## 一、vscode.window

### 1. 消息框 showInformationMessage

方法：`vscode.window.showInformationMessage(title, ...btn)`

- title: string [标题]
- btn: string[] [按钮标题]

```JavaScript
import * as vscode from 'vscode';
  const title = "我是一个消息框";
  const btnGroup = ["知道了", "拒绝", "忽略"]

  vscode.window.showInformationMessage(title, ...btnGroup)
  .then((res) => {
    console.log("😋🙃: res", res);
  });
```

### 2. 快速选择 showQuickPick

方法：`vscode.window.showQuickPick(options, config)`

```TypeScript
import * as vscode from 'vscode';

const options = ["1", "2", "3", "4"];
const config = { placeHolder: "请选择数字" };

vscode.window.showQuickPick(options, config)
.then((res) => {
  console.log("😋🙃: res", res);
})
```

### 3. 选择文件

方法：`vscode.window.showOpenDialog(options)`

```TypeScript
import * as vscode from 'vscode';

const options = {
  title: "请选择文件", // 标题
  defaultUri: "/", // 默认打开路径
  openLabel: "选择", // 确定按钮文案
  canSelectFiles: true, // 允许选择文件， 默认true
  canSelectFolders: false, // 允许选择文件夹，默认false
  canSelectMany: false, // 允许多选
  filters: { 'Images': ['png', 'jpg'] }, // 筛选
}

vscode.window.showOpenDialog(options)
.then(res =>{
  console.log("😋🙃: res", res);
})
```

### 4. 进度条

方法： `vscode.window.withProgress`

```TypeScript
import * as vscode from 'vscode';

const options = {
  location: vscode.ProgressLocation.Notification,
  // ProgressLocation.Window 底部任务栏
  // ProgressLocation.Notification: 通知弹窗（右下角）
  // ProgressLocation.SourceControl: 未知（翻译： 源头控制）
  title: "加载中...",
  cancellable: true,
}

vscode.window.withProgress(options, (progress, token) => {
  token.onCancellationRequested(() => {
    console.log("用户取消");
  });

  // 设置进度条
  progress.report({ increment: 0 });
  setTimeout(() => {
    progress.report({ increment: 10, message: "努力加载中... 10%" });
    console.log("😋🙃 -> 努力加载中... 10%");
  }, 1000);

  setTimeout(() => {
    progress.report({ increment: 40, message: "努力加载中... 50%" });
    console.log("😋🙃 -> 努力加载中... 50%");
  }, 2000);

  setTimeout(() => {
    progress.report({ increment: 50, message: "努力加载中... 100%" });
    console.log("😋🙃: activate -> 努力加载中... 100%");
  }, 3000);

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("回调函数")
      resolve();
    }, 1000);
  })
})
```
