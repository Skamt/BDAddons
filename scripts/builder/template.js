const config = PLUGIN__CONFIG;

PLUGIN__BODY

const AddonManager = (() => {
	const API = new BdApi(config.info.name);

	const PluginTemplates = {
		missingZpl() {
			return () => () => ({
				stop() {},
				start() {
					BdApi.alert("Missing library", [`**ZeresPluginLibrary** is needed to run **${config.info.name}**.`,
						"Please download it from the officiel website",
						"https://betterdiscord.app/plugin/ZeresPluginLibrary"
					]);
				}
			})
		},
		brokenPlugin(missingModules) {
			return () => () => ({
				stop: () => {},
				start: () => {
					Modals.showBrokenAddonModal(missingModules, "Plugin is broken, Take a screenshot of this popup and show it to the dev.");
				}
			});
		}
	};

	const Modals = {
		AddStyles() {
			if (!document.querySelector('head > bd-head > bd-styles > #AddonManagerCSS'))
				BdApi.DOM.addStyle('AddonManagerCSS', `#modal-container {
	position: absolute;
	z-index: 3000;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	overflow: hidden;
	user-select: text;
	font-family: "gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
	
	--backdrop: #000;
	--modal: #57616f;
	--head: #25272a;
	--body: #313437;
	--note: #dbdee1;
	--module: #27292b;
	--error-message: #b5bac1;
	--footer: #27292c;
	--close-btn: #5865f2;
	--close-btn-hover:#4752c4;
	--close-btn-active:#3c45a5;
	--added:#2dc770;
	--improved:#949cf7;
	--fixed:#f23f42;
	--notice:#f0b132;
}

#modal-container .backdrop {
	background: var(--backdrop);
	position: absolute;
	z-index: -1;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	opacity: .85;
}

#modal-container .modal {
	display: inline-flex;
	flex-direction: column;
	color: white;
	overflow: hidden;
	border-radius: 8px;
	margin: auto;
	max-width: 600px;
	max-height: 70vh;
}

#modal-container .head {
	background: var(--head);
	padding: 20px;
}

#modal-container .head > h2 {
	font-size: 1.3rem;
	font-weight: bold;
}

#modal-container .body {
	background: var(--body);
	padding: 10px;
	display: flex;
	flex-direction: column;
	min-height: 0;
}

#modal-container .note {
	color: var(--note);
	font-size: 1rem;
	line-height: 20px;
}

#modal-container .bm {
	margin: 10px 0;
	font-weight: bold;
}

#modal-container .modules {
	margin: 10px 0;
	padding: 10px;
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	overflow: hidden auto;
}

#modal-container .modules::-webkit-scrollbar {
	width: 2px;
}

#modal-container .modules::-webkit-scrollbar-thumb {
	background-color: orange;
}

#modal-container .module {
	padding: 5px 8px;
	background: var(--module);
	border-radius: 3px;
	flex: 1 0 0;
	white-space: nowrap;
	text-transform: capitalize;
	text-align: center;
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

#modal-container .footer {
	background: var(--footer);
	padding: 10px;
	display: flex;
}

#modal-container button {
	margin-left: auto;
	border-radius: 3px;
	border: none;
	min-width: 96px;
	min-height: 38px;
	width: auto;
	color: #fff;
	background-color: var(--close-btn);
}

#modal-container button:hover {
	background-color: var(--close-btn-hover);
}

#modal-container button:active {
	background-color: var(--close-btn-active);
}

#modal-container.hide {
	display: none;
}

/* animations */
#modal-container.closing .backdrop {
	animation: hide-backdrop 400ms ease-in;
}

#modal-container .backdrop {
	animation: show-backdrop 300ms ease-out;
}

@keyframes show-backdrop {
	from {
		opacity: 0;
	}

	to {
		opacity: .85;
	}
}

@keyframes hide-backdrop {
	from {
		opacity: .85;
	}

	to {
		opacity: 0;
	}
}

#modal-container .modal {
	animation: show-modal 300ms ease-out;
}

#modal-container.closing .modal {
	animation: hide-modal 400ms ease-in;
}

@keyframes show-modal {
	from {
		transform: scale(0);
		opacity: 0;
	}

	to {
		opacity: .85;
		transform: scale(1);
	}
}

@keyframes hide-modal {
	from {
		opacity: .85;
		transform: scale(1);
	}

	to {
		transform: scale(0);
		opacity: 0;
	}
}

/* changelog */
#modal-container .changelog{
	padding:10px;
    overflow:auto;
}

#modal-container .changelog::-webkit-scrollbar {width: 2px;}

#modal-container .changelog::-webkit-scrollbar-thumb {
	background-color: orange;
}

#modal-container .changelog .title{
    text-transform: uppercase;
    display: flex;
    align-items: center;
    font-weight: 700;
    margin-top: 20px;
    color:var(--c);
}

#modal-container .changelog .title:after {
    content: "";
    height: 1px;
    flex: 1 1 auto;
    margin-left: 4px;
    opacity: .6;
    background:currentColor;
}

#modal-container .changelog ul{
	list-style: none;
	margin: 20px 0 8px 20px;
}

#modal-container .changelog ul > li{
    line-height: 20px;   
    margin-bottom: 8px;
    color: hsl(210,calc(var(--saturation-factor, 1)*9.3%),78.8%);
}`);
		},

		openModal(content) {
			const template = document.createElement("template");
			template.innerHTML = `<div id="modal-container">
									<div class="backdrop"></div>
									${content}
								</div>`;
			const modal = template.content.firstElementChild.cloneNode(true);
			modal.onclick = (e) => {
				if (e.target.classList.contains('close-btn') || e.target.classList.contains('backdrop')) {
					modal.classList.add("closing");
					setTimeout(() => { modal.remove(); }, 300);
				}
			};
			document.querySelector('bd-body').append(modal);
		},
		alert(content) {
			this.openModal(`<div class="modal">
				<div class="head">
					<h2>${config.info.name}</h2>
					<p class="version">version ${config.info.version}</p>
				</div>
				<div class="body">${content}</div>
				<div class="footer"><button class="close-btn">Close</button></div>
			</div>`);
		},
		showMissingModulesModal(missingModules, note) {
			this.alert(
				`<p class="note">${note}</p>
				<h3 class="bm">Missing Modules:</h3>
				<div class="modules">
					${missingModules.map(([moduleName, errorNote]) => `<div class="module">
					<h3 class="name">${moduleName}</h3>
					<p class="errormessage">${errorNote || "No description provided"}</p>
					</div>`).join('')}
				</div>`);
		},
		showBrokenAddonModal(missingModules, note) {
			this.alert(
				`<p class="note">${note}</p>
				<h3 class="bm">Missing Modules:</h3>
				<div class="modules">
					${missingModules.map(([moduleName]) => `<div class="module">
						<h3 class="name">${moduleName}</h3>
					</div>`).join('')}
				</div>`);
		},
		showChangelogModal() {
			if(!config.changelog || !Array.isArray(config.changelog)) return;
			
			const changelog = config.changelog?.map(({ title, type, items }) =>
				`<h3 style="--c:var(--${type});" class=" title">${title}</h3>
				<ul class="list">
					${items.map(item => `<li>${item}</li>`).join('')}
				</ul>`).join('')
			this.alert(`<div class="changelog">${changelog}</div>`);
		},
		Init() {
			this.AddStyles();
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
					errorPopupCount: 0,
					brokenModules: []
				});
			}
		}
	};

	const Addon = {
		handleBrokenAddon(missingModules) {
			this.getPlugin = PluginTemplates.brokenPlugin(missingModules);
		},
		handleMissingModules(missingModules) {
			const current = Data.get();

			const newBrokenModules = missingModules.some(([newItem]) => !current.brokenModules.includes(newItem));
			const isUpdated = current.version != config.info.version;
			const isPopupLimitReached = current.errorPopupCount === 3;
			if (isUpdated || !isPopupLimitReached || newBrokenModules) {
				Modals.showMissingModulesModal(missingModules, "Detected some Missing modules, certain aspects of the plugin may not work properly.");

				Data.save({
					...current,
					version: current.version,
					errorPopupCount: (current.errorPopupCount + 1) % 4,
					brokenModules: missingModules.map(([moduleName]) => moduleName)
				});
			}
		},
		checkModules(modules) {
			return Object.entries(modules).reduce((acc, [moduleName, { module, fallback, errorNote, isBreakable, withKey }]) => {
				if ((withKey && !module.module) || !module) {
					if (isBreakable) acc[0] = true;
					acc[2].push([moduleName, errorNote]);
					if (fallback) acc[1][moduleName] = fallback;
				} else
					acc[1][moduleName] = module;
				return acc;
			}, [false, {},
				[]
			]);
		},
		showChangelog() {
			const { version, changelog = false } = Data.get();
			if (version != config.info.version || !changelog) {
				Modals.showChangelogModal();
				Data.save({
					version: config.info.version,
					changelog: true,
					errorPopupCount: 0,
					brokenModules: []
				});
			}
		},
		Init() {
			const start = (ParentPlugin) => {
				const { Modules, Plugin } = main(API);
				const [isAddonBroken, safeModules, missingModules] = this.checkModules(Modules);
				if (isAddonBroken) {
					this.handleBrokenAddon(missingModules);
				} else {
					if (missingModules.length > 0)
						this.handleMissingModules(missingModules);
					this.getPlugin = () => {
						// show changelog only when plugin is working/half working.
						this.showChangelog();
						return Plugin(safeModules, ParentPlugin);
					};
				}
			};

			if (config.zpl)
				if (!global.ZeresPluginLibrary)
					this.getPlugin = PluginTemplates.missingZpl();
				else
					start(global.ZeresPluginLibrary.buildPlugin(config)[0]);
			else
				start();
		}
	};

	return {
		Start() {
			Modals.Init();
			Data.Init();
			Addon.Init();

			return Addon.getPlugin();
		}
	}
})();

module.exports = AddonManager.Start();