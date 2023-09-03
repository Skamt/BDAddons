import { Patcher, React } from "@Api";

const t = s.moduleById(636877).exports.default;
export default () => {
	if (t)
		Patcher.after(t.prototype, "render", (_, args, ret) => {
			console.log(_, args, ret);
		});
	else Logger.patch("SpotifyControls");
};
