// 生成userconf.ini
import * as os from "os";
import { getEnginePath, getIniPath, getNDK } from "./config";
import { join } from "path";
import { existsSync, statSync, writeFileSync } from "fs";
import { fileTools } from "./filetools";
import *  as JsIni from 'js-ini';
export const userConfigFile = 'userconf.ini';

export function genBinding(): boolean {
  let ndk_root = getNDK();
  if (!ndk_root) {
    return false;
  }
  let platform = os.platform();
  let cur_platform = '??';
  if (platform === 'win32') {
    cur_platform = 'windows';
  }
  else if (platform === 'darwin') {
    cur_platform = 'drawin';
  }
  else if (platform === 'linux') { } else {
    cur_platform = 'linux';
  }

  let dirs: string[] = [];
  if (platform === "win32") {
    dirs.push(join(ndk_root, 'toolchains/llvm-3.4/prebuilt'));
    dirs.push(join(ndk_root, 'toolchains/llvm-3.3/prebuilt'));
  } else {
    dirs.push(join("toolchains/llvm-3.4/prebuilt", `${cur_platform}-x86`));
    dirs.push(join("toolchains/llvm-3.3/prebuilt", `${cur_platform}-x86`));
  }
  let x86_llvm_path = getExistPaths(dirs);

  let x64_llvm_path = getExistPaths([
    join(ndk_root, "toolchains/llvm-3.4/prebuilt", `${cur_platform}-x86_64`),
    join(ndk_root, "toolchains/llvm-3.3/prebuilt", `${cur_platform}-x86_64`),
    join(ndk_root, "toolchains/llvm-3.5/prebuilt", `${cur_platform}-x86_64`),
    join(ndk_root, "toolchains/llvm-3.6/prebuilt", `${cur_platform}-x86_64`),
    join(ndk_root, "toolchains/llvm/prebuilt", `${cur_platform}-x86_64`),
  ]);

  let llvm_path = '';
  if (existsSync(x86_llvm_path) && statSync(x86_llvm_path).isDirectory()) {
    llvm_path = x86_llvm_path;
  } else if (existsSync(x64_llvm_path) && statSync(x64_llvm_path).isDirectory()) {
    llvm_path = x64_llvm_path;
  } else {
    return false;
  }
  const project_root = getEnginePath();
  if (!project_root) {
    return false;
  }
  const cocos_root = project_root;
  const frameworks = join(cocos_root, '..');
  const cxx_generator_root = fileTools.getStaticPath();

  // save config to file;
  const iniObject: Record<string, any> = {
    "androidndkdir": ndk_root,
    "clangllvmdir": llvm_path,
    "cocosdir": cocos_root,
    "frameworks": frameworks,
    "cxxgeneratordir": cxx_generator_root,
    "extra_flags": "",
    "clang_lib_version": "lib",
    "gnu_libstdc_version": '4.8',
  };
  if (llvm_path.indexOf("3.3") !== -1) {
    iniObject['clang_version'] = "3.3";
  } else if (llvm_path.indexOf("3.4") !== -1) {
    iniObject['clang_version'] = "3.4";
  } else if (llvm_path.indexOf("3.5") !== -1) {
    iniObject['clang_version'] = "3.5";
  } else if (llvm_path.indexOf("3.6") !== -1) {
    iniObject['clang_version'] = "3.6";
  } else {
    iniObject['clang_version'] = "3.8";
    iniObject['clang_lib_version'] = "lib64";
    iniObject['gnu_libstdc_version'] = "4.9";
  }
  if (platform === 'win32') {
    // To fix parse error on windows, we must define __WCHAR_MAX__ and undefine __MINGW32__ .
    iniObject['extra_flags'] = '-D__WCHAR_MAX__=0x7fffffff -U__MINGW32__';
  }
  const iniData = JsIni.encode({ "DEFAULT": iniObject });
  const iniDir = getIniPath();
  if (!iniDir) {
    return false;
  }
  writeFileSync(join(iniDir, userConfigFile), iniData);
  return true;
  /**
   * 
    # set proper environment variables
    if 'linux' in platform or platform == 'darwin':
        os.putenv('LD_LIBRARY_PATH', '%s/libclang' % cxx_generator_root)
    if platform == 'win32':
        path_env = os.environ['PATH']
        os.putenv('PATH', r'%s;%s\libclang;%s\tools\win32;' %
                  (path_env, cxx_generator_root, cxx_generator_root))
   * 
   */
}

function getExistPaths(dirs: string[]) {
  for (let i = 0; i < dirs.length; i++) {
    const dir = dirs[i];
    if (existsSync(dir)) {
      return dir;
    }
  }
  return '';
}