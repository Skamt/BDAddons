module.exports = ({ sticker, element, data, previewSize }) => {
	const url = sticker ? `https://media.discordapp.net/stickers/${data.id}.webp?size=640&quality=lossless` : data.replace(/(size=)(\d+)[&]/, `&size=640`);
	return (
		<Popout
			renderPopout={() => (
				<div
					className="stickersPreview"
					style={{ width: `${previewSize}px` }}>
					<img src={url}></img>
				</div>
			)}
			shouldShow={true}
			position={Popout.Positions.LEFT}
			align={Popout.Align.BOTTOM}
			animation={Popout.Animation["SCALE"]}
			spacing={60}>
			{() => element}
		</Popout>
	);
};
