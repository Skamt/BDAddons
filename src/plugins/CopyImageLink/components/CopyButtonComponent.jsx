module.exports = ({ href }) => {
	return <>
		<span className="copyBtnSpan">|</span>
		<a
			className="copyBtn"
			onClick={_ => Utils.copy(href)}>
			Copy link
		</a>
	</>;
};
