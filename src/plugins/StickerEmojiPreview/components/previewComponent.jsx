module.exports = ({ target, defaultState, setPreviewState, previewComponent }) => {
	const [show, setShow] = useState(defaultState);
	useEffect(() => {
		function keyupHandler(e) {
			if(e.key === "Control"){
				setPreviewState(!show);
				setShow(!show);
			}
		}
		document.addEventListener("keyup", keyupHandler);
		return () => document.removeEventListener("keyup", keyupHandler);
	}, [show]);
	return (
		<Modules.Popout
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
		</Modules.Popout>
	);
};
