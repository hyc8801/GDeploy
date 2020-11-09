import * as vscode from "vscode";
import chalk = require("chalk");

export const oConsole = {
  log: (...message: any[]) => {
    console.log(...message);
  },
  // 成功信息
  succeed: (...message: any[]) => {
    console.log(...message);
  },
  // 提示信息
  info: (...message: any[]) => {
    console.log(...message);
  },
  // 错误信息
  error: (...message: any[]) => {
    console.error(...message);
  },
  // 下划线重点信息
  underline: (...message: any[]) => {
    return chalk.underline.blueBright.bold(message);
  }
};
