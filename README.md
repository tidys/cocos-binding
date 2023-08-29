# 为什么会有这个插件

需要频繁的配置python环境，对python 版本和lib的版本都有要求，每次都需要看文档配置，而且电脑还要配置环境变量，麻烦的一批


生成lua-binding的python逻辑稳定后，其实我们不需要关心python的具体逻辑，只要调用生成我们想要的lua——binding代码就行了，而python可以将脚本打包为exe，就刚好符合我们的需求，这样就不需要麻烦的传参了


## 使用前的配置准备

config命令会自动带你完善需要的配置，依次会引导进行以下配置
- 设置engine目录，有效的engine目录为frameworks/cocos2d-x，该目录下需要有cocos、extensions、tools目录
- 设置ini所在的目录
- 设置c++ binding代码输出目录
- 设置Android NDK目录
- 自动生成`userconf.ini`配置

如果一切顺利，就会提示`配置成功`，如果出现异常，可以再次执行config命令进行完整的配置
## 生成lua-binding代码
输入`bind`命令，需要从list里面选择一个ini，然后就会生成这个ini配置对应的lua-binding代码

## 快速打开ini配置
输入`openIni`命令，会从list里面选择一个ini，快速打开这个ini配置

## 生成python的可执行文件

vscode配置了task，运行`gen python exe`，会自动将`generator.py`打包为`generator-bin.exe`文件，环境使用到了conda，需要预先安装conda。