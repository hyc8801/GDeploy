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
      { task: this.execBuild, tip: "打包中...", increment: 10 },
      { task: this.buildZip, tip: "压缩文件中...", increment: 10 },
      { task: this.connectSSH, tip: "连接服务器中...", increment: 50 },
      { task: this.uploadLocalFile, tip: "上传文件至服务器中...", increment: 60 },
      { task: this.removeRemoteFile, tip: "删除服务器压缩中...", increment: 80, async: false },
      { task: this.unzipRemoteFile, tip: "解压服务器文件中...", increment: 70 },
      { task: this.disconnectSSH, tip: "断开服务器中...", increment: 90, async: false },
      { task: this.removeLocalFile, tip: "删除本地压缩文件中...", increment: 100, async: false },
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
      try {
        const { taskList } = this;
        const { length } = taskList;
        for (let i = 0; i < length; i++) {
          const { task, async, tip, increment } = taskList[i];
          progress.report({ increment, message: `${tip}（${increment}%）` });
          if (async === false) {
            task();
          } else {
            await task();
          }
        }
        vscode.window.showInformationMessage(`上传成功(${host})`, "知道了");
      } catch (err) {
        vscode.window.showInformationMessage(`上传失败(${host})：${err}`, "知道了");
        error(err);
      }
      return new Promise((resolve) => {
        resolve();
      });
    });
    
  };
  // 1. 执行打包脚本
  execBuild = () => {
    const { config } = this;
    const { build } = config;
    console.log(`1.执行打包脚本：yarn ${build}`);
    return new Promise((resolve, reject) => {
      childProcess.exec(
        `yarn ${build}`,
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
      log(`2. 压缩文件夹： ${config.distPath} Zip`);
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
      archive.directory(config.distPath, false);
      archive.finalize();
    });
  };
  // 3. 连接服务器
  connectSSH = () => {
    const { config } = this;
    log(`3. 连接服务器： ${underline(config.host)}`);
    return new Promise((resolve, reject) =>{
      this.ssh.connect(config).then(() => {
        console.log("连接服务器成功");
        resolve();
      }).catch((err) => {
        console.log("连接服务器失败");
        reject(err);
      });
    });
  };
  // 上传本地文件
  uploadLocalFile = () => {
    const { config } = this;
    const localFileName = `${config.distPath}.zip`;
    const remoteFileName = `${config.remotePath}.zip`;
    const localPath = `${this.workspaceRoot}/${localFileName}`;
    log(`4. 上传打包zip至目录： ${underline(remoteFileName)}`);
    return this.ssh.putFile(localPath, remoteFileName, null, {
      concurrency: 1
    });
  };
  // 删除远程文件
  removeRemoteFile = () => {
    const { config } = this;
    const { remotePath } = config;
    log(`5. 删除远程文件 ${underline(remotePath)}`);
    return this.ssh.execCommand(`rm -rf ${remotePath}`);
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