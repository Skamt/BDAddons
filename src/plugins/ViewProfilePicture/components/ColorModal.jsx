module.exports = ({ color,bannerColorCopyHandler }) => {
	return (
			<div
				className={"noBanner wrapper-2bCXfR"}
				style={{ backgroundColor: color }}>
				<a
					className={`${classes.downloadLink} ${classes.anchorUnderlineOnHover}`}
					onClick={_ => bannerColorCopyHandler(color)}>
					Copy Color
				</a>
			</div>
		)
};
