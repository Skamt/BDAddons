new class ConsoleToggleButton{
	constructor(){
		this.once = false;
	}
	
	Init() {
		nativeModules.default = { ...nativeModules.default, setObservedGamesCallback: () => {} };
		this.once = true;
	}
}