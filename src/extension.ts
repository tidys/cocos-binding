import * as vscode from 'vscode';
import { execFile } from "child_process";
import { join, relative, normalize, basename, extname } from "path";
import { log } from "./log";
import { existsSync } from "fs";
import { getEnginePath, getIniPath, getOutDirectory, setEnginePath, setIniPath, setOutDirectory } from "./config";
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
}) {
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
			const items: vscode.QuickPickItem[] = [];
			files.forEach(file => {
				const label = relative(normalize(iniPath), normalize(file.fsPath));
				items.push({ label: label });
			});
			const ret = await vscode.window.showQuickPick(items);
			if (ret) {
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
		const len = extname(iniFile).length;
		const ba = basename(iniFile);
		const a = ba.slice(0, -len);
		const section = a;
		const outDir = getOutDirectory();
		const outFile = `lua_${a}_auto`;
		const args: string[] = [iniFile, "-s", section, "-t", "lua", "-o", outDir, "-n", outFile];
		return;
		/**
		 * 
		 * Options:
			-s SECTION   sets a specific section to be converted
			-t TARGET    specifies the target vm. Will search for TARGET.yaml
			-o OUTDIR    specifies the output directory for generated C++ code
			-n OUT_FILE  specifcies the name of the output file, defaults to the prefix in the .ini file
		 * 
		 * "args": [
				"e:/proj/a/cocos2dx_multitexture.ini",
				"-s",
				"cocos2dx_multitexture",
				"-t",
				"lua",
				"-o",
				"e:/proj/tank5/client/frameworks/cocos2d-x/cocos/scripting/lua-bindings/auto",
				"-n",
				"lua_cocos2dx_multitexture_auto"
			]
		 * 
		 */
		execFile(exePath, args, (error, stdout, stderr) => {
			if (error) {
				console.error(error.message);
				log.output(error.message);
			}
			if (stdout) {
				console.log(stdout);
				log.output(stdout);
			}
		});
	}
}
export function deactivate() { }
