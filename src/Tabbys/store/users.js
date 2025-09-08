import zustand, { subscribeWithSelector } from "@Discord/zustand";


export default {
	state: { user: null },
	actions: {
		setUser(user) {
			this.setState({ user });
		}
	}
};
