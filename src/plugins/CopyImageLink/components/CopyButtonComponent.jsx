({ href }) => {
	return <>
		<span className="copyBtnSpan">|</span>
		<a
			className="copyBtn"
			onClick={() => Utils.copy(href)}>
			Copy link
		</a>
	</>;
};
