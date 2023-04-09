({ color }) => (
	<div
		className="VPP-NoBanner"
		style={{ backgroundColor: color }}>
		<a
			className="copyColorBtn"
			onClick={() => Utils.copy(color)}>
			Copy Color
		</a>
	</div>
);
