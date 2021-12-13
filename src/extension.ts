
import * as vscode from 'vscode';
import * as humps from "humps";
/// import * as bTranslate  from "baidu-translate-api" ;
import {  baidu} from "arvin-trans";

let  activity = false;

const translatorFacntory = (world: string, activ: "en" | "zh" | null) => {
    if (!activ || !activity) return;

    const config = {
        fromLanguage: "en",
        targetLanguage:"zh-CN",
    };
    if (active === "zh") {
        config.fromLanguage = "en";
        config.targetLanguage = "zh-CN";
    }

    if (active === "en") {
        config.fromLanguage ="zh-CN";
        config.targetLanguage = "en";
    }
    return baidu.translate({text:world, from:config.fromLanguage, to:config.targetLanguage })
}

const ERROR_Map = {
    NETWORK_ERROR : "网络错误，可能是运行环境没有网络连接造成的",
    API_SERVER_ERROR : "翻译接口返回了错误的数据",
    UNSUPPORTED_LANG : "接口不支持的语种",
    NETWORK_TIMEOUT : "查询接口时超时了",
}


let active: "en" | "zh" | null = null;

const translator = () => vscode.languages.registerHoverProvider('*', {

    provideHover(doc: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
        if (vscode.window.activeTextEditor) {
            const word = doc.getText(vscode.window.activeTextEditor?.selection);
            if(word) {
                //const _world = humps.camelize(word);


                return translatorFacntory(word,active).then(res => {
                    const markdownStr = new vscode.MarkdownString("", true);
                    markdownStr.supportHtml = true;
                    markdownStr.supportThemeIcons = true;
                    markdownStr.appendMarkdown(`<h5 style="padding-right:10px">$(globe)    ${word}</h5>`);

                    if (active === "zh" && res.dict && res.dict.length ) {
                        res.dict.forEach((dict:string) => {
                            markdownStr.appendMarkdown(`<p style="padding-left:6px">${dict}</p>`);
                        })
                    }
                    ;
                    if (res.result && res.result.length) {
                        res.result.forEach( (r : string) => {
                            markdownStr.appendMarkdown(`<p style="padding-left:6px">${r}</p>`);
                        })
                    }

                    return new vscode.Hover(markdownStr);
                }).catch(error => {

                    if (error.code) {
                        return new vscode.Hover( new vscode.MarkdownString(ERROR_Map[error.cod]));
                    } else {
                        return new vscode.Hover("未知错误" + error);
                    }

                })
            }

        }

    }
});


// 插件激活时的入口
export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push( vscode.commands.registerCommand("extension.translatorToZh", () => {
        active = "zh";

    }));

    context.subscriptions.push( vscode.commands.registerCommand("extension.translatorToEn", () => {
        active = "en";
    }));

    context.subscriptions.push( vscode.commands.registerCommand("extension.translator", () => {
        activity = !activity;
        if (activity) {
            vscode.window.showInformationMessage("翻译已开启！！！", "EN", "CN").then(res => {
                if (res === "EN") active = "en";
                else  active = "zh";
            });
        } else {
            vscode.window.showWarningMessage("翻译已关闭！！！");

        }
    }));


    translator();
}

// 插件释放的时候触发
export function deactivate() {
    active = null;
    activity = false;
}