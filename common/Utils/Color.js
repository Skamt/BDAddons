import { Color } from "@Discord/Modules";
import {  fit } from "@Utils";
export function colorToImg(c) {
	const canvas = document.createElement("canvas");
	const width = window.innerWidth * 0.7;
	const height = window.innerHeight * 0.5;
	canvas.setAttribute("width", width);
	canvas.setAttribute("height", height);
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = Color(c || "#555").hex();
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	return {
		url: canvas.toDataURL(),
		...fit({ width, height }),
	};
}