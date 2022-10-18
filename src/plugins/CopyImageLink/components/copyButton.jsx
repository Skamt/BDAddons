module.exports = ({ href }) => {
	return (
		<>
			<span className="copyBtnSpan">|</span>
			<a
				className="downloadLink-1OAglv anchorUnderlineOnHover-2qPutX copyBtn"
				onClick={_ => Utils.copy(href)}>
				Copy link
			</a>
		</>
	);
}