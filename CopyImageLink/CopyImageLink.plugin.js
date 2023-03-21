/**
 * @name CopyImageLink
 * @description Adds (Copy Link) button next to (Open Original) under images
 * @version 1.1.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/CopyImageLink
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/CopyImageLink/CopyImageLink.plugin.js
 */

const config = {
	info: {
		name: "CopyImageLink",
		version: "1.1.0",
		description: "Adds (Copy Link) button next to (Open Original) under images",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/CopyImageLink/CopyImageLink.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/CopyImageLink",
		authors: [{
			name: "Skamt"
		}]
	}
};

function main(API) {
	const { Webpack: { Filters, getModule } } = API;

	// https://discord.com/channels/86004744966914048/196782758045941760/1062604534922367107
	function getModuleAndKey(filter) {
		let module;
		const target = getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true });
		module = module?.exports;
		if (!module) return { module: undefined };
		const key = Object.keys(module).find(k => module[k] === target);
		if (!key) return undefined;
		return { module, key };
	}

	return {
		Modules: {
			ImageModal: {
				module: getModuleAndKey(m => {
					if (!m?.toString || typeof(m?.toString) !== "function") return;
					const strs = ["original", "maxHeight", "maxWidth", "noreferrer noopener"];
					const funcStr = m?.toString();
					for (const s of strs)
						if (!funcStr.includes(s)) return false;
					return true;
				}),
				isBreakable: true,
				withKey: true
			}
		},
		Plugin(Modules) {
			const {
				UI,
				DOM,
				React,
				Patcher
			} = API;

			// Utilities
			const Utils = {
				showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
				copy: (data) => {
					DiscordNative.clipboard.copy(data);
					Utils.showToast("Link Copied!", "success");
				},
				/* Stolen from Zlib until it gets added to BdApi */
				getNestedProp: (obj, path) => path.split(".").reduce(function(ob, prop) {
					return ob && ob[prop];
				}, obj)
			};

			// Components
			const CopyButtonComponent = ({ href }) => {
				return React.createElement(React.Fragment, null,
					React.createElement("span", { className: "copyBtnSpan" }, "|"),
					React.createElement("a", {
						className: "copyBtn",
						onClick: (_) => Utils.copy(href)
					}, "Copy link"));

			};

			// Styles
			function addStyles() {
				DOM.addStyle(`.copyBtn {
	left: 115px;
	white-space: nowrap;
    position: absolute;
    top: 100%;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    line-height: 30px;
    transition: opacity .15s ease;
    opacity: .5;
}
.copyBtn:hover{
	opacity: 1;
    text-decoration: underline;
}

.copyBtnSpan {
	left: 105px;
	position: absolute;
	top: 100%;
	font-weight: 500;
	color: hsl(0, calc(var(--saturation-factor, 1) * 0%), 100%) !important;
	line-height: 30px;
	opacity: 0.5;
}`);
			}

			return class CopyImageLink {
				start() {
					try {
						addStyles();
						Patcher.after(Modules.ImageModal.module, Modules.ImageModal.key, (_, __, returnValue) => {
							const children = Utils.getNestedProp(returnValue, "props.children");
							const { href } = Utils.getNestedProp(returnValue, "props.children.2.props");
							children.push(React.createElement(CopyButtonComponent, { href }));
						});
					} catch (e) {
						console.error(e);
					}
				}

				stop() {
					DOM.removeStyle();
					Patcher.unpatchAll();
				}
			}
		}
	}
}

const AddonManager = (() => {
	const API = new BdApi(config.info.name);

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
    --modal: #313437;
    --head: #25272a;
    --note: #dbdee1;
    --module: #27292b;
    --error-message: #b5bac1;
    --footer: #27292c;
    --close-btn: #5865f2;
    --close-btn-hover: #4752c4;
    --close-btn-active: #3c45a5;
    --added: #2dc770;
    --improved: #949cf7;
    --fixed: #f23f42;
    --notice: #f0b132;
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
    background: var(--modal);
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
    padding: 12px;
}

#modal-container .head > .title {
    font-size: 1.3rem;
    font-weight: bold;
}

#modal-container .head > .version {
    margin: 2px 0 0 0;
    font-size: 12px;
}

#modal-container .body {
    background: var(--body);
    padding: 10px;
    overflow: hidden auto;
    margin-right:1px;
}

#modal-container .body::-webkit-scrollbar {
    width: 5px;
}

#modal-container .body::-webkit-scrollbar-thumb {
    background-color: #171819;
    border-radius:25px;
}

#modal-container .note {
    color: var(--note);
    font-size: 1rem;
    margin: 8px 0;
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
#modal-container .backdrop {
    animation: show-backdrop 300ms ease-out;
}

#modal-container.closing .backdrop {
    animation: hide-backdrop 100ms ease-in;
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
    animation: hide-modal 100ms ease-in;
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
		openModal(content) {
			this.AddStyles();
			const template = document.createElement("template");
			template.innerHTML = `<div id="modal-container">
									<div class="backdrop"></div>
									${content}
								</div>`;
			const modal = template.content.firstElementChild.cloneNode(true);
			modal.onclick = (e) => {
				if (e.target.classList.contains('close-btn') || e.target.classList.contains('backdrop')) {
					modal.classList.add("closing");
					setTimeout(() => { modal.remove(); }, 100);
				}
			};
			document.querySelector('bd-body').append(modal);
		},
		alert(content) {
			this.openModal(`<div class="modal">
				<div class="head">
					<h2 class="title">${config.info.name}</h2>
					<p class="version">version ${config.info.version}</p>
				</div>
				<div class="body">${content}</div>
				<div class="footer"><button class="close-btn">Close</button></div>
			</div>`);
		},
		showMissingModulesModal(missingModules) {
			this.alert(
				`<p class="note">Detected some Missing modules, certain aspects of the plugin may not work properly.</p>
				<h3 class="bm">Missing Modules:</h3>
				<div class="modules">
					${missingModules.map(([moduleName, errorNote]) => `<div class="module">
					<h3 class="name">${moduleName}</h3>
					<p class="errormessage">${errorNote || "No description provided"}</p>
					</div>`).join('')}
				</div>`);
		},
		showBrokenAddonModal(missingModules) {
			this.alert(
				`<p class="note">Plugin is broken, Take a screenshot of this popup and show it to the dev.</p>
				<h3 class="bm">Missing Modules:</h3>
				<div class="modules">
					${missingModules.map(([moduleName]) => `<div class="module">
						<h3 class="name">${moduleName}</h3>
					</div>`).join('')}
				</div>`);
		},
		showChangelogModal() {
			if (!config.changelog || !Array.isArray(config.changelog)) return;

			const changelog = config.changelog?.map(({ title, type, items }) =>
				`<h3 style="--c:var(--${type});" class="title">${title}</h3>
				<ul class="list">
					${items.map(item => `<li>${item}</li>`).join('')}
				</ul>`).join('')
			this.alert(`<div class="changelog">${changelog}</div>`);
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
			};;
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
						BdApi.alert("Missing library", [`**ZeresPluginLibrary** is needed to run **${config.info.name}**.`,
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
