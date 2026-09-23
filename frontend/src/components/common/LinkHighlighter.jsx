import React from 'react';
import { ExternalLink, Copy } from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const LinkHighlighter = ({ text }) => {
  if (!text) return null;

  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  const handleCopy = (url, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    sound.playPop();
  };

  return (
    <span className="whitespace-pre-wrap break-words leading-relaxed text-slate-700">
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-850 text-xs font-mono font-medium hover:bg-orange-100 transition-colors"
            >
              <a
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1 text-orange-700"
                onClick={(e) => e.stopPropagation()}
              >
                <span>{part.replace(/^https?:\/\//, '').split('/')[0]}</span>
                <ExternalLink className="w-3 h-3 text-orange-600" />
              </a>
              <button
                type="button"
                onClick={(e) => handleCopy(part, e)}
                title="Copy link"
                className="p-0.5 rounded text-orange-600 hover:text-orange-900 cursor-pointer"
              >
                <Copy className="w-2.5 h-2.5" />
              </button>
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};
