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

function initPlugin([Plugin, Api]) {
	const plugin = (Plugin, Api) => {
		const {
			UI,
			Data,
			DOM,
			React,
			React: { useState, useEffect },
			Patcher,
			ContextMenu,
			Webpack: {
				Filters,
				getModule
			}
		} = new BdApi(config.info.name);

		// Helper functions
		const Utils = {
			showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
		};

		// Modules
		const { DiscordModules: { ButtonData, Textbox, TextElement } } = Api;

		const MessageHeader = getModule((m) => m.Z?.toString().includes('userOverride') && m.Z?.toString().includes('withMentionPrefix'));
		const Markdown = getModule((m) => m.Z?.rules && m.Z?.defaultProps?.parser).Z;
		const UserStore = getModule(Filters.byProps('getCurrentUser', 'getUser'));
		const openModal = getModule(Filters.byStrings('onCloseCallback', 'Layer'), { searchExports: true });
		const ModalRoot = getModule(Filters.byStrings('onAnimationEnd'), { searchExports: true });
		const Text = getModule(Filters.byStrings('data-text-variant'), { searchExports: true });
		const Label = getModule(Filters.byStrings('LEGEND', 'LABEL', 'h5'), { searchExports: true });

		const [ModalHeader, ModalBody, ModalFooter] = (() => {
			let exp = undefined;
			getModule((m, e) => m.toString().includes('onAnimationEnd') ? (true && (exp = e.exports)) : false, { searchExports: true });
			if (!exp) return exp;
			const funcs = Object.values(exp) || [];
			const ModalHeader = funcs.find(Filters.byStrings('headerIdIsManaged', 'headerId', 'separator'));
			const ModalBody = funcs.find(Filters.byStrings('scrollerRef', 'content', 'children'));
			const ModalFooter = funcs.find(Filters.byStrings('footerSeparator'));
			return [ModalHeader, ModalBody, ModalFooter];
		})();

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

[id^="message-reply-context"] .nick {
	display: none;
}`;
		const AddUserNickname = ({ props, user }) => {
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
				React.createElement(ModalRoot, { ...props },
					React.createElement(ModalHeader, { separator: false },
						React.createElement(Text, {
							children: "Add User Nickname",
							variant: "heading-lg/semibold"
						})),

					React.createElement(ModalBody, null,
						React.createElement(Text, {
							children: "Find a friend faster with a personal nickname. It will only be visible to you in your direct messages.",
							className: "description-2pRfjZ",
							variant: "text-md/normal"
						}),

						React.createElement(Label, { children: "User Nickname" }),
						React.createElement(Textbox, {
							...
							Textbox.defaultProps,
							className: "input-2i7ay7",
							autoFocus: true,
							placeholder: user.username,
							onChange: setValue,
							value: value
						}),

						React.createElement(ButtonData, {
							children: "Reset user nickname",
							className: "reset-Gp82ub",
							size: "",
							onClick: Clear,
							color: ButtonData.Colors.LINK,
							look: ButtonData.Looks.LINK
						})),

					React.createElement(ModalFooter, null,
						React.createElement(ButtonData, {
							children: "Save",
							onClick: Save
						}),

						React.createElement(ButtonData, {
							children: "Cancel",
							onClick: props.onClose,
							color: ButtonData.Colors.PRIMARY,
							look: ButtonData.Looks.LINK
						}))));

		};

		return class CustomNicknames extends Plugin {

			constructor() {
				super();
			}

			onStart() {
				DOM.addStyle(css);
				this.patches = [
					Patcher.after(MessageHeader, "Z", (_, [{ message }], ret) => {
						const nick = Data.load(message.author.id);
						if (nick)
							ret.props.children.splice(3, 0, React.createElement('span', { className: "nick" }, nick))
					}),
					ContextMenu.patch("user-context", (retVal, { user }) => {
						if (user.id !== UserStore.getCurrentUser().id)
							retVal.props.children.unshift(ContextMenu.buildItem({
								type: "button",
								label: "Add user nickname",
								action: () => openModal(props => React.createElement(AddUserNickname, { props, user }))
							}));
					})
				]
			}

			onStop() {
				DOM.removeStyle();
				this.patches?.forEach?.(p => p());
				this.patches = null;
			}

			getSettingsPanel() {
				return this.buildSettingsPanel().getElement();
			}
		};
	};
	return plugin(Plugin, Api);
}

module.exports = !global.ZeresPluginLibrary ?
	() => ({
		stop() {},
		start() {
			BdApi.UI.showConfirmationModal("Library plugin is needed", [`**ZeresPluginLibrary** is needed to run **${this.config.info.name}**.`, `Please download it from the officiel website`, "https://betterdiscord.app/plugin/ZeresPluginLibrary"], {
				confirmText: "Ok"
			});
		}
	}) :
	initPlugin(global.ZeresPluginLibrary.buildPlugin(config));
