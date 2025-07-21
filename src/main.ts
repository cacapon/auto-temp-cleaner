import { App, normalizePath, Notice, Plugin, PluginSettingTab, Setting, TFile, TFolder } from 'obsidian';

interface AutoDeleteSettings {
	targetFolder: string;
	ttlMinites: number;
	checkInterval: number;
}

const DEFAULT_SETTINGS: AutoDeleteSettings = {
	targetFolder: "_",
	ttlMinites: 0,
	checkInterval: 60,
}

export default class AutoTmpFilesRemover extends Plugin {
	settings: AutoDeleteSettings;
	intervalId: number | null = null;

	async onload() {
		await this.loadSettings();
		this.startInterval();
		this.addSettingTab(new AutoTmpFilesRemoverSettingTab(this.app, this));
	}

	onunload() {

	}

	startInterval() {
		this.runCleanUp();
		const intervalMs = toMilliSec(this.settings.checkInterval);
		this.intervalId = window.setInterval(() => this.runCleanUp(), intervalMs);
	}

	async runCleanUp() {
		if (this.settings.checkInterval === 0) return ;
		const folderPath = normalizePath(this.settings.targetFolder);
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!(folder instanceof TFolder)) return;

		const now = Date.now();
		const ttlMillis = toMilliSec(this.settings.ttlMinites);
		const delFiles: string[] = [];
		for (const file of folder.children) {
			if (file instanceof TFile && file.extension === "md") {
				const ctime = file.stat.ctime;
				if (now - ctime > ttlMillis) {
					await this.app.vault.delete(file);
					delFiles.push(file.path);
				}
			}
		}
		if (delFiles.length > 0) {
			new Notice(`Deleted files: \n${delFiles.join("\n")}`);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class AutoTmpFilesRemoverSettingTab extends PluginSettingTab {
	plugin: AutoTmpFilesRemover;

	constructor(app: App, plugin: AutoTmpFilesRemover) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h2", { text: "Auto TmpFiles Remover"});

		new Setting(containerEl)
			.setName("対象フォルダ")
			.setDesc("削除対象とするフォルダの相対パス")
			.addText((text) =>
				text
					.setPlaceholder("tmp")
					.setValue(this.plugin.settings.targetFolder)
					.onChange(async (value) => {
						this.plugin.settings.targetFolder = value.trim();
						await this.plugin.saveSettings();}
					)
			);
		
		new Setting(containerEl)
			.setName("TTL (分)")
			.setDesc("ファイル作成から何分後に削除するか")
			.addText((text) =>
				{
					text.inputEl.type = "number";
					text.inputEl.min = "1";
					text.inputEl.max = "10080";
					text
						.setPlaceholder("1")
						.setValue(String(this.plugin.settings.checkInterval))
						.onChange(async (value) => {
							const numVal = parseInt(value);
							if (!isNaN(numVal) && numVal >= 1 && numVal <= 10080){ 
								this.plugin.settings.ttlMinites = numVal;
								await this.plugin.saveSettings();
							}
						});
				}
			);

		new Setting(containerEl)
			.setName("チェック間隔(分)")
			.setDesc("何分毎に削除処理を実行するか (0-1440) ※0の場合は実行しません")
			.addText((text) =>
				{
					text.inputEl.type = "number";
					text.inputEl.min = "0";
					text.inputEl.max = "1440";
					text
						.setPlaceholder("0")
						.setValue(String(this.plugin.settings.checkInterval))
						.onChange(async (value) => {
							const numVal = parseInt(value);
							if (!isNaN(numVal) && numVal >= 0 && numVal <= 1440){ 
								this.plugin.settings.checkInterval = numVal;
								await this.plugin.saveSettings();
								this.plugin.onunload();
								this.plugin.startInterval();
							}
						});
				}
			);
	}
}

function toMilliSec(minitues: number): number {
	return minitues * 60000;
}
