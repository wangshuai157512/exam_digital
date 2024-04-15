import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import progress from "vite-plugin-progress";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import {
  createStyleImportPlugin,
  ElementPlusResolve
} from "vite-plugin-style-import";
import { presetTypography, presetUno } from "unocss";
import UnoCSS from "unocss/vite";
// import { viteMockServe } from "vite-plugin-mock";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // const root = process.cwd();
  // const { VITE_GLOB_API_URL } = loadEnv(mode, root);
  return {
    plugins: [
      //vue插件
      vue(),
      //vue jsx插件
      vueJsx(),
      //打包进度条
      progress(),
      // icons
      Icons({
        autoInstall: true
      }),
      // 按需引入组件
      AutoImport({
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/ // .md
        ],
        dts: true,
        imports: ["vue", "vue-router"],
        resolvers: [
          ElementPlusResolver(), // 自动导入图标组件
          IconsResolver({
            prefix: "Icon"
          })
        ]
      }),
      // 按需注册ElementPlus组件
      Components({
        dts: true,
        resolvers: [
          ElementPlusResolver(),
          // 自动注册图标组件
          IconsResolver({
            enabledCollections: ["ep"]
          })
        ]
      }),
      // 按需引入ElementPlus样式
      createStyleImportPlugin({
        resolves: [ElementPlusResolve()],
        libs: [
          {
            libraryName: "element-plus",
            esModule: true,
            resolveStyle: (name) => {
              return `element-plus/theme-chalk/${name}.css`;
            }
          }
        ]
      }),
      // 原子css
      UnoCSS({
        presets: [presetUno(), presetTypography()]
      }),
      // mock
      // viteMockServe({
      //   mockPath: "mock",
      //   localEnabled: command === "serve"
      // })
    ],
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "./src")
        },
        {
          find: "~",
          replacement: resolve(__dirname, "./src/assets")
        }
      ]
    },
    build: {
      cssCodeSplit: true,
      sourcemap: false,
      target: "modules",
      chunkSizeWarningLimit: 550,
      assetsInlineLimit: 4096,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: false, // 生产环境去除console
          drop_debugger: true // 生产环境去除debugger
        }
      }
    },
    optimizeDeps: {
      //依赖预构建
      include: ["vue", "vue-router", "element-plus", "axios", "echarts"]
    }
  };
});
