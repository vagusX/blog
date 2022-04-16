import React from 'react';
import pkg from '../package.json';

const utterancesAttrs = {
  repo: new URL(pkg.repository.url).pathname.slice(1).split('.')[0],
  'issue-term': 'title',
  label: '✨💬✨',
  theme: 'github-light',
  id: 'utterances',
  src: 'https://utteranc.es/client.js',
  'cross-origin': true,
  async: true,
};

const Comments = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current || containerRef.current.querySelector('script#utterances')) {
      return;
    }

    const script = document.createElement('script');
    (Object.keys(utterancesAttrs) as Array<keyof typeof utterancesAttrs>)
      .forEach((attrKey) => {
        script.setAttribute(attrKey, utterancesAttrs[attrKey] as any);
      });

    containerRef.current.appendChild(script);

    return () => {
      while (containerRef.current?.lastChild) {
        containerRef.current?.removeChild(containerRef.current?.lastChild);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="mt-8" />
  );
};

export default Comments;
