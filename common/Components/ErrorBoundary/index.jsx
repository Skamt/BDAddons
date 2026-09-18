import config from "@Config";
import React from "@React";

export default props => <BdApi.Components.ErrorBoundary {...props} name={config?.info?.name} />;
