import { defineConfig, toEscapedSelector as e, presetUno } from "unocss";
import transformerVariantGroup from "@unocss/transformer-variant-group";

export default defineConfig({
  // ...UnoCSS options
  presets: [presetUno({ dark: "class", attributify: false })],
  transformers: [transformerVariantGroup()]
});
