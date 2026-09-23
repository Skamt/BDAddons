import { getModule, Filters } from "@Webpack";
const NitroManager = getModule(Filters.bySource("hasThemeColors(){"), {
	declarationFilter: (a) => a.prototype.getLegacyUsername,
});

module.exports = () => ({
	stop() {},
	start() {
		if (!NitroManager) return console.error("[NoProfileThemes] Could not patch NitroManager");
		const propertyDescriptor = Object.getOwnPropertyDescriptor(
			NitroManager.prototype,
			"canUsePremiumProfileCustomization",
		);

		Object.defineProperty(NitroManager.prototype, "canUsePremiumProfileCustomization", {
			get() {
				return BdApi.Webpack.Stores.UserStore.getCurrentUser().id === this.userId;
			},
		});

		this.stop = () =>
			Object.defineProperty(
				NitroManager.prototype,
				"canUsePremiumProfileCustomization",
				propertyDescriptor,
			);
	},
});
