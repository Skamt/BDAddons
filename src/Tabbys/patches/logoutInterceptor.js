import Plugin from "@common/Plugin";
import { Dispatcher } from "@Discord/Modules";

function interceptor(e) {
	if (e.type !== "LOGOUT") return;
	e.goHomeAfterSwitching = false;
}

Plugin.onStart(() => {
	Dispatcher.addInterceptor(interceptor);

	Plugin.onStop(
		() => {
			const index = Dispatcher._interceptors.indexOf(interceptor);
			Dispatcher._interceptors.splice(index, 1);
		},
		{ once: true },
	);
});
