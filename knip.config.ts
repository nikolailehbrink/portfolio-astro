import type { KnipConfig } from "knip";

export default {
  compilers: {
    css: (text: string) => {
      // https://github.com/webpro-nl/knip/issues/1008#issuecomment-2756572278
      text = text.replace("@plugin", "@import");
      return [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n");
    },
  },
  ignoreBinaries: ["dotenv"],
  ignoreFiles: ["src/layouts/LegalLayout.astro"],
  // llamaindex/vercel throws error without llamaindex package
  // @react-email/preview-server is used for email previews only
  // @typescript-eslint/parser is used to make ESLint VSCode Extension work in Astro files: https://github.com/ota-meshi/eslint-plugin-astro?tab=readme-ov-file#-installation
  ignoreDependencies: [
    "@react-email/preview-server",
    "llamaindex",
    "@typescript-eslint/parser",
  ],
  // https://github.com/webpro-nl/knip/issues/1149#issuecomment-2994091874
  commitlint: true,
} satisfies KnipConfig;
