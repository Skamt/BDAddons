new class FiltersText extends Disposable {
	Init() {
		let results = DiscordModules.ALL.filter(a => !a);
		if (results.length) {
			results.map(([name]) => name);
			BdApi.showConfirmationModal("Broken Modules", React.createElement('div', {
				style: {
					maxHeight: "500px",
					overflow: "auto",
					display: "flex",
					flexDirection: "column"
				}
			}, results));
		}
		this.Init = nop;
	}
}