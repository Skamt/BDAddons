new class SpotifyListenAlong extends Disposable {
	Init() {
		this.patches = [Patcher.after(DeviceStore, 'getActiveSocketAndDevice', (_, args, ret) => {
			if (ret?.socket) ret.socket.isPremium = true;
			return ret;
		})];
	}
}