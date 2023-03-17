
const config = {{ PLUGIN__CONFIG }};

{{ PLUGIN__BODY }}

const BM_CSS = `.bm-container.closing .backdrop{
	animation:hide-backdrop 300ms ease-in;
}

#bm-container .backdrop{
	animation:show-backdrop 300ms ease-out;
}

@keyframes show-backdrop {
	from{ opacity:0; }
	to{ opacity:.85; }
}

@keyframes hide-backdrop {
	from{ opacity:.85; }
	to{ opacity:0;}
}


#bm-container .modal{
	animation:show-modal 300ms ease-out;
}
#bm-container.closing .modal{
	animation:hide-modal 300ms ease-in;
}

@keyframes show-modal {
	from{
		transform: scale(0);
		opacity:0;
	}
	to{
		opacity:.85;
		transform: scale(1);
	}
}

@keyframes hide-modal {
	from{
		opacity:.85;
		transform: scale(1);
	}
	to{
		transform: scale(0);
		opacity:0;
	}
}

#bm-container{
	position: fixed;
	z-index:999999;
	top: 0;
	left: 0;
	right:0;
	bottom:0;
	display:flex;
	overflow:hidden;
}


#bm-container .backdrop{
	background: var(--black-500);
	position: absolute;
	z-index:-1;
	top: 0;
	left: 0;
	right:0;
	bottom:0;
	opacity:.85;
}

#bm-container .modal {
	display: inline-flex;
	flex-direction: column;
	background: #57616f;
	color: white;
	overflow: hidden;
	border-radius: 8px;
	margin:auto;
	max-width:500px;
	max-height: 60vh;
}

#bm-container .head {
	background: #25272a;
	padding: 20px;
}

#bm-container .head > h2{
	font-size:1.5rem;
	font-weight: bold;
}

#bm-container .body {
	background: #313437;
	padding: 10px;
	display:flex;
	flex-direction:column;
	min-height:0;
}


#bm-container .note{
	color: var(--text-normal);
	font-size: 1rem;
	line-height: 20px;
}

#bm-container .bm{
	margin:10px 0;
	text-decoration:underline;
	font-size: 1.30em;
	font-weight: bold;
}

#bm-container .modules{
	padding:10px;
	display:flex;
	flex-direction:column;
	overflow:hidden auto;
}

#bm-container .modules::-webkit-scrollbar { width: 2px;}
#bm-container .modules::-webkit-scrollbar-thumb { background-color:orange;}

#bm-container .module{
	margin:5px;
	padding:5px;
	background:#27292b;
	border-radius: 5px;
	display:flex;
}

#bm-container .num{
	align-self:center;
	padding:5px;
	margin-right:5px;
	border-right:3px solid #8b8b8b;
	font-size: 1.5em;
	font-weight: bold;
}


#bm-container .name{
	display: block;
	line-height: 24px;
	font-size: 16px;
	font-weight: 700;
	color: var(--header-primary);
}

#bm-container .errormessage{
	margin:0;
	font-size: 13px;
	line-height: 20px;
	color: var(--header-secondary);
}

#bm-container .footer {
	background: #25272a;
	padding: 10px;
	display:flex;
}

#bm-container button{
	margin-left:auto;
	border-radius: 3px;
	border: none;
	min-width: 96px;
	min-height: 38px;
	width: auto;
	color: var(--white-500);
	background-color: var(--brand-experiment);
}

#bm-container button:hover {
	background-color: var(--brand-experiment-560);
}

#bm-container button:active {
	background-color: var(--brand-experiment-600);
}
#bm-container.hide{
	display:none;
}`

function showBrokenModulesAlert(modules) {
	if(!document.querySelector('head > bd-head > bd-styles > #bm'))
		BdApi.DOM.addStyle('bm',BM_CSS);
	
	const template = document.createElement("template");
	template.innerHTML = `<div id="bm-container">
							<div class="backdrop"></div>
							<div class="modal">
								<div class="head">
									<h2>${config.info.name}</h2>
								</div>
								<div class="body">
									<p class="note">Detected some Missing modules, certain aspects of the plugin may not work properly.</p>
									<h3 class="bm">Broken Modules:</h3>
									<div class="modules">
										${modules.map(([moduleName, errorNote],i) => `<div class="module">
											<h2 class="num">${++i}</h2>
											<div>
												<h3 class="name">${moduleName}</h3>
												<p class="errormessage">${errorNote}</p>
											</div>
										</div>`).join('')}
									</div>
								</div>
								<div class="footer">
									<button class="close-btn">Close</button>
								</div>
							</div>
						</div>`;

	const modal = template.content.firstElementChild.cloneNode(true);
	modal.onclick = (e) => {
		if(e.target.classList.contains('close-btn') || e.target.classList.contains('backdrop')){
			modal.classList.add("closing");
			setTimeout(()=>{modal.remove();},150);
		}
	};
	document.querySelector('bd-body').append(modal);
}

function getErrorPlugin(message) {
	return () => ({
		stop() {},
		start() {
			BdApi.alert(config.info.name, message);
		}
	})
}

function checkModules(modules) {
	return Object.entries(modules).reduce((acc, [moduleName, { module, fallback, errorNote, isBreakable, withKey }]) => {
		if ((withKey && !module.module) || !module) {
			if (isBreakable) acc[0] = true;
			acc[2].push([moduleName, errorNote]);
			if (fallback) acc[1][moduleName] = fallback;
		} else
			acc[1][moduleName] = module;
		return acc;
	}, [false, {}, []]);
}

function ensuredata() {
	return BdApi.Data.load(config.info.name, 'brokenModulesData') || {
		version: config.info.version,
		errorPopupCount: 0,
		savedBrokenModules: []
	};
}

function setPluginMetaData() {
	const { version, changelog = false } = ensuredata();
	if (version != config.info.version || !changelog) {
		// TODO showChangelog();
		BdApi.Data.save(config.info.name, 'brokenModulesData', {
			version: config.info.version,
			changelog: true,
			errorPopupCount: 0,
			savedBrokenModules: []
		});
	}
}

function handleBrokenModules(brokenModules) {
	const current = ensuredata();

	const newBrokenModules = brokenModules.some(([newItem]) => !current.savedBrokenModules.includes(newItem));
	const isUpdated = current.version != config.info.version;
	const isPopupLimitReached = current.errorPopupCount === 3;

	if (isUpdated || !isPopupLimitReached || newBrokenModules) {
		showBrokenModulesAlert(brokenModules);

		BdApi.Data.save(config.info.name, 'brokenModulesData', {
			...current,
			version: current.version,
			errorPopupCount: (current.errorPopupCount + 1) % 4,
			savedBrokenModules: brokenModules.map(([moduleName]) => moduleName)
		});
	}
}

function initPlugin() {
	setPluginMetaData();
	const [ParentPlugin, Api] = global.ZeresPluginLibrary.buildPlugin(config);
	const { Modules, Plugin } = main(Api);

	const [pluginBreakingError, SafeModules, BrokenModules] = checkModules(Modules);
	if (pluginBreakingError)
		return getErrorPlugin([
			"**Plugin is broken:** Take a screenshot of this popup and show it to the dev.",
			`\`\`\`md\nMissing modules:\n\n${BrokenModules.map(([moduleName],i) => `${++i}. ${moduleName}`).join('\n')}\`\`\``
		]);
	else {
		if (BrokenModules.length > 0)
			handleBrokenModules(BrokenModules);
		return Plugin(ParentPlugin, SafeModules);
	}
}

module.exports = !global.ZeresPluginLibrary ?
	getErrorPlugin(["**Library plugin is needed**",
		`**ZeresPluginLibrary** is needed to run **${this.config.info.name}**.`,
		"Please download it from the officiel website",
		"https://betterdiscord.app/plugin/ZeresPluginLibrary"
	]) :
	initPlugin();