/**
 * @name SendStickersAsLinks
 * @description Enables you to send custom Stickers as links, (custom stickers as in the ones that are added by servers, not official discord stickers).
 * @version 2.1.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/SendStickersAsLinks
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/SendStickersAsLinks/SendStickersAsLinks.plugin.js
 */
const config = {
	info: {
		name: "SendStickersAsLinks",
		version: "2.1.0",
		description: "Enables you to send custom Stickers as links, (custom stickers as in the ones that are added by servers, not official discord stickers).",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/SendStickersAsLinks/SendStickersAsLinks.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/SendStickersAsLinks",
		authors: [{
			name: "Skamt"
		}]
	},
	defaultConfig: [{
		type: "switch",
		id: "sendDirectly",
		name: "Send Directly",
		note: "Send the sticker link in a message directly instead of putting it in the chat box.",
		value: false
	}, {
		type: "switch",
		id: "ignoreEmbedPermissions",
		name: "Ignore Embed Permissions",
		note: "Send sticker links regardless of embed permissions, meaning links will not turn into images.",
		value: false
	}, {
		type: "switch",
		id: "shouldSendAnimatedStickers",
		name: "Send animated stickers",
		note: "Animated stickers do not animate, sending them will only send the first picture of the animation. (still useful)",
		value: false
	}, {
		type: "switch",
		id: "shouldHighlightAnimated",
		name: "Highlight animated stickers",
		value: true
	}, {
		type: "slider",
		id: "stickerSize",
		name: "Sticker Size",
		note: "The size of the sticker in pixels. 160 is recommended.",
		value: 160,
		markers: [80, 100, 128, 160],
		stickToMarkers: true
	}]
};

function getPlugin() {
	const [ParentPlugin, Api] = global.ZeresPluginLibrary.buildPlugin(config);
	const { Modules, Plugin } = ((Api) => {
		const { Webpack: { Filters, getModule } } = BdApi;

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
				StickerModule: {
					module: getModuleAndKey(Filters.byStrings('sticker', 'withLoadingIndicator')),
					withKey: true,
					errorNote: "Animated Stickers will not be highlighted."
				},
				Dispatcher: { module: getModule(Filters.byProps('dispatch', 'subscribe')) },
				PendingReplyStore: {
					module: getModule(m => m.getPendingReply),
					errorNote: "Replies will be ignored"
				},
				Permissions: {
					module: getModule(Filters.byProps('computePermissions')),
					errorNote: "Checking permissions is disabled"
				},
				ChannelStore: {
					module: getModule(Filters.byProps('getChannel', 'getDMFromUserId')),
					isBreakable: true
				},
				DiscordPermissions: {
					module: getModule(Filters.byProps('ADD_REACTIONS'), { searchExports: true }),
					fallback: { EMBED_LINKS: 16384n, USE_EXTERNAL_EMOJIS: 262144n },
					errorNote: "fallback is used, there maybe side effects"
				},
				MessageActions: {
					module: getModule(Filters.byProps('jumpToMessage', '_sendMessage')),
					isBreakable: true
				},
				UserStore: {
					module: getModule(Filters.byProps('getCurrentUser', 'getUser')),
					errorNote: "Embed permission checks is disabled."
				},
				StickerStore: {
					module: getModule(Filters.byProps('getStickerById')),
					isBreakable: true
				},
				StickerTypeEnum: {
					module: getModule(Filters.byProps('GUILD', 'STANDARD'), { searchExports: true }),
					fallback: { STANDARD: 1, GUILD: 2 },
					errorNote: "fallback is used, there maybe side effects"
				},
				StickerFormatEnum: {
					module: getModule(Filters.byProps('APNG', 'LOTTIE'), { searchExports: true }),
					fallback: { PNG: 1, APNG: 2, LOTTIE: 3, GIF: 4 },
					errorNote: "fallback is used, there maybe side effects"
				},
				InsertText: {
					module: (() => {
						let ComponentDispatch;
						return (content) => {
							if (!ComponentDispatch) ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners('INSERT_TEXT').length, { searchExports: true });
							ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
								plainText: content
							});
						}
					})()
				},
				...(() => {
					const result = {
						StickersSendability: { module: undefined, isBreakable: true },
						StickersSendabilityEnum: {
							module: undefined,
							fallback: {
								NONSENDABLE: 2,
								SENDABLE: 0,
								SENDABLE_WITH_BOOSTED_GUILD: 3,
								SENDABLE_WITH_PREMIUM: 1
							},
							errorNote: "fallback is used, there maybe side effects"
						},
						getStickerSendability: { module: undefined, isBreakable: true },
						isStickerSendable: { module: undefined, isBreakable: true }
					};
					result.StickersSendability.module = getModule(m => Object.keys(m).some(key => m[key]?.SENDABLE_WITH_BOOSTED_GUILD));
					if (!result.StickersSendability) return result;
					const exports = Object.entries(result.StickersSendability.module).map(([key, fn]) => (fn.key = key, fn));
					result.StickersSendabilityEnum.module = exports.splice(exports.findIndex(Filters.byProps('SENDABLE_WITH_BOOSTED_GUILD')), 1)[0];
					result.getStickerSendability.module = exports.splice(exports.findIndex(Filters.byStrings('canUseStickersEverywhere')), 1)[0];
					result.isStickerSendable.module = exports[0];
					return result;
				})()
			},
			Plugin(ParentPlugin, Modules) {
				const {
					UI,
					DOM,
					Patcher
				} = new BdApi(config.info.name);

				// Utilities
				const Utils = {
					showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
					getStickerUrl: (stickerId, size) => `https://media.discordapp.net/stickers/${stickerId}?size=${size}&passthrough=false`,
					hasEmbedPerms: (channel, user) => !channel.guild_id || Modules.Permissions?.can({ permission: Modules.DiscordPermissions.EMBED_LINKS, context: channel, user }),
					isLottieSticker: sticker => sticker.type === Modules.StickerTypeEnum.STANDARD,
					isAnimatedSticker: sticker => sticker["format_type"] === Modules.StickerFormatEnum.APNG,
					isStickerSendable: (sticker, channel, user) => Modules.getStickerSendability(sticker, user, channel) === Modules.StickersSendabilityEnum.SENDABLE
				};

				// Strings & Constants
				const TAGS = {
					ANIMATED_STICKER_TAG: "ANIMATED_STICKER_TAG"
				};
				const STRINGS = {
					sendLottieStickerErrorMessage: "Official Discord Stickers are not supported.",
					missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
					disabledAnimatedStickersErrorMessage: "You have disabled animated stickers in settings."
				};

				// Styles
				const css = `.animatedSticker{
    position:relative;
}

.animatedSticker:before{
    content:'';
    padding:2px;
    background:linear-gradient(-135deg, #42ff42 8%, transparent 0);
    position:absolute;
    width:100%;
    height:100%;
    top:-2px;
    left:-2px;
    z-index:55;
}

.stickerInspected-mwnU6w .animatedSticker:before{
    border-radius:4px;
}`;

				return class SendStickersAsLinks extends ParentPlugin {
					constructor() {
						super();
					}

					sendMessage({ sticker, channel }) {
						Modules.MessageActions.sendMessage(channel.id, {
							content: Utils.getStickerUrl(sticker.id, this.settings.stickerSize),
							validNonShortcutEmojis: []
						}, undefined, this.getReply(channel.id));
					}

					handleUnsendableSticker({ user, sticker, channel }) {
						if (Utils.isAnimatedSticker(sticker) && !this.settings.shouldSendAnimatedStickers)
							return Utils.showToast(STRINGS.disabledAnimatedStickersErrorMessage, "info");
						if (!Utils.hasEmbedPerms(channel, user) && !this.settings.ignoreEmbedPermissions)
							return Utils.showToast(STRINGS.missingEmbedPermissionsErrorMessage, "info");

						this.sendStickerAsLink(sticker, channel);
					}

					sendStickerAsLink(sticker, channel) {
						if (this.settings.sendDirectly)
							this.sendMessage(sticker, channel)
						else
							Modules.InsertText(Utils.getStickerUrl(sticker.id, this.settings.stickerSize));
					}

					getReply(channelId) {
						const reply = Modules.PendingReplyStore?.getPendingReply(channelId);
						if (!reply) return {};
						return {
							messageReference: {
								guild_id: reply.channel.guild_id,
								channel_id: reply.channel.id,
								message_id: reply.message.id
							},
							allowedMentions: reply.shouldMention ? undefined : {
								parse: ["users", "roles", "everyone"],
								replied_user: false
							}
						}
					}

					handleSticker(channelId, stickerId) {
						const user = this.getCurrentUser();
						const sticker = Modules.StickerStore.getStickerById(stickerId);
						const channel = Modules.ChannelStore.getChannel(channelId);
						return {
							user,
							sticker,
							channel,
							isSendable: Utils.isStickerSendable(sticker, channel, user)
						}
					}

					patchSendSticker() {
						/** 
						 * The existance of this plugin implies the existance of this patch 
						 */
						Patcher.instead(Modules.MessageActions, 'sendStickers', (_, args, originalFunc) => {
							const [channelId, [stickerId]] = args;
							const stickerObj = this.handleSticker(channelId, stickerId);
							if (stickerObj.isSendable)
								originalFunc.apply(_, args)
							else
								this.handleUnsendableSticker(stickerObj);
						});
					}

					patchStickerAttachement() {
						/** 
						 * Since we enabled stickers to be clickable
						 * If you click on a sticker while the textarea has some text
						 * the sticker will be added as attachment, and therefore triggers an api request
						 * must intercept, adapt, overcome, what..?
						 */
						Patcher.before(Modules.MessageActions, 'sendMessage', (_, args) => {
							const [channelId, , , attachments] = args;
							if (attachments && attachments.stickerIds && attachments.stickerIds.filter) {
								const [stickerId] = attachments.stickerIds;
								const stickerObj = this.handleSticker(channelId, stickerId);
								if (!stickerObj.isSendable) {
									delete args[3].stickerIds;
									setTimeout(() => {
										this.sendMessage(stickerObj);
									}, 0)
								}
							}
						})
					}

					patchChannelGuildPermissions() {
						if (Modules.Permissions)
							Patcher.after(Modules.Permissions, "can", (_, [{ permission }], ret) =>
								ret || Modules.DiscordPermissions.USE_EXTERNAL_EMOJIS === permission
							);
					}

					patchStickerClickability() {
						// if it's a guild sticker return true to make it clickable 
						// ignoreing discord's stickers because ToS, and they're not regular images
						Patcher.after(Modules.StickersSendability, Modules.isStickerSendable.key, (_, args, returnValue) => {
							return args[0].type === Modules.StickerTypeEnum.GUILD;
						});
					}

					patchGetStickerById() {
						if (Modules.StickerModule)
							Patcher.after(Modules.StickerModule, Modules.StickerModule.key, (_, args, returnValue) => {
								const { size, sticker } = returnValue.props.children[0].props;
								if (size === 96) {
									if (this.settings.shouldHighlightAnimated && !Utils.isLottieSticker(sticker) && Utils.isAnimatedSticker(sticker)) {
										returnValue.props.children[0].props.className += " animatedSticker"
									}
								}
							});
					}

					patchStickerSuggestion() {
						// Enable suggestions for custom stickers only 
						if (Modules.StickersSendability)
							Patcher.after(Modules.StickersSendability, Modules.getStickerSendability.key, (_, args, returnValue) => {
								if (args[0].type === Modules.StickerTypeEnum.GUILD) {
									const { SENDABLE } = Modules.StickersSendabilityEnum;
									return returnValue !== SENDABLE ? SENDABLE : returnValue;
								}
							});
					}

					setUpCurrentUser() {
						const [getCurrentUser, cleanUp] = (() => {
							let currentUser = null;
							if (!Modules.Dispatcher) return [() => Modules.UserStore?.getCurrentUser() || {}];

							const resetCurrentUser = () => currentUser = null;
							Modules.Dispatcher.subscribe('LOGOUT', resetCurrentUser);
							return [
								() => {
									if (currentUser) return currentUser;
									const user = Modules.UserStore?.getCurrentUser();
									if (user) {
										currentUser = user;
									} else {
										try {
											const target = document.querySelector('.panels-3wFtMD .container-YkUktl');
											const instance = BdApi.ReactUtils.getInternalInstance(target);
											const props = BdApi.Utils.findInTree(instance, a => a?.currentUser, { walkable: ["return", "pendingProps"] });
											currentUser = props.currentUser;
										} catch {}
									}
									return currentUser || {};
								},
								() => Modules.Dispatcher.unsubscribe('LOGOUT', resetCurrentUser)
							]
						})();
						this.getCurrentUser = getCurrentUser;
						this.cleanUp = cleanUp;
					}

					onStart() {
						try {
							DOM.addStyle(css);
							this.setUpCurrentUser();
							this.patchStickerClickability();
							this.patchSendSticker();
							this.patchGetStickerById();
							this.patchStickerAttachement();
							this.patchStickerSuggestion();
							this.patchChannelGuildPermissions();
						} catch (e) {
							console.error(e);
						}
					}

					onStop() {
						this.cleanUp?.();
						DOM.removeStyle();
						Patcher.unpatchAll();
					}

					getSettingsPanel() {
						const panel = this.buildSettingsPanel();
						return panel.getElement();
					}
				};
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

function checkModules(modules) {
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
}

function ensuredata() {
	return BdApi.Data.load(config.info.name, 'brokenModulesData') || {
		version: config.info.version,
		first: true,
		errorPopupCount: 0,
		savedBrokenModules: []
	};
}

function setPluginMetaData() {
	const { version, first } = ensuredata();
	if (version != config.info.version || first)
		BdApi.Data.save(config.info.name, 'brokenModulesData', {
			version: config.info.version,
			errorPopupCount: 0,
			savedBrokenModules: []
		});
}

function handleBrokenModules(brokenModules) {
	const { version, errorPopupCount, savedBrokenModules } = ensuredata();

	const newBrokenModules = brokenModules.some(([newItem]) => !savedBrokenModules.includes(newItem));
	const isUpdated = version != config.info.version;
	const isPopupLimitReached = errorPopupCount === 3;

	if (isUpdated || !isPopupLimitReached || newBrokenModules) {
		pluginErrorAlert([
			"Detected some Missing modules, certain aspects of the plugin may not work properly.",
			`\`\`\`md\nMissing modules:\n\n${brokenModules.map(([moduleName, errorNote]) => `[${moduleName}]: ${errorNote ? `\n\t${errorNote}` :""}`).join('\n')}\`\`\``
		]);

		BdApi.Data.save(config.info.name, 'brokenModulesData', {
			version,
			errorPopupCount: (errorPopupCount + 1) % 4,
			savedBrokenModules: brokenModules.map(([moduleName]) => moduleName)
		});
	}
}

function initPlugin() {
	setPluginMetaData();
	const [ParentPlugin, Plugin, Modules] = getPlugin();

	const [pluginBreakingError, SafeModules, BrokenModules] = checkModules(Modules);
	if (pluginBreakingError)
		return getErrorPlugin([
			"**Plugin is broken:** Take a screenshot of this popup and show it to the dev.",
			`\`\`\`md\nMissing modules:\n\n${BrokenModules.map(([moduleName],i) => `${++i}. ${moduleName}`).join('\n')}\`\`\``
		]);
	else {
		if (BrokenModules.length > 0)
			handleBrokenModules(BrokenModules);
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
