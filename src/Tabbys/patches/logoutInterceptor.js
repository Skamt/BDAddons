import Plugin from "@common/Plugin";
import { Dispatcher } from "@Discord/Modules";

Plugin.onStart(() => {
	function interceptor(e) {
		if (e.type !== "LOGOUT") return;
		e.goHomeAfterSwitching = false;
	}
	Dispatcher.addInterceptor(interceptor);

	Plugin.once(Events.STOP, () => {
		const index = Dispatcher._interceptors.indexOf(interceptor);
		Dispatcher._interceptors.splice(index, 1);
	});
});