import * as vscode from 'vscode';
import { uploadEntry } from './events/uploadEntry';
import { DepNodeProvider, Dependency } from './nodeDependencies';

// 激活事件
export function activate(context: vscode.ExtensionContext) {
	console.log("---------------组件激活😄---------------");
	const nodeDependenciesProvider = new DepNodeProvider(vscode.workspace.rootPath || "");
	vscode.window.registerTreeDataProvider('nodeDependencies', nodeDependenciesProvider);

	vscode.commands.registerCommand('nodeDependencies.refreshEntry', () => nodeDependenciesProvider.refresh());
	vscode.commands.registerCommand('extension.openPackageOnNpm', moduleName => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));
	vscode.commands.registerCommand('nodeDependencies.addEntry', () => vscode.window.showInformationMessage(`Successfully called add entry.`));
	vscode.commands.registerCommand('nodeDependencies.uploadEntry', uploadEntry);
	vscode.commands.registerCommand('nodeDependencies.deleteEntry', (node: Dependency) => vscode.window.showInformationMessage(`Successfully called delete entry on ${node.label}.`));
}

// 销毁周期
export function deactivate() {
	console.log("---------------銷毀😀---------------");
}
