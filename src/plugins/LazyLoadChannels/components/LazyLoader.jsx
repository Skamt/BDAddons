module.exports = ({ original, onClick, channelId, guildId, messageId }) => {
	const [me, setMe] = useState(false);
	const [checked, setchecked] = useState(false);
	return !me ? (
		<div
			class="lazyLoader flex-2S1XBF flex-3BkGQD vertical-3aLnqW flex-3BkGQD directionColumn-3pi1nm justifyCenter-rrurWZ alignCenter-14kD11 noWrap-hBpHBz gatedContent-31-gID"
			style={{ flex: "flex: 1 1 auto;" }}>
			<div class="image-20MDYu marginBottom40-fvAlAV"></div>
			<div class="title-FyH9jw marginBottom8-emkd0_">Lazy loading for this Channel is Enabled!.</div>
			<div class="description-fPkcPm marginBottom20-315RVT">This channel is lazy loaded, If you want auto load this channel in the future, make sure you click the check box below before you load it.</div>
			<div
				class="flex-2S1XBF flex-3BkGQD horizontal-112GEH horizontal-1Piu5- flex-3BkGQD directionRow-2Iu2A9 justifyCenter-rrurWZ alignCenter-14kD11 noWrap-hBpHBz"
				// style={{ width: "50%" }}
			>
				<SwitchRow
					className={`${checked} action-3eQ5Or button-f2h6uQ sizeLarge-3mScP9 grow-2sR_-F`}
					hideBorder={true}
					value={checked}
					onChange={e => {
						setchecked(e);
					}}>
					Auto load.
				</SwitchRow>
				<button
					onClick={_ => {
						ChannelActions.actions[EVENTS.CHANNEL_SELECT]({ channelId, guildId, messageId });
						setMe(!me);
						if (checked) Data.save(channelId, true);
						else Data.delete(channelId);
					}}
					class="action-3eQ5Or button-f2h6uQ lookFilled-yCfaCM colorGreen-3y-Z79 sizeLarge-3mScP9 grow-2sR_-F">
					<div class="contents-3ca1mk">Load</div>
				</button>
			</div>
		</div>
	) : (
		original
	);
};
