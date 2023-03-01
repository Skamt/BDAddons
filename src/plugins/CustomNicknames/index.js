module.exports = (Plugin, Api) => {
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

	const MessageHeader = DiscordModules.MessageHeader;
	const Markdown = DiscordModules.Markdown;
	const UserStore = DiscordModules.UserStore;
	const openModal = DiscordModules.openModal;
	const ModalRoot = DiscordModules.ModalRoot;
	const Text = DiscordModules.Text;
	const Label = DiscordModules.Label;

	const [ModalHeader, ModalBody, ModalFooter] = DiscordModules.ModalComponents;

	const css = require("styles.css");
	const AddUserNickname = require("components/AddUserNickname.jsx");

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
}