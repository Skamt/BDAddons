import { React } from "@Api";
export default function Bookmark({ filled }) {
	return (
		<svg
			width="24"
			height="24"
			fill="currentColor"
			viewBox="0 0 24 24">
			<path
				fillRule={filled ? "" : "evenodd"}
				d="M17 4H7a1 1 0 0 0-1 1v13.74l3.99-3.61a3 3 0 0 1 4.02 0l3.99 3.6V5a1 1 0 0 0-1-1ZM7 2a3 3 0 0 0-3 3v16a1 1 0 0 0 1.67.74l5.66-5.13a1 1 0 0 1 1.34 0l5.66 5.13a1 1 0 0 0 1.67-.75V5a3 3 0 0 0-3-3H7Z"
			/>
		</svg>
	);
}
