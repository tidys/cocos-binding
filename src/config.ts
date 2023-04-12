import * as vscode from "vscode";
const id = 'cocos-binding';
const KEY_INI = "ini_path";
const KEY_ENGINE = "engine_path";
const KEY_OUT_DIRECTORY = "out_directory";
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