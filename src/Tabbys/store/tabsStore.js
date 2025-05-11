import List from "@Utils/List";

const initialState = {
	tabs: [],
	selectedId: null,
	lastSelectedIdAfterNewTab: null
};

const tabsList = new List("id");

const store = (set, get) => ({
	...initialState,

	reset() {
		tabsList.clear();
		set({ ...initialState });
	},

	setTabs(list = []) {
		if (list.length === 0) return;
		tabsList.setList(list);
		set({ tabs: tabsList.list, selectedId: tabsList.list[0].id });
	},

	createTab(tab) {
		tabsList.addItem(tab);
		set({ tabs: tabsList.list });
	},

	newTab(tab) {
		if (!tab.id) return;
		const state = get();

		tabsList.addItem(tab);
		set({ tabs: tabsList.list, selectedId: tab.id, lastSelectedIdAfterNewTab: state.selectedId });
	},

	removeTab(id) {
		const { selectedId, lastSelectedIdAfterNewTab } = get();
		if (tabsList.length === 1) return;
		const { nextItem: nextTab, previousItem: previousTab } = tabsList.getItemMeta(id);
		tabsList.removeItemByIdentifier(id);

		const isSelected = selectedId === id;
		const newSelected = !isSelected ? selectedId : lastSelectedIdAfterNewTab ? lastSelectedIdAfterNewTab : nextTab ? nextTab.id : previousTab.id;

		set({ tabs: tabsList.list, selectedId: newSelected, lastSelectedIdAfterNewTab: null });
	},

	swapTab(fromTabId, toTabId) {
		tabsList.swapItemById(fromTabId, toTabId);
		set({ tabs: tabsList.list });
	},

	setSelectedId(id) {
		const { getTab } = get();
		const tabToBeSelected = getTab(id);
		if (!tabToBeSelected) return;
		set({ selectedId: id, lastSelectedIdAfterNewTab: null });
	},

	setTab(id, payload) {
		tabsList.setItemById(id, payload);
		set({ tabs: tabsList.list });
	},

	getTab(id) {
		return tabsList.getItemById(id);
	},
	
	getTabIndex(id){
		return tabsList.getItemMeta(id)?.index;
	},

	getCurrentlySelectedTab() {
		return tabsList.getItemById(get().selectedId);
	}

});

const selectors = {
	tabs: state => state.tabs,
	isSingleTab : state => state.tabs.length === 1,
	selectedId: state => state.selectedId,
	lastSelectedIdAfterNewTab: state => state.lastSelectedIdAfterNewTab,
}

export default {
	store,selectors
}