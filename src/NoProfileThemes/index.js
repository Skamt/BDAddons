import Plugin, { Events } from "@Utils/Plugin";
import { Patcher } from "@Api";
import { isSelf } from "@Utils/User";

import { Filters, getModule } from "@Webpack";

const NitroManager = getModule(Filters.bySource("hasThemeColors(){"), { declarationFilter: a => a.prototype.getLegacyUsername });

Plugin.on(Events.START, () => {
	if (!NitroManager) return Logger.patchError("NitroManager");
	let propertyDescriptor = null;

	propertyDescriptor = Object.getOwnPropertyDescriptor(NitroManager.prototype, "canUsePremiumProfileCustomization");

	Object.defineProperty(NitroManager.prototype, "canUsePremiumProfileCustomization", {
		get() {
			return isSelf({ id: this?.userId });
		}
	});

	Plugin.on(Events.STOP, () => {
		Object.defineProperty(NitroManager.prototype, "canUsePremiumProfileCustomization", propertyDescriptor);
	});
});

module.exports = () => Plugin;
