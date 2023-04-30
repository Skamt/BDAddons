import { React } from "@Api";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
const { Tooltip } = TheBigBoyBundle;

export default props => {
	return (
		<Tooltip
			text="View profile picture"
			position="top">
			{p => (
				<div
					{...p}
					{...props}>
					<svg
						aria-label={p["aria-label"]}
						aria-hidden="false"
						role="img"
						width="18"
						height="18"
						viewBox="-50 -50 484 484">
						<path
							fill="currentColor"
							d="M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z"></path>
					</svg>
				</div>
			)}
		</Tooltip>
	);
};
