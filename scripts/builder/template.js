const config = PLUGIN__CONFIG;

PLUGIN__BODY

const AddonManager = (() => {
	const API = new BdApi(config.info.name);
	const React = API.React;
	const Modals = {
		AddStyles() {
			if (!document.querySelector('head > bd-head > bd-styles > #AddonManagerCSS'))
				API.DOM.addStyle('AddonManagerCSS', `
#modal-container {
	font-family: "gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
	--module: #27292b;
	--error-message: #b5bac1;
	--added: #2dc770;
	--improved: #949cf7;
	--fixed: #f23f42;
	--notice: #f0b132;
	color:white;
}

#modal-container .note {
    font-size: 1rem;
    margin: 8px 0;
}

#modal-container .bm {
    margin: 10px 0;
    font-weight: bold;
}

#modal-container .module {
    padding: 5px 8px;
    background: var(--module);
    border-radius: 3px;
	margin-bottom: 10px;
}

#modal-container .name {
    display: block;
    line-height: 24px;
    font-size: 16px;
    font-weight: 500;
}

#modal-container .errormessage {
    margin: 2px 0;
    font-size: 13px;
    color: var(--error-message);
}

/* changelog */
#modal-container .changelog {
    padding: 10px;
    max-width: 450px;
}

#modal-container .changelog .title {
    text-transform: uppercase;
    display: flex;
    align-items: center;
    font-weight: 700;
    margin-top: 20px;
	color: var(--c);
}

#modal-container .changelog .title:after {
    content: "";
    height: 1px;
    flex: 1 1 auto;
    margin-left: 8px;
    opacity: .6;
    background: currentColor;
}

#modal-container .changelog ul {
    list-style: none;
    margin: 20px 0 8px 20px;
}

#modal-container .changelog ul > li {
    position:relative;
    line-height: 20px;
    margin-bottom: 8px;
    color: #c4c9ce;
}

#modal-container .changelog ul > li:before {
    content: "";
    position: absolute;
    background:currentColor;
    top: 10px;
    left: -15px;
    width: 6px;
    height: 6px;
    margin-top: -4px;
    margin-left: -3px;
    border-radius: 50%;
    opacity: .5;
}`);
		},
		alert(content) {
			this.AddStyles();
			content = React.createElement('div', { id: "modal-container" }, content);
			BdApi.UI.alert(config.info.name, content);
		},

		alertModules(modules, note) {
			this.AddStyles();
			const content = [
				React.createElement('p', { className: "note" }, note),
				React.createElement('h3', { className: "bm" }, "Missing Modules:"),
				React.createElement('div', { className: "modules" }, modules.map(([moduleName, errorNote]) =>
					React.createElement('div', { className: "module" }, [
						React.createElement('h3', { className: "name" }, moduleName),
						errorNote && React.createElement('p', { className: "errormessage" }, errorNote),
					]),
				))
			];
			API.UI.alert(config.info.name, React.createElement('div', { id: "modal-container" }, content));
		},
		showMissingModulesModal(missingModules) {
			this.alertModules(missingModules, "Detected some Missing modules, certain aspects of the plugin may not work properly.");
		},
		showBrokenAddonModal(missingModules) {
			this.alertModules(missingModules, "Plugin is broken, Take a screenshot of this popup and show it to the dev.");
		},
		showChangelogModal() {
			if (!config.changelog || !Array.isArray(config.changelog)) return;
			const changelog = config.changelog?.map(({ title, type, items }) => [
				React.createElement('h3', { style: { "--c": `var(--${type})` }, className: "title" }, title),
				React.createElement('ul', { className: "list" },
					items.map(item => React.createElement('li', null, item))
				)
			]);
			this.alert(React.createElement('div', { className: "changelog" }, changelog));
		}
	};

	const Data = {
		get() {
			return this.data;
		},
		save(data) {
			this.data = data;
			API.Data.save('metadata', data);
		},
		Init() {
			this.data = API.Data.load('metadata');
			if (!this.data) {
				this.save({
					version: config.info.version,
					changelog: false,
				});
			}
		}
	};

	const Addon = {
		showChangelog() {
			const { version, changelog = false } = Data.get();
			if (version != config.info.version || !changelog) {
				Modals.showChangelogModal();
				Data.save({
					version: config.info.version,
					changelog: true
				});
			}
		},
		handleBrokenAddon(missingModules) {
			this.getPlugin = () => class BrokenAddon {
				stop() {}
				start() {
					Modals.showBrokenAddonModal(missingModules);
				}
			};
		},
		handleMissingModules(missingModules) {
			Modals.showMissingModulesModal(missingModules);
		},
		checkModules(modules) {
			return Object.entries(modules).reduce((acc, [moduleName, { module, fallback, errorNote, isBreakable, withKey }]) => {
				if ((withKey && !module.module) || !module) {
					if (isBreakable) acc.isAddonBroken = true;
					acc.missingModules.push([moduleName, errorNote]);
					if (fallback) acc.safeModules[moduleName] = fallback;
				} else
					acc.safeModules[moduleName] = module;
				return acc;
			}, { isAddonBroken: false, safeModules: {}, missingModules: [] });
		},
		start(ParentPlugin) {
			const { Modules, Plugin } = main(API);
			const { isAddonBroken, safeModules, missingModules } = this.checkModules(Modules);
			if (isAddonBroken) {
				this.handleBrokenAddon(missingModules);
			} else {
				if (missingModules.length > 0)
					this.handleMissingModules(missingModules);
				this.getPlugin = () => {
					if (!config.zpl) this.showChangelog();
					return Plugin(safeModules, ParentPlugin);
				};
			}
		},
		Init() {
			if (!config.zpl) return this.start();

			if (!global.ZeresPluginLibrary) {
				this.getPlugin = () => class BrokenAddon {
					stop() {}
					start() {
						API.alert("Missing library", [`**ZeresPluginLibrary** is needed to run **${config.info.name}**.`,
							"Please download it from the officiel website",
							"https://betterdiscord.app/plugin/ZeresPluginLibrary"
						]);
					}
				};
			} else
				this.start(global.ZeresPluginLibrary.buildPlugin(config)[0]);

		}
	};

	return {
		Start() {
			Data.Init();
			Addon.Init();

			return Addon.getPlugin();
		}
	}
})();

module.exports = AddonManager.Start();