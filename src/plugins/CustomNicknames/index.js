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

	const MessageHeader = getModule((m) => m.Z?.toString().includes("userOverride") && m.Z?.toString().includes("withMentionPrefix"));
	const Markdown = getModule((m) => m.Z?.rules && m.Z?.defaultProps?.parser).Z;
	const UserStore = getModule((m, e, i) => m.getCurrentUser && m.getUser);

	const { DiscordModules: { ButtonData, Textbox, TextElement } } = Api;
	const openModal = DiscordModules.openModal;
	const ModalRoot = DiscordModules.ModalRoot;
	const Text = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byStrings('data-text-variant'), { searchExports: true });
	const Label = getModule(Filters.byStrings('LEGEND', 'LABEL', 'h5'), { searchExports: true });
	let ModalHeader, ModalBody, ModalFooter;
	getModule((m, e) => {
		if (m.toString().includes('onAnimationEnd')) {
			const funcs = Object.values(e.exports);
			ModalHeader = funcs.find(Filters.byStrings('headerIdIsManaged', 'headerId', 'separator'));
			ModalBody = funcs.find(Filters.byStrings('scrollerRef', 'content', 'children'));
			ModalFooter = funcs.find(Filters.byStrings('footerSeparator'));
			return true;
		}
	}, { searchExports: true });

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