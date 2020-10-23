import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import { Deploy } from "./deploy";

export class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {
  // workspaceRoot 当前工作区根路径
  deployConfig: DeployConfig;
  constructor(private workspaceRoot: string) {
    this.deployConfig = require(this.workspaceRoot + "/deploy.config");
  }
  
  private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;

  getTreeItem(element: Dependency): vscode.TreeItem  {
    return element;
  }

  refresh(): void {
		this._onDidChangeTreeData.fire();
  }
  
  getChildren(element?: Dependency): Thenable<Dependency[]> {
    // element 当前选中的节点， 如果为空则为根节点
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('当前无工作区');
      return Promise.resolve([]);
    }
    
    if (element) {
      return Promise.resolve([]);
    } else {
      const configList = toArray(this.deployConfig).map((item) =>{
        return new Dependency(item.name, item.config.host, 0, item.config, this.workspaceRoot, {
          title: "打包上传",
          command: "nodeDependencies.uploadEntry",
          tooltip: ""
        });
      });
      return Promise.resolve(configList);
    }
  }

}

export class Dependency extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		private readonly version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly config: DeployConfigItem,
    public readonly workspaceRoot: string,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		this.tooltip = `服务器：${this.label} 地址：${this.version}`;
		this.description = this.version;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'server_light.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'server_dark.svg')
	};

	contextValue = 'dependency';
}

const toArray = (obj: {[x: string]: any}): {name: string, config: any}[] => {
  const arr = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const element = obj[key];
      element.username = element.user;

      arr.push({name: key, config: Object.assign({distPath: "dist"}, element)});
    }
  }
  return arr;
};

export interface DeployConfig {[x: string]: DeployConfigItem}

export interface DeployConfigItem {
  host: string; // 服务器地址
  user?: string, // 用户名
  username?: string, // 用户名
  password: string, // 密码
  remotePath: string, // 服务器文件目录
  build: string, // 构建代码命令
  distPath?: string; // 打包好的文件夹名称, 默认 dist
  privateKey?: string; // 秘钥地址
}