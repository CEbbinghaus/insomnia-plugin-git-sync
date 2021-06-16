const fs = require('fs');

const WorkspaceRepo = require('./WorkspaceRepo.js');
const ScreenHelper = require('./ScreenHelper.js');



const verifyRepoConfig = async (repo, context) => {
  if (await repo.isConfigured()) return true;

  ScreenHelper.alertError(context, 'No Repository exists for this Workspace!');
  return false;
};

const ExportWorkspace = {
  label: 'Repo Sync - Export Workspace',
  icon: 'fa-download',
  action: async (context, models) => {
    const repo = new WorkspaceRepo(context);
    if (!await verifyRepoConfig(repo, context))
      return;

    const path = await repo.getPath();
    const ex = await context.data.export.insomnia({
      includePrivate: false,
      format: 'yaml',
      workspace: models.workspace,
    });

    fs.writeFileSync(path, ex);
    refreshActions(repo);
  },
};
const ImportWorkspace = {
  label: 'Repo Sync - Import Workspace',
  icon: 'fa-upload',
  action: async (context, models) => {
    const repo = new WorkspaceRepo(context);
    if (!await verifyRepoConfig(repo, context))
      return;

    const path = await repo.getPath();
    const imported = fs.readFileSync(path, 'utf8');

    await context.data.import.raw(imported);
    refreshActions(repo);
  },
};
const ConfigureRepo = {
  label: 'Repo Sync - Configure',
  icon: 'fa-cog',
  action: async (context, models) => {
    const repo = new WorkspaceRepo(context);

    const path = await repo.getPath();

    console.log({path});

    const repoPath = await ScreenHelper.askRepoPath(context, {
      currentPath: path,
      workspaceName: models.workspace.name,
    });

    await repo.setPath(repoPath);
    refreshActions(repo);
  },
};
const RemoveRepo = {
  label: 'Repo Sync - Remove',
  icon: 'fa-times',
  action: async (context, models) => {
    const repo = new WorkspaceRepo(context);
    await repo.removePath();
    refreshActions(repo);
  },
}

const actions = [{
  label: 'Repo Sync - Initialize',
  icon: 'fa-spinner',
  action: async (context, models) => {
    const repo = new WorkspaceRepo(context);
    refreshActions(repo);
  },
}];

async function refreshActions(repo){
  while(actions.length > 0)
    actions.shift();

  if(await repo.isConfigured()){
    actions.push(ExportWorkspace);
    actions.push(ImportWorkspace);
    actions.push(RemoveRepo);
  }
  else{
    actions.push(ConfigureRepo);
  }
  
}

module.exports.workspaceActions = actions;
