const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const type = require("@babel/types");
const core = require("@babel/core");

const themeStyle = {
    success: `background-color: #f0f9eb;border: 1px solid #c2e7b0;padding: 0px 5px;color: #67c23a;font-size: 14px;`,
    info: `background-color: #f4f4f5;border: 1px solid #d3d4d6;padding: 0px 5px;color: #909399;font-size: 14px;`,
    warning: `background-color: #fdf6ec;border: 1px solid #f5dab1;padding: 0px 5px;color: #e6a23c;font-size: 14px;`,
    danger: `background-color: #fef0f0;border: 1px solid #fbc4c4;padding: 0px 5px;color: #f56c6c;font-size: 14px;`
};

function prefixLogPlugin(options = {}) {
    return {
        name: 'vite-plugin-prefix-log',
        transform(source, id) {
            // 只处理 JavaScript 文件
            if (!id.endsWith('.js')) {
                return null;
            }

            const config = {
                type: themeStyle[options.type] || themeStyle.info,
                textWrap: options.textWrap || false,
                customStyle: options.customStyle || null,
            };

            let ast = parse(source, {
                sourceType: "module",
                plugins: ["dynamicImport"],
            });

            traverse(ast, {
                CallExpression(path) {
                    if (isConsoleLogNode(path.node)) {
                        const code = generate(path.node).code;
                        
                        let arg = null;
                        let styleArgument = null;
                        let customType = null;

                        if (path.node.arguments.length > 1 && path.node.arguments.at(-1).type === 'StringLiteral' && ['success', 'info', 'warning', 'danger'].includes(path.node.arguments.at(-1).value)) {
                            customType = path.node.arguments.at(-1).value;
                        }
                        if (customType) {
                            path.node.arguments.pop();
                            styleArgument = type.stringLiteral(`${themeStyle[customType]}`);
                            const lastIndex = code.lastIndexOf(',');
                            arg = removeQuotes(code.slice(12, lastIndex));
                        } else {
                            styleArgument = config.customStyle ? type.stringLiteral(`${config.customStyle}`) : type.stringLiteral(`${config.type}`);
                            arg = removeQuotes(code.slice(12, -1));
                        }
                        addPreTip(styleArgument, path.node.arguments);
                        const titleArgument = config.textWrap ? type.stringLiteral(`%c${arg}\n`) : type.stringLiteral(`%c${arg}`);
                        addPreTip(titleArgument, path.node.arguments);
                    }
                },
            });

            const { code } = core.transformFromAstSync(ast, source, {
                configFile: false,
            });

            return {
                code,
                map: null  // 如果需要 sourcemap，可以在这里生成
            };
        }
    };
}

function isConsoleLogNode(node) {
    return type.isMemberExpression(node.callee) &&
        type.isIdentifier(node.callee.object, { name: "console" }) &&
        type.isIdentifier(node.callee.property, { name: "log" });
}

function addPreTip(tipLiteral, argument) {
    argument.unshift(tipLiteral);
}

function removeQuotes(str) {
    return str.replace(/^['"]+|['"]+$/g, '');
}

module.exports =  prefixLogPlugin;
