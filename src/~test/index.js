import shouldChangelog from "@Utils/Changelog";


export default () => {
	return {
		start() {
			shouldChangelog()?.();
		},
		stop() {
		}
	}
}