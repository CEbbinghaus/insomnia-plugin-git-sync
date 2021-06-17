class WorkspaceRepo {
	prefix = "git-sync:";
	workspaceName = "";
	context;

	get key() {
		return `${this.prefix}${this.workspaceName}`;
	}

	constructor(context, models) {
		this.context = context;
		this.workspaceName = models.workspace.name;
	}

	async getPath() {
		return await this.context.store.getItem(this.key);
	}

	async removePath() {
		return await this.context.store.removeItem(this.key);
	}

	async setPath(path) {
		return await this.context.store.setItem(this.key, path);
	}

	async isConfigured() {
		return await this.context.store.hasItem(this.key);
	}
}

module.exports = WorkspaceRepo;
