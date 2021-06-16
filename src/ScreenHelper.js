const pathTool = require('path');

class ScreenHelper {
  static async alertError(context, message) {
    return await context.app.alert('Error!', message);
  }

  static async askRepoPath(context, {currentPath, workspaceName}) {
    if(currentPath == "null")
      currentPath = null;

    if(currentPath != null){
      
      const parsed = pathTool.parse(currentPath);
      await context.app.alert(`Workspace already has a Repository!`, `Location: "${currentPath}.\nAre you sure you want to Overwrite it?"`);
    }

    const newPath =  await context.app.showSaveDialog({defaultPath: currentPath || ""});

    if(currentPath != null && newPath == null)
    {
      const res = await context.app.prompt(`Are you sure you want to delete the Workspace Repository?`, 
      {
        label: `Enter ${workspaceName} to confirm.`
      }).catch(() => undefined);

      if(res == workspaceName)
        return null;
      
      return currentPath;

    }
    return newPath;
  }
}

module.exports = ScreenHelper;
