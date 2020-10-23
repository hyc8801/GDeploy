import * as vscode from "vscode";
import chalk = require("chalk");
import ora = require("ora");

export const oConsole = {
  log: (...message: any[]) => {
    console.log(...message);
  },
  // 成功信息
  succeed: (...message: any[]) => {
    console.log(...message);
    // ora().succeed(chalk.greenBright.bold(message));
  },
  // 提示信息
  info: (...message: any[]) => {
    console.log(...message);
    // ora().info(chalk.blueBright.bold(message));
  },
  // 错误信息
  error: (...message: any[]) => {
    console.error(...message);
    // ora().fail(chalk.redBright.bold(message));
  },
  // 下划线重点信息
  underline: (...message: any[]) => {
    // console.log(...message);
    return chalk.underline.blueBright.bold(message);
  }
};
