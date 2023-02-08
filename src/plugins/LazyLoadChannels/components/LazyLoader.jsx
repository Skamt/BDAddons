module.exports = ({ loadedChannels, message, returnValue, channel, guild }) => {
	const [state, setState] = useState({ render: true, checked: false });	
	const loadHandler = () => {
		ChannelActions.actions[EVENTS.CHANNEL_SELECT]({
			channelId: channel.id,
			guildId: guild.id,
			messageId: message 
		});
		setState({ render: false, checked: false });
		if (state.checked) 
			DataManager.add(guild, channel);
		loadedChannels.add(channel.id);
	};
	useEffect(() => { setState({ render: true, checked: false });}, [channel]);
	return state.render ? <div className="lazyLoader">
			<div className="logo"></div>
			<div className="title">Lazy loading is Enabled!</div>
			<div className="description">This channel is lazy loaded, If you want to auto load this channel in the future, make sure you enable <b>Auto load</b> down below before you load it.</div>
			<div className="controls">
				<button onClick={loadHandler} className="load-btn">Load</button>
				<SwitchRow
					className={`${state.checked} switch`}
					hideBorder="true"
					value={state.checked}
					onChange={e => setState({...state, checked: e})}>
					Auto load
				</SwitchRow>
			</div>
		</div> : returnValue ;
};
