/*
 * @Date: 2025-03-19 21:24:35
 * @LastEditors: Zhang Yueqian<zhangyueqian@antiy.cn>
 * @LastEditTime: 2025-03-21 09:34:45
 * @FilePath: /code-kanban/src/extension.ts
 */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

const KANBAN_FILE = ".kanban.json";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

export class KanbanProjectsProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
        private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<
                vscode.TreeItem | undefined | null | void
        >();
        readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

        getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
                return element;
        }

        getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
                if (!element) {
                        const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
                        if (!workspaceRoot) {
                                return [];
                        }

                        const projectsFilePath = path.join(workspaceRoot, KANBAN_FILE);
                        if (!fs.existsSync(projectsFilePath)) {
                                return [];
                        }

                        const fileContent = fs.readFileSync(projectsFilePath, "utf8");
                        const projectsData = JSON.parse(fileContent);
                        const projects: vscode.TreeItem[] = [];

                        for (const project of projectsData) {
                                if ("title" in project) {
                                        projects.push(new vscode.TreeItem(project["title"]));
                                }
                        }

                        return projects;
                }

                return [];
        }

        refresh(): void {
                this._onDidChangeTreeData.fire();
        }
}

export function activate(context: vscode.ExtensionContext) {
        // Use the console to output diagnostic information (console.log) and errors (console.error)
        // This line of code will only be executed once when your extension is activated
        console.log('Congratulations, your extension "code-kanban" is now active!');

        // Check if .kanban file exists in the current directory
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspaceRoot) {
                vscode.window.showInformationMessage("No workspace open");
                return;
        }
        const kanbanFilePath = path.join(workspaceRoot, ".kanban");
        const projectsData = new KanbanProjectsProvider();
        if (workspaceRoot) {
                const projectsFilePath = path.join(workspaceRoot, KANBAN_FILE);
                const watcher = vscode.workspace.createFileSystemWatcher(projectsFilePath);
                watcher.onDidChange(() => {
                        projectsData.refresh();
                });
                watcher.onDidDelete(() => {
                        projectsData.refresh();
                });
                watcher.onDidCreate(() => {
                        projectsData.refresh();
                });
        }
        // context.subscriptions.push(vscode.window.registerWebviewViewProvider("projects", new MyWebviewViewProvider(context)));
        // vscode.window.registerTreeDataProvider("projectsData", new KanbanProjectsProvider());
        vscode.window.createTreeView("kanban.projects", {
                treeDataProvider: projectsData,
        });

        // The command has been defined in the package.json file
        // Now provide the implementation of the command with registerCommand
        // The commandId parameter must match the command field in package.json
        const initCommand = vscode.commands.registerCommand("code-kanban.init", () => {
                // The code you place here will be executed every time your command is executed
                // Display a message box to the user
                if (!workspaceRoot) {
                        vscode.window.showInformationMessage("No workspace open");
                        return;
                }
                const projectsFilePath = path.join(workspaceRoot, KANBAN_FILE);

                let projects = [{ title: "Project One" }, { title: "Project Two" }];

                fs.writeFileSync(projectsFilePath, JSON.stringify(projects));

                vscode.window.showInformationMessage("Projects file created");
        });

        context.subscriptions.push(initCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
