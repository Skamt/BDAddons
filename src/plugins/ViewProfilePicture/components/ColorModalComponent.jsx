module.exports = ({ color, bannerColorCopyHandler }) => {
	return (
		<div
			className={"VPP-NoBanner wrapper-2bCXfR"}
			style={{ backgroundColor: color }}>
			<a
				className="anchorUnderlineOnHover-2qPutX downloadLink-3cavAH"
				onClick={_ => Utils.copy(color)}>
				Copy Color
			</a>
		</div>
	);
};
