import { Deploy } from "../deploy";
import { Dependency } from "../nodeDependencies";
import * as vscode from 'vscode';


let loading = false;

/**
 * 上传事件
 * @param dependency 
 */
export const uploadEntry = (dependency: Dependency) => {
  if (!dependency) {return;}
  console.log(dependency);
  if (loading) {
    vscode.window.showInformationMessage(`当前已有任务正在进行，请稍后再试`, "知道了");
    return;
  }
  loading = true;
  new Deploy(dependency.config, dependency.workspaceRoot, () => {
    loading = false;
  });
};
