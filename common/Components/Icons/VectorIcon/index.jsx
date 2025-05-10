import { React } from "@Api";
export default function Vector({left}) {
	return (
		<svg
			style={{rotate:left ? "180deg": ""}}
			width="24"
			height="24"
			fill="currentColor"
			viewBox="0 0 24 24">
			<path d="M20.7 12.7a1 1 0 0 0 0-1.4l-5-5a1 1 0 1 0-1.4 1.4l3.29 3.3H4a1 1 0 1 0 0 2h13.59l-3.3 3.3a1 1 0 0 0 1.42 1.4l5-5Z" />
		</svg>
	);
}
