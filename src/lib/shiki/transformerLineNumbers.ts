import type { ShikiTransformer } from "shiki";

// Pre-compile regex for better performance
const LINE_NUMBERS_REGEX = /^showLineNumbers(?:=(\d{1,3}))?$/;

export function transformerLineNumbers(): ShikiTransformer {
  return {
    pre(hast) {
      const rawMeta = this.options.meta?.__raw;
      if (!rawMeta) {
        return;
      }

      // More efficient: check if showLineNumbers exists before splitting
      if (!rawMeta.includes("showLineNumbers")) {
        return;
      }

      const metaValues = rawMeta.split(" ");
      let match = null;
      
      for (const value of metaValues) {
        match = value.match(LINE_NUMBERS_REGEX);
        if (match) {
          break;
        }
      }

      if (!match) {
        return;
      }

      this.addClassToHast(hast, "show-line-numbers");
      
      if (match[1]) {
        const startingNumber = parseInt(match[1], 10);
        // Have to set -1 because step is incremented directly
        hast.properties.style += `;--starting-line-number: ${startingNumber - 1};`;
      }
    },
  };
}
