import { join } from "path";
import * as vscode from 'vscode';
class FileTools {
  init(context: vscode.ExtensionContext) {
    this.context = context;
  }
  getStaticPath() {
    return join(this.context!.extensionPath, 'static');
  }
  getGeneratorExecutable() {
    const exePath = join(this.getStaticPath(), "generator-bin.exe");
    return exePath;
  }
  private context: vscode.ExtensionContext | null = null;

}
export const fileTools = new FileTools();