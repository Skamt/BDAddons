module.exports = ({ original, options }) => {
	const [me, setMe] = useState(false);
	const [checked, setchecked] = useState(false);
	return !me ? (
		<div
			class="lazyLoader">
			<div class="logo"></div>
			<div class="title">Lazy loading for this Channel is Enabled!</div>
			<div class="description">
				This channel is lazy loaded, If you want auto load this channel in the future, make sure you click <b>Enable auto load</b> below before you load it.
			</div>
			<div class="controls">
				<button
					onClick={_ => {
						ChannelActions.actions[EVENTS.CHANNEL_SELECT](options);
						setMe(!me);
						if (checked) Data.save(options.channelId, true);
						else Data.delete(options.channelId);
					}}
					class="load-btn">
					<div class="contents-3ca1mk">Load</div>
				</button>
				<SwitchRow
					className={`${checked} switch action-3eQ5Or button-f2h6uQ`}
					hideBorder={true}
					value={checked}
					onChange={e => {
						setchecked(e);
					}}>
					Auto load.
				</SwitchRow>
			</div>
		</div>
	) : (
		original
	);
};
