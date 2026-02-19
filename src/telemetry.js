import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

const reactPlugin = new ReactPlugin();
const appInsights = new ApplicationInsights({
    config: {
        instrumentationKey: import.meta.env.VITE_APP_INSIGHTS_KEY || "869bcbce-5034-44c3-83d5-57a2de4c7259",
        extensions: [reactPlugin],
        enableAutoRouteTracking: true // Tracks page views automatically
    }
});

appInsights.loadAppInsights();

export { reactPlugin, appInsights };

/**
 * Tracks a custom event.
 * @param {string} name - Name of the event.
 * @param {object} properties - Custom properties for the event.
 */
export const trackEvent = (name, properties = {}) => {
    appInsights.trackEvent({ name, properties });
};
