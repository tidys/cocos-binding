import { join } from "path";
import * as vscode from 'vscode';
class FileTools {
    init(context: vscode.ExtensionContext) {
        this.context = context;
    }
    getGeneratorExecutable() {
        const exePath = join(this.context!.extensionPath, "static", 'win', "generator.exe");
        return exePath;
    }
    private context: vscode.ExtensionContext | null = null;

}
export const fileTools = new FileTools();