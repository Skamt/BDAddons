module.exports = props => {
	return (
		<>
			<span className="copyBtnSpan">|</span>
			<a onClick={props.onClick} className={`copyBtn ${props.className}`}>Copy link</a>
		</>
	);
};
