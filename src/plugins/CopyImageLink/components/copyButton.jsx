module.exports = ({ href }) => {
	return (
		<>
			<span className="copyBtnSpan">|</span>
			<a
				className="anchorUnderlineOnHover-2qPutX downloadLink-3cavAH copyBtn"
				onClick={_ => Utils.copy(href)}>
				Copy link
			</a>
		</>
	);
}