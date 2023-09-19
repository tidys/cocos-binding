import * as vscode from 'vscode';
class Log {
  init(context: vscode.ExtensionContext) {
    this.context = context;
    this.channel = vscode.window.createOutputChannel("cocos-binding");
    this.channel.show();
  }
  focusAndClear() {
    this.channel?.show();
    this.channel?.clear();
  }
  output(str: string = "") {
    this.channel?.appendLine(str);
    return str;
  }
  private context: vscode.ExtensionContext | null = null;
  private channel: vscode.OutputChannel | null = null;
}
export const log = new Log();
