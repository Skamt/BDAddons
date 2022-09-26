module.exports = ({ className, onClick }) => {
	return (
		<>
			<span className="copyBtnSpan">|</span>
			<a
				className={className}
				onClick={onClick}>
				Copy link
			</a>
		</>
	);
};
