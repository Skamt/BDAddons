module.exports = ({ loadedChannels, originalComponent, channel,messageId }) => {
	const [render, setRender] = useState(true);	
	const [checked, setChecked] = useState(false);	
	const loadHandler = () => {
		ChannelActions.actions[EVENTS.CHANNEL_SELECT]({
			channelId: channel.id,
			guildId: channel.guild_id,
			messageId
		});
		setRender(false);
		loadedChannels.add(channel.id);
		if (checked) DataManager.add(channel);
	};

	return render ? <div className="lazyLoader">
			<div className="logo"></div>
			<div className="title">Lazy loading is Enabled!</div>
			<div className="description">This channel is lazy loaded, If you want to auto load this channel in the future, make sure you enable <b>Auto load</b> down below before you load it.</div>
			<div className="controls">
				<button onClick={loadHandler} className="load-btn">Load</button>
				<SwitchRow
					className={`${checked} switch`}
					hideBorder="true"
					value={checked}
					onChange={setChecked}>
					Auto load
				</SwitchRow>
			</div>
		</div> : originalComponent;
};
