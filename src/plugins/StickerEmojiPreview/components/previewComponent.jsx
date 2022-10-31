module.exports = ({ target, previewComponent, previewSize }) => {
	const [show, setShow] = useState(false);
	useEffect(() => {
		function keyupHandler(e) {
			if(e.key === "Control")
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
					{previewComponent}
				</div>
			)}
			shouldShow={show}
			position={Popout.Positions.LEFT}
			align={Popout.Align.BOTTOM}
			animation={Popout.Animation["SCALE"]}
			spacing={60}>
			{() => target}
		</Popout>
	);
};
