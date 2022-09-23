module.exports = ({ sticker, element, data, previewSize, animated }) => {
	const [showPopout, setShowPopout] = useState(false);
	const url = sticker ? `https://media.discordapp.net/stickers/${data.id}.webp?size=640&quality=lossless` : data.id ? `${data.url.split("?")[0]}?size=640&passthrough=false&quality=lossless` : data.url;
	return (
		<Popout
			shouldShow={showPopout}
			position={Popout.Positions.TOP}
			align={Popout.Align.CENTER}
			animation={Popout.Animation["SCALE"]}
			spacing={8}
			renderPopout={() => (
				<div
					className="stickersPreview"
					style={{ width: `${previewSize}px` }}>
					<img src={url}></img>
				</div>
			)}>
			{() => (
				<div
					className={!animated || "animated"}
					onMouseEnter={() => setShowPopout(true)}
					onMouseLeave={() => setShowPopout(false)}>
					{element}
				</div>
			)}
		</Popout>
	);
};
