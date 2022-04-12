import { remark } from "remark";
import html from "remark-html";

import { rehype } from "rehype";
import rehypeHighlight from "rehype-highlight";

export default async function markdownToHtml(markdown: string) {
  const vfile = await remark().use(html).process(markdown);
  const result = await rehype().use(rehypeHighlight).process(vfile);
  return result.toString();
}
