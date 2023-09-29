import { React, Data, UI } from "@Api";

const changelogStyles = `
#changelog-container {
	font-family: "gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
	--added: #2dc770;
	--improved: #949cf7;
	--fixed: #f23f42;
	--notice: #f0b132;
	color:white;

    padding: 10px;
    max-width: 450px;
}
#changelog-container .title {
    text-transform: uppercase;
    display: flex;
    align-items: center;
    font-weight: 700;
    margin-top: 20px;
}
#changelog-container .title:after {
    content: "";
    height: 1px;
    flex: 1 1 auto;
    margin-left: 8px;
    opacity: .6;
    background: currentColor;
}
#changelog-container ul {
    list-style: none;
    margin: 20px 0 8px 20px;
}
#changelog-container ul > li {
    position:relative;
    line-height: 20px;
    margin-bottom: 8px;
    color: #c4c9ce;
}
#changelog-container ul > li:before {
    content: "";
    position: absolute;
    background:currentColor;
    top: 10px;
    left: -15px;
    width: 6px;
    height: 6px;
    margin-top: -4px;
    margin-left: -3px;
    border-radius: 50%;
    opacity: .5;
}`;

function ChangelogComponent({ id, changelog }) {
	React.useEffect(() => {
		BdApi.DOM.addStyle(id, changelogStyles);
		return () => BdApi.DOM.removeStyle(id);
	}, []);
	return <div id="changelog-container">{changelog}</div>;
}

function showChangelog() {
	if (!config.changelog || !Array.isArray(config.changelog)) return;
	const changelog = config.changelog.map(({ title, type, items }) => [
		<h3
			style={{ "color": `var(--${type})` }}
			className="title">
			{title}
		</h3>,
		<ul>
			{items.map(item => (
				<li>{item}</li>
			))}
		</ul>
	]);

	UI.showConfirmationModal(
		`${config.info.name} v${config.info.version}`,
		<ChangelogComponent
			id={`Changelog-${config.info.name}`}
			changelog={changelog}
		/>
	);
}

export default function shouldChangelog() {
	const { version = config.info.version, changelog = false } = Data.load("metadata") || {};

	if (version == config.info.version || changelog) return;
	Data.save("metadata", { version: config.info.version, changelog: true });
	return showChangelog;
}
