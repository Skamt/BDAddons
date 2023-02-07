module.exports = ({ original, options }) => {
	const [render, setRender] = useState(true);
	const [checked, setchecked] = useState(false);
	const loadHandler = () => {
		ChannelActions.actions[EVENTS.CHANNEL_SELECT](options);
		setRender(!render);
		if (checked) Data.save(options.channelId, true);
		else Data.delete(options.channelId);
	};
	return render ? <div class="lazyLoader">
			<div class="logo"></div>
			<div class="title">Lazy loading is Enabled!</div>
			<div class="description">This channel is lazy loaded, If you want to auto load this channel in the future, make sure you enable <b>Auto load</b> down below before you load it.</div>
			<div class="controls">
				<button onClick={loadHandler} class="load-btn">Load</button>
				<SwitchRow
					className={`${checked} switch`}
					hideBorder="true"
					value={checked}
					onChange={setchecked}>
					Auto load
				</SwitchRow>
			</div>
		</div>
	: original;
};
