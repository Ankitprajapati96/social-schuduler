import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Calendar as CalendarIcon, Clock, Share2, ChevronLeft, ChevronRight } from "lucide-react";

interface PostItem {
  _id: string;
  content: string;
  scheduledFor: string;
  platforms: string[];
  mediaUrl?: string;
  status: string;
}

const CalendarView: React.FC = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/api/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Month navigation helpers
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate days for the grid
  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null); // Empty slots for previous month padding
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(new Date(year, month, d));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="size-6 text-indigo-600" />
            Content Calendar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visual overview of all your scheduled and published posts.
          </p>
        </div>

        {/* Month Switcher Controls */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
          <button onClick={prevMonth} className="text-slate-500 hover:text-slate-800 transition-colors">
            <ChevronLeft className="size-5" />
          </button>
          <span className="font-semibold text-slate-800 w-36 text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="text-slate-500 hover:text-slate-800 transition-colors">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Days Header */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-slate-100">
          {daysArray.map((dateObj, index) => {
            if (!dateObj) {
              return <div key={`empty-${index}`} className="bg-slate-50/50 min-h-[120px]" />;
            }

            const dateString = dateObj.toISOString().split("T")[0];
            const dayPosts = posts.filter((p) => {
              if (!p.scheduledFor) return false;
              return p.scheduledFor.split("T")[0] === dateString;
            });

            const isToday = new Date().toISOString().split("T")[0] === dateString;

            return (
              <div
                key={dateString}
                className={`bg-white min-h-[120px] p-2 flex flex-col transition-colors hover:bg-slate-50/80 ${
                  isToday ? "bg-indigo-50/20" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold size-6 rounded-full flex items-center justify-center ${
                      isToday ? "bg-indigo-600 text-white" : "text-slate-700"
                    }`}
                  >
                    {dateObj.getDate()}
                  </span>
                </div>

                {/* Posts Chips inside the day cell */}
                <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[90px]">
                  {dayPosts.map((post) => {
                    const isPublished = post.status === "published";
                    return (
                      <div
                        key={post._id}
                        onClick={() => setSelectedPost(post)}
                        className={`text-xs px-2 py-1 rounded-md truncate cursor-pointer font-medium border transition-all shadow-2xs ${
                          isPublished
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                        }`}
                        title={post.content}
                      >
                        {post.content}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  selectedPost.status === "published"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {selectedPost.status?.toUpperCase()}
              </span>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            {selectedPost.mediaUrl && (
              <img
                src={selectedPost.mediaUrl}
                alt="Post Media"
                className="w-full h-44 object-cover rounded-xl mb-4 border border-slate-100"
              />
            )}

            <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed mb-4">
              {selectedPost.content}
            </p>

            <div className="text-xs text-slate-500 space-y-1.5 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-slate-400" />
                <span>{new Date(selectedPost.scheduledFor).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Share2 className="size-3.5 text-slate-400" />
                <span>Platforms: {selectedPost.platforms?.join(", ") || "None"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;