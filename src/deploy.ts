const fs = require('fs');
const archiver = require('archiver');
const childProcess = require('child_process');
import { NodeSSH } from "node-ssh";
import {  DeployConfigItem } from "./nodeDependencies";
import { oConsole } from "./utils";
import * as vscode from 'vscode';

const { log, error, succeed, info, underline, } = oConsole;


export class Deploy {
  config: DeployConfigItem;
  loading: boolean;
  ssh: NodeSSH;
  workspaceRoot: string;
  taskList: { task: () => void | Promise<any>; tip: string; increment: number; async?: boolean; }[];
  constructor(config: DeployConfigItem, workspaceRoot: string) {
    this.config = config;
    this.workspaceRoot = workspaceRoot;
    this.loading = false;
    this.ssh = new NodeSSH();
    this.taskList = [
      { task: this.checkConfig, tip: "配置检查", increment: 0, async: false },
      { task: this.execBuild, tip: "打包", increment: 10 },
      { task: this.buildZip, tip: "压缩文件", increment: 20 },
      { task: this.connectSSH, tip: "连接服务器", increment: 50 },
      { task: this.removeRemoteFile, tip: "删除服务器文件", increment: 60, async: false },
      { task: this.uploadLocalFile, tip: "上传文件至服务器", increment: 70 },
      { task: this.unzipRemoteFile, tip: "解压服务器文件", increment: 80 },
      { task: this.disconnectSSH, tip: "断开服务器", increment: 90, async: false },
      { task: this.removeLocalFile, tip: "删除本地压缩文件", increment: 100, async: false },
    ];
    this.start();
  }
  start = async () => {
    log("--------开始执行-------");
    const { host } = this.config;
    const progressOptions = {
      location: vscode.ProgressLocation.Notification,
      title: `打包上传(${host})`,
    };
    vscode.window.withProgress(progressOptions, async (progress, token) => {
      let schedule = "";
      try {
        const { taskList } = this;
        const { length } = taskList;
        for (let i = 0; i < length; i++) {
          const { task, async, tip, increment } = taskList[i];
          progress.report({ increment, message: `${tip}中...（${increment}%）` });
          schedule = tip;
          if (async === false) {
            task();
          } else {
            await task();
          }
        }
        log("--------执行成功-------");
        vscode.window.showInformationMessage(`上传成功(${host})`, "知道了");
      } catch (err) {
        vscode.window.showInformationMessage(`上传失败(${host})：${err}`, "知道了");
        error(`${schedule}失败:`);
        error(err);
      }
      return new Promise((resolve) => {
        resolve();
      });
    });
    
  };
  checkConfig = () => {
    const { host, username, remotePath, distPath } = this.config;
    console.log(`检测配置...`, this.config);
    if (!remotePath) {
      throw new Error("请配置服务器文件目录[remotePath]");
    }
    if (!username) {
      throw new Error("请配置用户名[username]");
    }
    if (!host) {
      throw new Error("请配置服务端地址[host]");
    }
    if (!distPath) {
      throw new Error("请配置本地需要上传的目录[distPath]");
    }
  };
  // 1. 执行打包脚本
  execBuild = () => {
    const { config } = this;
    const { build } = config;
    console.log(`1.执行打包脚本：${build}`);
    if (!build) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      childProcess.exec(
        `${build}`,
        { cwd: this.workspaceRoot },
        (e: { message: any; } | null) => {
          if (e === null) {
            resolve();
          } else {
            reject(`1. 执行打包脚本失败：${e.message}`);
          }
        }
      );
    });
  };
  // 2. 压缩文件夹
  buildZip = () => {
    const { config } = this;
    return new Promise((resolve, reject) => {
      log(`2. 压缩文件夹： ${config.distPath}.zip`);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      }).on('error', (e: any) => {
        error(e);
        reject(`2. 打包zip出错: ${e}`);
      });

      const output = fs
        .createWriteStream(`${this.workspaceRoot}/${config.distPath}.zip`)
        .on('close', (e: any) => {
          if (e) {
            reject(`2. 打包zip出错: ${e}`);
            process.exit(1);
          } else {
            resolve();
          }
        });

      archive.pipe(output);
      archive.directory(`${this.workspaceRoot}/${config.distPath}`, false);
      archive.finalize();
    });
  };
  // 3. 连接服务器
  connectSSH = () => {
    const { config } = this;
    log(`3. 连接服务器： ${underline(config.host)}`);
    return new Promise((resolve, reject) =>{
      this.ssh.connect(config).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  };
  // 删除远程文件
  removeRemoteFile = () => {
    const { config } = this;
    const { remotePath } = config;
    log(`4. 删除远程文件 ${underline(remotePath)}`);
    return this.ssh.execCommand(`rm -rf ${remotePath}`);
  };
  // 上传本地文件
  uploadLocalFile = () => {
    const { config } = this;
    const localFileName = `${config.distPath}.zip`;
    const localPath = `${this.workspaceRoot}/${localFileName}`;
    log(`5. 上传打包zip至目录： ${underline(localPath)}`);
    return this.ssh.putFile(localPath, localFileName, null, {
      concurrency: 1
    });
  };
  // 解压远程文件
  unzipRemoteFile = () => {
    const { remotePath } = this.config;
    const remoteFileName = `${remotePath}.zip`;
    log(`6. 解压远程文件 ${underline(remoteFileName)}`);
    return this.ssh.execCommand(
      `unzip -o ${remoteFileName} -d ${remotePath} && rm -rf ${remoteFileName}`
    );
  };
  // 删除本地打包文件
  removeLocalFile = () => {
    const { config } = this;
    const localPath = `${this.workspaceRoot}/${config.distPath}`;
    log(`7. 删除本地打包目录: ${underline(localPath)}`);
    const remove = (path: string) => {
      if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file: any) => {
          let currentPath = `${path}/${file}`;
          if (fs.statSync(currentPath).isDirectory()) {
            remove(currentPath);
          } else {
            fs.unlinkSync(currentPath);
          }
        });
        fs.rmdirSync(path);
      }
    };
    remove(localPath);
    fs.unlinkSync(`${localPath}.zip`);
  };
  // 断开ssh
  disconnectSSH = () => {
    log(`8. 断开服务器`);
    this.ssh.dispose();
  };
}