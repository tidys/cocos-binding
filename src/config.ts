import * as vscode from "vscode";
const id = 'cocos-binding';
const KEY_INI = "ini_path";
const KEY_ENGINE = "engine_path";
const KEY_OUT_DIRECTORY = "out_directory";
const KEY_LATEST_USE_INI = 'latest_use_ini';
export function getLatestUseIni() {
    const config = vscode.workspace.getConfiguration(id);
    if (config.has(KEY_INI)) {
        return config.get<string>(KEY_LATEST_USE_INI) || "";
    }
    return null;
}
export async function setLatestUseIni(file: string) {
    const config = vscode.workspace.getConfiguration(id);
    return await config.update(KEY_LATEST_USE_INI, file);
}
export function getIniPath() {
    const config = vscode.workspace.getConfiguration(id);
    if (config.has(KEY_INI)) {
        return config.get<string>(KEY_INI) || "";
    }
    return null;
}
export function setIniPath(path: string) {
    const config = vscode.workspace.getConfiguration(id);
    return config.update(KEY_INI, path);
}
export function getEnginePath() {
    const config = vscode.workspace.getConfiguration(id);
    if (config.has(KEY_INI)) {
        return config.get<string>(KEY_ENGINE) || "";
    }
    return null;
}
export function setEnginePath(path: string) {
    // todo 校验目录是否有效
    const config = vscode.workspace.getConfiguration(id);
    return config.update(KEY_ENGINE, path);
}
export function getOutDirectory() {
    const config = vscode.workspace.getConfiguration(id);
    if (config.has(KEY_INI)) {
        return config.get<string>(KEY_OUT_DIRECTORY) || "";
    }
    return "";
}
export function setOutDirectory(path: string) {
    const config = vscode.workspace.getConfiguration(id);
    return config.update(KEY_OUT_DIRECTORY, path);
}