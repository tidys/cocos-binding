# 为什么会有这个插件

需要频繁的配置python环境，对python 版本和lib的版本都有要求，每次都需要看文档配置，而且电脑还要配置环境变量，麻烦的一批


生成lua-binding的python逻辑稳定后，其实我们不需要关心python的具体逻辑，只要调用生成我们想要的lua——binding代码就行了，而python可以将脚本打包为exe，就刚好符合我们的需求，这样就不需要麻烦的传参了


## 使用前的配置准备

1. setIniPath:设置ini配置文件目录
2. setOutDir:设置输出目录
3. setEnginePath: 当设置engine目录是，会自动推测配置，有效的engine目录为frameworks/cocos2d-x，该目录下需要有cocos、extensions、tools目录

## 生成lua-binding代码
输入bind命令，需要从list里面选择一个ini，然后就会生成这个ini配置对应的lua-binding代码

## 快速打开ini配置
输入openIni命令，会从list里面选择一个ini，快速打开这个ini配置

## 生成python的可执行文件

vscode配置了task，运行`gen python exe`，会自动进行打包python的exe文件，环境使用到了conda，需要预先安装conda。