module.exports = ({ color,bannerColorCopyHandler }) => {
	return (
			<div
				className={"viewProfilePicture-NoBanner wrapper-2bCXfR"}
				style={{ backgroundColor: color }}>
				<a
					className="downloadLink-1OAglv anchorUnderlineOnHover-2qPutX"
					onClick={_ => copy(color)}>
					Copy Color
				</a>
			</div>
		)
};
