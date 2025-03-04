import { inBrowser } from "vitepress";
import busuanzi from "busuanzi.pure.js";
import DefaultTheme from "vitepress/theme";

import VisitorPanel from "./components/VisitorPanel.vue";

export default {
    ...DefaultTheme,
    enhanceApp(ctx) {
        DefaultTheme.enhanceApp(ctx);
        ctx.app.component("VisitorPanel", VisitorPanel);
        if (inBrowser) {
            ctx.router.onAfterRouteChanged = () => {
                busuanzi.fetch();
            };
        }
    },
}

