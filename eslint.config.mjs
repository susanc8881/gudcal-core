import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import tailwindPlugin from "eslint-plugin-tailwindcss";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...tailwindPlugin.configs["flat/recommended"],
  {
    rules: {
      ...prettierConfig.rules,
      "@next/next/no-html-link-for-pages": "off",
      "react/jsx-key": "off",
      "tailwindcss/no-custom-classname": "off",
      // eslint-plugin-tailwindcss@4.0.0-beta.0 only has partial support for
      // Tailwind v4's CSS-based config (no tailwind.config.js in this
      // project) -- it can't resolve class order and either false-positives
      // on nearly every className or hard-crashes, depending on settings.
      // Revisit once the plugin has real v4 support.
      "tailwindcss/classnames-order": "off",
    },
    settings: {
      tailwindcss: {
        callees: ["cn"],
      },
    },
  },
  {
    ignores: ["app/generated/**", ".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
