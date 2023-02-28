new class FiltersText extends Disposable {
	Init() {
		[
			['PendingReplyStore', DiscordModules.PendingReplyStore],
			['DMChannel', DiscordModules.DMChannel],
			['ChannelTypeEnum', DiscordModules.ChannelTypeEnum],
			['SelectedChannelStore', DiscordModules.SelectedChannelStore],
			['ChannelContent', DiscordModules.ChannelContent],
			['ChannelActions', DiscordModules.ChannelActions],
			['UserStore', DiscordModules.UserStore],
			['Permissions', DiscordModules.Permissions],
			['DiscordPermissions', DiscordModules.DiscordPermissions],
			['MessageActions', DiscordModules.MessageActions],
			['EmojiIntentionEnum', DiscordModules.EmojiIntentionEnum],
			['EmojiSendAvailabilityEnum', DiscordModules.EmojiSendAvailabilityEnum],
			['EmojiFunctions', DiscordModules.EmojiFunctions],
			['ChannelStore', DiscordModules.ChannelStore],
			['StickerStore', DiscordModules.StickerStore],
			['ChannelTextArea', DiscordModules.ChannelTextArea],
			['StickerTypeEnum', DiscordModules.StickerTypeEnum],
			['StickerFormatEnum', DiscordModules.StickerFormatEnum],
			['GuildPermissions', DiscordModules.GuildPermissions],
			['Popout', DiscordModules.Popout],
			['ExpressionPickerInspector', DiscordModules.ExpressionPickerInspector],
			['Tooltip', DiscordModules.Tooltip],
			['ModalRoot', DiscordModules.ModalRoot],
			['openModal', DiscordModules.openModal],
			['ModalCarousel', DiscordModules.ModalCarousel],
			['UserBannerMask', DiscordModules.UserBannerMask],
			['ProfileTypeEnum', DiscordModules.ProfileTypeEnum],
			['CurrentUserStore', DiscordModules.CurrentUserStore],
			['DefaultEmojisManager', DiscordModules.DefaultEmojisManager],
			['SelectedGuildStore', DiscordModules.SelectedGuildStore],
			['ComponentDispatch', DiscordModules.ComponentDispatch],
			['renderLinkComponent', DiscordModules.renderLinkComponent]
		].filter(([name, module]) => !module).map(([name]) => name).forEach(console.log);
		this.Init = nop;
	}
}