new class FiltersText extends Disposable {
	Init() {
		let results = DiscordModules.ALL
			.map(([name, result]) => {
				if (Array.isArray(result)) {
					return React.createElement('ul', null, [
						result.map((m, i) =>
							React.createElement('li', { style: { marginLeft:"20px",color: m ? "lime" : "red" } }, `${i}:${name}`)
						)
					])
				}
				return React.createElement('div', { style: { color: result ? "lime" : "red" } }, name);
			});

		BdApi.showConfirmationModal("Modules TEST", React.createElement('div', {
			style: {
				maxHeight: "500px",
				overflow: "auto",
				display: "flex",
				flexDirection: "column"
			}
		}, results));
		this.Init = nop;
	}
}