import type { ShikiTransformer } from "shiki";

/**
 * A Shiki transformer that processes metadata for code blocks including:
 * - Filename display
 * - Copy button visibility
 *
 * Usage examples:
 * ````
 * ```js filename="example.js"
 * console.log('Hello world')
 * ```
 * ````
 *
 * ````
 * ```js noCopy
 * console.log('Hello world')
 * ```
 * ````
 */

// Pre-compile regex for better performance
const FILENAME_REGEX = /filename="([^"]+)"/;

export function transformerCodeBlock(): ShikiTransformer {
  return {
    name: "transformer-code-block",
    preprocess(code) {
      // Initialize metadata object with code and language
      const metaData: Record<string, string> = {
        "data-code": code,
        "data-language": this.options.lang,
      };

      // Process raw metadata if available
      const rawMeta = this.options.meta?.__raw;
      if (rawMeta) {
        // Use includes for noCopy check (more efficient than split)
        if (rawMeta.includes("noCopy")) {
          metaData["data-no-copy"] = "true";
        }

        // Extract filename using pre-compiled regex
        const filenameMatch = rawMeta.match(FILENAME_REGEX);
        if (filenameMatch?.[1]) {
          metaData["data-filename"] = filenameMatch[1];
        }
      }

      // Update options.meta with all collected metadata
      // Key values in options.meta will be serialized to the attributes of the root <pre> element
      this.options.meta = {
        ...this.options.meta,
        ...metaData,
      };
    },
  };
}
