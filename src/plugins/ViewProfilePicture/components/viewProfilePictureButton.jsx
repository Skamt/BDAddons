module.exports = ({ style, className, onClick, isUserPopout }) => {
	return (
		<Tooltip
			text="Show profile picture"
			position="top">
			{props => (
				<div
					{...props}
					style={style}
					className={className}
					onClick={onClick}>
					<svg
						aria-label="Redigera profilen"
						className="pencilIcon-z04-c5"
						aria-hidden="false"
						role="img"
						width={isUserPopout ? 18 : 24}
						height={isUserPopout ? 18 : 24}
						viewBox="0 0 384 384">
						<path
							fill="currentColor"
							d="M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z"></path>
					</svg>
				</div>
			)}
		</Tooltip>
	);
};
