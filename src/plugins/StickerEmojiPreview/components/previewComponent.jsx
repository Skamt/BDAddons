module.exports = ({ sticker, element, data, previewSize }) => {
	const url = sticker ? `https://media.discordapp.net/stickers/${data.id}.webp?size=640&quality=lossless` : data.replace(/(size=)(\d+)[&]/, `&size=640`);
	const [show, setShow] = useState(false);

	useEffect(() => {
		function keyupHandler() {
			setShow(!show);
		}
		document.addEventListener("keyup", keyupHandler);
		return () => document.removeEventListener("keyup", keyupHandler);
	}, [show]);
	return (
		<Popout
			renderPopout={() => (
				<div
					className="stickersPreview"
					style={{ width: `${previewSize}px` }}>
					<img src={url}></img>
				</div>
			)}
			shouldShow={show}
			position={Popout.Positions.LEFT}
			align={Popout.Align.BOTTOM}
			animation={Popout.Animation["SCALE"]}
			spacing={60}>
			{() => element}
		</Popout>
	);
};
