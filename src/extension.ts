import * as vscode from 'vscode';
import { ChildProcess, execFile, spawn } from "child_process";
import { join, relative, normalize, basename, extname } from "path";
import { log } from "./log";
import { existsSync } from "fs";
import { getEnginePath, getIniPath, getLatestUseIni, setLatestUseIni, getOutDirectory, setEnginePath, setIniPath, setOutDirectory } from "./config";
import { fileTools } from './filetools';
interface CommandData {
  command: string,
  callback: (...args: any[]) => any,
}
export function activate(context: vscode.ExtensionContext) {
  log.init(context);
  fileTools.init(context);

  const commands: CommandData[] = [
    {
      command: "cocos-binding.setIniPath", callback: () => {
        userSetIniPath();
      }
    },
    {
      "command": "cocos-binding.openIni", callback: async () => {
        const ini = await chooseIni();
        if (ini && existsSync(ini)) {
          vscode.workspace.openTextDocument(ini).then(doc => {
            vscode.window.showTextDocument(doc);
          });
        }
      }
    },
    {
      command: 'lua-bind.setOutDir', callback: async (...args) => {
        userSetOutDir();
      },
    },
    {
      command: 'cocos-binding.bind', callback: async () => {
        const iniPath = getIniPath();
        if (!iniPath) {
          await userSetIniPath();
        }
        const iniFile = await chooseIni();
        if (iniFile) {
          runBinding(iniFile);
        }
      }
    },
    {
      command: "cocos-binding.setEnginePath", callback: async () => {
        // engine 目录
        let ret = await smartConfig({
          configDir: getEnginePath(),
          select: async () => {
            return await userSetEnginePath();
          },
          update: async (path: string) => {
            await setEnginePath(path);
          },
          title: "选择engine目录:"
        });
        if (!ret) { return; }
        // 自动推测ini目录
        ret = await smartConfig({
          configDir: getIniPath(),
          guessBaseDir: getEnginePath(),
          guessDir: join("tools", "tolua"),
          select: async () => {
            return await userSetIniPath();
          },
          update: async (path: string) => {
            await setIniPath(path);
          },
          title: "选择ini配置文件的目录:"
        });
        if (!ret) { return; }
        // 自动推测out目录
        ret = await smartConfig({
          configDir: getOutDirectory(),
          guessBaseDir: getEnginePath(),
          guessDir: join("cocos", "scripting", "lua-bindings", "auto"),
          select: async () => {
            return await userSetOutDir();
          },
          update: async (path: string) => {
            await setOutDirectory(path);
          },
          title: "选择输出目录:"
        });
        if (!ret) { return; }
      }
    }
  ];

  commands.forEach(command => {
    context.subscriptions.push(vscode.commands.registerCommand(command.command, command.callback));
  });
}
async function smartConfig(options: {
  configDir: string | null,
  guessBaseDir?: string | null, guessDir?: string,
  select: Function,
  update: (path: string) => void;
  title: string,
}): Promise<boolean> {
  const chooseNew = "choose new directory...";
  const items: vscode.QuickPickItem[] = [];
  if (options.configDir) {
    items.push({ label: options.configDir, picked: true, description: "当前配置" });
  }
  if (options.guessBaseDir && options.guessDir) {
    let guessDirResult = join(options.guessBaseDir, options.guessDir);
    if (existsSync(guessDirResult) && guessDirResult !== options.configDir) {
      items.push({ label: guessDirResult, description: "自动推荐" });
    }
  }
  if (items.length === 0) {
    await options.select();
  } else {
    items.push({ label: chooseNew, description: "重新选择一个目录" });
    const selectItem = await vscode.window.showQuickPick(items, { title: options.title });
    if (!selectItem) {
      return false;
    }
    if (selectItem.label === chooseNew) {
      await options.select();
    } else {
      await options.update(selectItem.label);
    }
  }
  return true;
}

async function userSetEnginePath() {
  const uris = await vscode.window.showOpenDialog({
    title: "select cocos engine root directory:",
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
  });
  if (uris && uris[0]) {
    const dir = uris[0].fsPath;
    await setEnginePath(dir);
    log.output(`set engine root path: ${dir}`);
    return dir;
  }
  return null;
}
async function userSetOutDir() {
  const uris = await vscode.window.showOpenDialog({
    title: "select out directory:",
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
  });
  if (uris && uris[0]) {
    const dir = uris[0].fsPath;
    await setOutDirectory(dir);
    log.output(`set out directory: ${dir}`);
    return dir;
  }
  return null;
}
async function userSetIniPath() {
  const uris = await vscode.window.showOpenDialog({
    title: "select ini files directory:",
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
  });
  if (uris && uris[0]) {
    const dir = uris[0].fsPath;
    await setIniPath(dir);
    log.output(`set ini path: ${dir}`);
    return dir;
  }
  return null;
}
async function chooseIni() {
  const iniPath = getIniPath();
  if (iniPath) {
    const files = await vscode.workspace.findFiles(
      new vscode.RelativePattern(iniPath, "**/*.ini"),
      new vscode.RelativePattern(iniPath, "userconf.ini")
    );
    if (files.length) {
      let items: vscode.QuickPickItem[] = [];
      files.forEach(file => {
        const label = relative(normalize(iniPath), normalize(file.fsPath));
        items.push({ label: label });
      });
      // 按照字母排序
      items.sort((a: vscode.QuickPickItem, b: vscode.QuickPickItem) => {
        if (a.label < b.label) {
          return -1;
        } else if (a.label > b.label) {
          return 1;
        } else {
          return 0;
        }
      });
      // 将上次的ini排在最上边
      let latestUseIni: string | null = getLatestUseIni();
      if (latestUseIni) {
        const idx = items.findIndex(el => el.label === latestUseIni);
        if (idx > -1) {
          const top = items.splice(idx, 1)[0];
          top.picked = true;
          top.description = "最近使用";
          items.unshift(top);
        }
      }

      const ret = await vscode.window.showQuickPick(items);
      if (ret) {
        await setLatestUseIni(ret.label);
        const iniFileFullPath = join(iniPath, ret.label);
        return iniFileFullPath;
      }
    } else {
      log.output(`no find *.ini files`);
    }
  }
  return null;
}
function runBinding(iniFile: string) {
  const exePath = fileTools.getGeneratorExecutable();
  if (existsSync(exePath)) {
    const extLen = extname(iniFile).length;
    const filename = basename(iniFile).slice(0, -extLen);
    const section = filename;
    const outDir = getOutDirectory();
    const outFile = `lua_${filename}_auto`;
    const userConf = `${getIniPath()}/userconf.ini`;
    if (!existsSync(userConf)) {
      log.output(`无效的配置文件: ${userConf}`);
      return;
    }
    // TODO: 需要考虑下自定义的userconf.ini怎么处理，这里面放了比较多的关联配置
    const args: string[] = [iniFile, "-s", section, "-t", "lua", "-o", outDir, "-n", outFile, "-i", userConf];
    /**
    Options:
        -s SECTION   sets a specific section to be converted
        -t TARGET    specifies the target vm. Will search for TARGET.yaml
        -o OUTDIR    specifies the output directory for generated C++ code
        -n OUT_FILE  specifies the name of the output file, defaults to the prefix in the .ini file

    userconf.ini 
        [DEFAULT]
        androidndkdir = F:\android-ndk-r10c
        clangllvmdir = F:\android-ndk-r10c\toolchains\llvm-3.4\prebuilt\windows-x86_64
        cocosdir = E:\proj\tank5\client\frameworks\cocos2d-x
        frameworks = E:\proj\tank5\client\frameworks
        cxxgeneratordir = E:\proj\tank5\client\frameworks\cocos2d-x\tools\bindings-generator
        extra_flags = -D__WCHAR_MAX__=0x7fffffff -U__MINGW32__
        clang_lib_version = lib
        gnu_libstdc_version = 4.8
        clang_version = 3.4
     */
    console.log(`cmd: ${exePath} ${args.join(' ')}`);
    const process = spawn(exePath, args, { cwd: fileTools.getStaticPath() });
    process.stdout.on('data', (data) => {
      console.log(log.output(data.toString()));
    });
    process.stderr.on('data', (data) => {
      console.log(log.output(data.toString()));
    });
    process.on('exit', (data) => {
      console.log(log.output(`exit with: ${data?.toString()}`));
    });
  }
}
export function deactivate() { }
