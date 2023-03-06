/**
 * @name CustomNicknames
 * @description Allows you to add custom nicknames to users locally
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/CustomNicknames
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/CustomNicknames/CustomNicknames.plugin.js
 */
const config = {
	info: {
		name: "CustomNicknames",
		version: "1.0.0",
		description: "Allows you to add custom nicknames to users locally",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/CustomNicknames/CustomNicknames.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/CustomNicknames",
		authors: [{
			name: "Skamt"
		}]
	}
};

function getPlugin() {
	const [ParentPlugin, Api] = global.ZeresPluginLibrary.buildPlugin(config);
	const { Modules, Plugin } = ((Api) => {
		const { Webpack: { Filters, getModule } } = BdApi;
		return {
			Modules: {
				MessageHeader: { module: getModule((m) => m.Z?.toString().includes('userOverride') && m.Z?.toString().includes('withMentionPrefix')), isBreakable: true },
				UserStore: { module: getModule(Filters.byProps('getCurrentUser', 'getUser')) },
				openModal: { module: getModule(Filters.byStrings('onCloseCallback', 'Layer'), { searchExports: true }) },
				ModalRoot: { module: getModule(Filters.byStrings('onAnimationEnd'), { searchExports: true }) },
				Text: { module: getModule(Filters.byStrings('data-text-variant'), { searchExports: true }) },
				Label: { module: getModule(Filters.byStrings('LEGEND', 'LABEL', 'h5'), { searchExports: true }) },
				...(() => {
					let exp = undefined;
					getModule((m, e) => (m.toString().includes("onAnimationEnd") ? true && (exp = e.exports) : undefined), { searchExports: true });
					if (!exp) return { Modals: { module: undefined } };
					const funcs = Object.values(exp) || [];
					const ModalHeader = funcs.find(Filters.byStrings("headerIdIsManaged", "headerId", "separator"));
					const ModalBody = funcs.find(Filters.byStrings("scrollerRef", "content", "children"));
					const ModalFooter = funcs.find(Filters.byStrings("footerSeparator"));
					return {
						ModalHeader: { module: ModalHeader },
						ModalBody: { module: ModalBody },
						ModalFooter: { module: ModalFooter }
					};
				})(),
				...(() => {
					const { ButtonData, Textbox, TextElement } = Api.DiscordModules;
					return {
						ButtonData: { module: ButtonData },
						Textbox: { module: Textbox },
						TextElement: { module: TextElement }
					};
				})()
			},
			Plugin(ParentPlugin, Modules) {
				const {
					UI,
					Data,
					DOM,
					React,
					React: { useState, useEffect },
					Patcher,
					ContextMenu
				} = new BdApi(config.info.name);

				// Utilities
				const Utils = {
					showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type })
				};

				// Components
				const ErrorBoundary = class ErrorBoundary extends React.Component {
					state = { hasError: false, error: null, info: null };
					className = `EB-${this.props.plugin}-${this.props.id}`;

					componentDidCatch(error, info) {
						this.setState({ error, info, hasError: true });
						const errorMessage = `\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
						console.error(`%c[${this.props.plugin}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
					}

					onClick() {
						this.props?.closeModal?.();
						BdApi.alert(
							this.props.plugin,
							React.createElement("p", { style: { fontWeight: "bold", color: "#e0e1e5" } }, "An error has occured while rendering ",
								React.createElement("span", { style: { fontWeight: "bold", color: "orange" } }, this.props.id)));

					}

					render() {
						if (this.state.hasError) {
							if (this.props.fallback) {
								this.props.fallback.props.className = this.className;
								this.props.fallback.props.onClick = () => this.onClick();
								return this.props.fallback;
							}
							return React.createElement("div", {
								onClick: () => this.onClick(),
								className: this.className,
								children: "An error has occured, Click for more info."
							});

						}
						return this.props.children;
					}
				};
				const AddUserNicknameComponent = ({ props, user }) => {
					const [value, setValue] = useState(Data.load(user.id) || "");

					useEffect(() => {
						const keyupHandler = (e) => e.key === "Enter" && Save();
						document.addEventListener("keyup", keyupHandler);
						return () => document.removeEventListener("keyup", keyupHandler);
					}, []);
					const Save = () => {
						try {
							Data.save(user.id, value);
							props.onClose();
							Utils.showToast(`Nickname ${value} for ${user.username} Has been saved.`, "success");
						} catch (e) {
							console.error(e);
							props.onClose();
							Utils.showToast(`Error occured while saving nickname, Check the console for more info.`, "danger");
							require('electron').ipcRenderer.send('bd-toggle-devtools');
						}
					};

					const Clear = () => setValue("");

					return (
						React.createElement(Modules.ModalRoot, { ...props },
							React.createElement(Modules.ModalHeader, { separator: false },
								React.createElement(Modules.Text, {
									children: "Add User Nickname",
									variant: "heading-lg/semibold"
								})),

							React.createElement(Modules.ModalBody, null,
								React.createElement(Modules.Text, {
									children: "Find a friend faster with a personal nickname. It will only be visible to you in your direct messages.",
									className: "description-2pRfjZ",
									variant: "text-md/normal"
								}),

								React.createElement(Modules.Label, { children: "User Nickname" }),
								React.createElement(Modules.Textbox, {
									...
									Modules.Textbox.defaultProps,
									className: "input-2i7ay7",
									autoFocus: true,
									placeholder: user.username,
									onChange: setValue,
									value: value
								}),

								React.createElement(Modules.ButtonData, {
									children: "Reset user nickname",
									className: "reset-Gp82ub",
									size: "",
									onClick: Clear,
									color: Modules.ButtonData.Colors.LINK,
									look: Modules.ButtonData.Looks.LINK
								})),

							React.createElement(Modules.ModalFooter, null,
								React.createElement(Modules.ButtonData, {
									children: "Save",
									onClick: Save
								}),

								React.createElement(Modules.ButtonData, {
									children: "Cancel",
									onClick: props.onClose,
									color: Modules.ButtonData.Colors.PRIMARY,
									look: Modules.ButtonData.Looks.LINK
								}))));

				};

				// Styles
				const css = `.nick {
	line-height: 1.375rem;
	color: #fff;
	vertical-align: baseline;
	display: inline-block;
	cursor: default;
	pointer-events: none;
	font-weight: 500;
	margin: 0 0rem 0 0.5rem;
}

[class^="repliedMessage"] .nick {
	display: none;
}

.EB-CustomNicknames-AddUserNicknameComponent {
	color:white; 
	background:#2e2e2e; 
	padding:15px; 
	border-radius:8px; 
	pointer-events:all; 
	cursor:pointer; 
	position:fixed; 
	top:50%; 
	left:50%; 
	transform:translate(-50%,-50%); 
	z-index:9999; 
}`;

				return class CustomNicknames extends ParentPlugin {

					constructor() {
						super();
					}

					onStart() {
						DOM.addStyle(css);
						this.patches = [
							Patcher.after(Modules.MessageHeader, "Z", (_, [{ message }], ret) => {
								const nick = Data.load(message.author.id);
								if (nick) ret.props.children.splice(3, 0, React.createElement("span", { className: "nick" }, nick));
							}),
							ContextMenu.patch("user-context", (retVal, { user }) => {
								if (user.id !== Modules.UserStore.getCurrentUser().id)
									retVal.props.children.unshift(
										ContextMenu.buildItem({
											type: "button",
											label: "Add user nickname",
											action: () => Modules.openModal(props => React.createElement(ErrorBoundary, {
												id: "AddUserNicknameComponent",
												plugin: config.info.name,
												closeModal: props.onClose
											}, React.createElement(AddUserNicknameComponent, { props, user })))
										})
									);
							})
						];
					}

					onStop() {
						DOM.removeStyle();
						this.patches?.forEach?.(p => p());
						this.patches = null;
					}

					getSettingsPanel() {
						return this.buildSettingsPanel().getElement();
					}
				}
			}
		}
	})(Api);
	return [ParentPlugin, Plugin, Modules]
}

function pluginErrorAlert(content) {
	BdApi.alert(config.info.name, content);
}

function getErrorPlugin(message) {
	return () => ({
		stop() {},
		start() {
			pluginErrorAlert(message);
		}
	})
}

function checkModules(Modules) {
	return Object.entries(Modules).reduce((acc, [moduleName, { module, fallback, isBreakable, withKey }]) => {
		if ((withKey && !module.module) || !module) {
			if (isBreakable) acc[0] = true;
			acc[2].push(moduleName);
			if (fallback) acc[1][moduleName] = fallback;
		} else
			acc[1][moduleName] = module;
		return acc;
	}, [false, {},
		[]
	]);
}

function initPlugin() {
	const [ParentPlugin, Plugin, Modules] = getPlugin();

	const [pluginBreakingError, SafeModules, BrokenModules] = checkModules(Modules);
	if (pluginBreakingError)
		return getErrorPlugin([
			"**Plugin is broken:** Take a screenshot of this popup and show it to the dev.",
			`\`\`\`md\nMissing modules:\n\n${BrokenModules.map((moduleName,i) => `${++i}. ${moduleName}`).join('\n')}\`\`\``
		]);
	else {
		if (BrokenModules.length > 0)
			pluginErrorAlert([
				"Detected some Missing modules, certain aspects of the plugin may not work properly.",
				`\`\`\`md\n[Missing modules]\n\n${BrokenModules.map((moduleName,i) => `${++i}. ${moduleName}`).join('\n')}\`\`\``
			]);
		return Plugin(ParentPlugin, SafeModules);
	}
}

module.exports = !global.ZeresPluginLibrary ?
	getErrorPlugin(["**Library plugin is needed**",
		`**ZeresPluginLibrary** is needed to run **${this.config.info.name}**.`,
		"Please download it from the officiel website",
		"https://betterdiscord.app/plugin/ZeresPluginLibrary"
	]) :
	initPlugin();
