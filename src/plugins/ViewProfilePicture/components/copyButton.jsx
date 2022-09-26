module.exports = ({ onClick }) => {
	return (
		<>
			<span className="copyBtnSpan">|</span>
			<a
				className={`${classes.downloadLink} ${classes.anchorUnderlineOnHover} copyBtn`}
				onClick={onClick}>
				Copy link
			</a>
		</>
	);
}