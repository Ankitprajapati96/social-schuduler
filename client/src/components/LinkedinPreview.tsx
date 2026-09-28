import React from 'react';
import { Globe, ThumbsUp, MessageSquare, Repeat2, Send, MoreHorizontal, Heart, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PreviewProps {
  content: string;
  mediaUrl?: string | null;
  selectedPlatforms?: string[]; // Dynamic platform array
}

const LinkedInPreview: React.FC<PreviewProps> = ({ 
  content, 
  mediaUrl, 
  selectedPlatforms = ['linkedin'] 
}) => {
  const { user } = useAuth();
  const isTwitter = selectedPlatforms.includes('twitter') && !selectedPlatforms.includes('linkedin');

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-900 font-sans">
      {/* Header */}
      <div className="p-4 pb-2 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-semibold text-base shrink-0 shadow-inner">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 leading-tight">
                {user?.name || 'Your Name'}
              </span>
              
              {/* Dynamic Platform Badges */}
              {selectedPlatforms.includes('linkedin') && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0A66C2] text-white leading-none">
                  in
                </span>
              )}
              {selectedPlatforms.includes('twitter') && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black text-white leading-none">
                  𝕏
                </span>
              )}
            </div>
            
            <p className="text-xs text-slate-500 line-clamp-1 leading-normal">
              {isTwitter ? `@${user?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}` : 'Software Engineer & Creator'}
            </p>
            
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
              <span>Just now</span>
              <span>•</span>
              <Globe className="size-3 text-slate-400" />
            </div>
          </div>
        </div>

        <button type="button" className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50">
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="px-4 py-2 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed break-words min-h-[60px]">
        {content.trim() ? (
          content
        ) : (
          <span className="text-slate-300 italic select-none">
            Start typing in the compose box to preview your post...
          </span>
        )}
      </div>

      {/* Media Attachment */}
      {mediaUrl && (
        <div className="mt-2 px-4 pb-2">
          <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 max-h-[360px] flex items-center justify-center">
            <img
              src={mediaUrl}
              alt="Feed Preview"
              className="w-full h-auto max-h-[360px] object-cover"
            />
          </div>
        </div>
      )}

      {/* Bottom Actions based on Platform */}
      {isTwitter ? (
        <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
          <button type="button" className="flex items-center gap-1 hover:text-blue-500"><MessageSquare className="size-4" /> <span>3</span></button>
          <button type="button" className="flex items-center gap-1 hover:text-green-500"><Repeat2 className="size-4" /> <span>12</span></button>
          <button type="button" className="flex items-center gap-1 hover:text-red-500"><Heart className="size-4" /> <span>48</span></button>
          <button type="button" className="hover:text-blue-500"><Bookmark className="size-4" /></button>
        </div>
      ) : (
        <div className="px-2 py-1 border-t border-slate-100 flex items-center justify-between text-slate-600 text-xs font-medium">
          <button type="button" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg hover:bg-slate-50">
            <ThumbsUp className="size-4 text-slate-500" />
            <span>Like</span>
          </button>
          <button type="button" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg hover:bg-slate-50">
            <MessageSquare className="size-4 text-slate-500" />
            <span>Comment</span>
          </button>
          <button type="button" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg hover:bg-slate-50">
            <Repeat2 className="size-4 text-slate-500" />
            <span>Repost</span>
          </button>
          <button type="button" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg hover:bg-slate-50">
            <Send className="size-4 text-slate-500" />
            <span>Send</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LinkedInPreview;