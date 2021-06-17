const fs = require("fs");

const WorkspaceRepo = require("./WorkspaceRepo.js");

const verifyRepoConfig = async (repo, context) => {
	if (await repo.isConfigured()) 
		return true;
	

	await context.app.alert("Error!", "No Repository exists for this Workspace!");
	return false;
};

const ExportWorkspace = {
	label: "Git Sync - Export Workspace",
	icon: "fa-download",
	action: async (context, models) => {
		const repo = new WorkspaceRepo(context, models);
		if (!(await verifyRepoConfig(repo, context))) 
			return;
		

		const path = await repo.getPath();
		const ex = await context.data.export.insomnia({includePrivate: false, format: "yaml", workspace: models.workspace});

		fs.writeFileSync(path, ex);
		refreshActions(repo);
	}
};
const ImportWorkspace = {
	label: "Git Sync - Import Workspace",
	icon: "fa-upload",
	action: async (context, models) => {
		const repo = new WorkspaceRepo(context, models);
		if (!(await verifyRepoConfig(repo, context))) 
			return;
		

		const path = await repo.getPath();
		const imported = fs.readFileSync(path, "utf8");

		await context.data.import.raw(imported);
		refreshActions(repo);
	}
};
const ConfigureRepo = {
	label: "Git Sync - Configure",
	icon: "fa-plus",
	action: async (context, models) => {
		const repo = new WorkspaceRepo(context, models);
		const path = await context.app.showSaveDialog({
			defaultPath: (await repo.getPath()) || ""
		});

		await repo.setPath(path);

		refreshActions(repo);
	}
};
const RemoveRepo = {
	label: "Git Sync - Remove",
	icon: "fa-times",
	action: async (context, models) => {
		const repo = new WorkspaceRepo(context, models);
		await repo.removePath();
		refreshActions(repo);
	}
};

const actions = [{
	label: "Git Sync - Initialize",
	icon: "fa-spinner",
	action: async (context, models) => {
		const repo = new WorkspaceRepo(context, models);
		refreshActions(repo);
	}
}];

async function refreshActions(repo) {
	while (actions.length > 0) 
		actions.shift();
	

	if (await repo.isConfigured()) {
		actions.push(ExportWorkspace);
		actions.push(ImportWorkspace);
		actions.push(RemoveRepo);
	} else {
		actions.push(ConfigureRepo);
	}
}

module.exports.workspaceActions = actions;
