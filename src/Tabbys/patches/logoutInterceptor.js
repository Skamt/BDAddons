import Plugin, { Events } from "@Utils/Plugin";
import { Dispatcher } from "@Discord/Modules";

Plugin.on(Events.START, () => {
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