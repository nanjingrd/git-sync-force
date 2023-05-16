签入 node_modules 目录可能会导致问题。 作为替代方法，可以使用名为 @vercel/ncc 的工具将代码和模块编译到一个用于分发的文件中。

通过在终端中运行此命令来安装 vercel/ncc。 npm i -g @vercel/ncc
编译 index.js 文件。 ncc build index.js --license licenses.txt
你会看到一个包含代码和已编译模块的新 dist/index.js 文件。 你还将看到随附的 dist/licenses.txt 文件，其中包含所用 node_modules 的所有许可证。
更改 action.yml 文件中的 main 关键字以使用新的 dist/index.js 文件。 main: 'dist/index.js'
如果已签入 node_modules 目录，请将其删除。 rm -rf node_modules/*
从终端提交对 action.yml、dist/index.js 和 node_modules 文件的更新。