import { inBrowser } from "vitepress";
import busuanzi from "busuanzi.pure.js";
import DefaultTheme from "vitepress/theme";

import VisitorPanel from "./components/VisitorPanel.vue";

export default {
    ...DefaultTheme,
    enhanceApp({ app, router }) {
        app.component("VisitorPanel", VisitorPanel);
        if (inBrowser) {
            router.onAfterRouteChanged = () => {
                busuanzi.fetch();
            };
        }
    },
}

