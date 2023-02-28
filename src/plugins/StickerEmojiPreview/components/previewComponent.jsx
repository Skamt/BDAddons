module.exports = ({ target,  defaultState, previewComponent }) => {
	const [show, setShow] = useState(defaultState);
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
					style={{ width: `${PREVIEW_SIZE}px` }}>
					{previewComponent}
				</div>
			)}
			shouldShow={show}
			position="left"
			align="bottom"
			animation="3"
			spacing={60}>
			{() => target}
		</Popout>
	);
};
