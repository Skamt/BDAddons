module.exports = (Plugin, Api) => {
	const {
		UI,
		Data,
		React,
		React: { useCallback },
		Patcher,
		ContextMenu,
		Webpack: {
			Filters,
			getModule
		}
	} = new BdApi(config.info.name);

	const MessageHeader = getModule((m) => m.Z?.toString().includes("userOverride") && m.Z?.toString().includes("withMentionPrefix"));
	const TextInput = getModule((m) => m?.Sizes?.MINI && m?.defaultProps, { searchExports: true });
	const Markdown = getModule((m) => m.Z?.rules && m.Z?.defaultProps?.parser).Z;
	const UserStore = getModule((m, e, i) => m.getCurrentUser && m.getUser);

	return class CustomNicknames extends Plugin {

		constructor() {
			super();
		}
		openCarousel(items) {
			openModal(props => React.createElement(DisplayCarousel, { props, items }));
		}
		setUserNickName(user) {
			let username = user.username;
			UI.showConfirmationModal(
				'Add User Nickname',
				[
					React.createElement(Markdown, null, "USER NICKNAME"),
					React.createElement(TextInput, {
						type: "text",
						placeholder: "Nickname",
						onChange: (name) => {
							username = name;
						},
					})
				], {
					confirmText: "Set",
					onConfirm: () => {
						Data.save(user.id, username);
					},
				}
			);
		}

		patch() {
			this.patches = [Patcher.before(MessageHeader, "Z", (_, [{ author, message }]) => {
					const authorId = message.author.id;
					const nick = Data.load(authorId);
					if (nick && !author.nick.includes(`| ${nick}`))
						author.nick = `${author.nick} | ${nick}`
				}),
				ContextMenu.patch("user-context", (retVal, { user }) => {
					if (user.id !== UserStore.getCurrentUser().id)
						retVal.props.children.unshift(ContextMenu.buildItem({
							type: "button",
							label: "Add user nickname",
							action: () => this.setUserNickName(user)
						}));
				})
			]
		}

		onStart() {
			try {
				this.patch();
			} catch (e) {
				console.error(e);
			}
		}

		onStop() {
			this.patches.forEach(p => p())
		}

		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}

	};
}