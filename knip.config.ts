import type { KnipConfig } from "knip";

export default {
  // TODO: Why is the Vitest plugin not picking it up automatically?
  entry: ["**/*.test.ts"],
  compilers: {
    css: (text: string) => {
      // https://github.com/webpro-nl/knip/issues/1008#issuecomment-2756572278
      text = text.replace("@plugin", "@import");
      return [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n");
    },
  },
  ignoreBinaries: ["dotenv"],
  ignoreFiles: ["src/layouts/LegalLayout.astro"],
  // llamaindex/vercel throws error without llamaindex package and @react-email/preview-server is used for email previews only
  ignoreDependencies: ["@react-email/preview-server", "llamaindex"],
  // https://github.com/webpro-nl/knip/issues/1149#issuecomment-2994091874
  commitlint: true,
} satisfies KnipConfig;
