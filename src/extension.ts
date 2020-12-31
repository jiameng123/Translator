
import * as vscode from 'vscode';
import * as humps from "humps";
import * as bTranslate  from "baidu-translate-api" ;

const translation = (word: string) => {
   const { translator : {  targetLanguage, detection, fromLanguage } } = vscode. workspace.getConfiguration() ;
   return  bTranslate(word, {from: fromLanguage, to: targetLanguage}) ;
  
};

let active = false;
// 插件激活时的入口
export function activate(context: vscode.ExtensionContext) {
    
   const translator = vscode.languages.registerHoverProvider('*', {
      
      provideHover(doc: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
       if(!active) {return;}

       const word = doc.getText(vscode.window.activeTextEditor?.selection);
       if(word) {
         const _world = humps.camelize(word);
        
         return translation(_world).then(res => {
             const content = new vscode.MarkdownString(`#### ${res.trans_result.dst}`);
             return new vscode.Hover(content);
         });
      } 
       
     }
   });

   let disposable = vscode.commands.registerCommand("extension.translator", () => {
       if(active) {
         active = false;
        
         vscode.window.showInformationMessage("关闭翻译");
       } else {
         active = true; 
         
         vscode.window.showInformationMessage("开启翻译");
       }
     
      
     
    });
    

   
    
   
    context.subscriptions.push(disposable);
  
  }
  
  // 插件释放的时候触发
  export function deactivate() {}