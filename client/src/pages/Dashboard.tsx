import {
  ActivityIcon,
  CheckCircleIcon,
  ClockIcon,
  Divide,
  SendIcon,
  Share2Icon,
  TrendingUpDown,
  PlayIcon,
  Loader2Icon,
  CalendarIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [stats, setStats] = useState({
    scheduled: 0,
    published: 0,
    connectedAccounts: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [publishingId, setPublishingId] = useState<string | null>(null);

const fetchDashboardData = async () => {
    try {
      const [postsRes, accountsRes, activityRes] = await Promise.all([
        api.get("/api/posts"),
        api.get("/api/accounts"),
        api.get("/api/activity"),
      ]);
      const posts = postsRes.data;
      setStats({
        scheduled: posts.filter((p: any) => p.status === "scheduled").length,
        published: posts.filter((p: any) => p.status === "published").length,
        connectedAccounts: accountsRes.data.filter(
          (a: any) => a.status === "connected",
        ).length,
      });

      setScheduledPosts(
        posts.filter((p: any) => p.status === "scheduled").slice(0, 3),
      );
      setActivities(activityRes.data);
    } catch (error: any) {
      console.error("error fetching dashboard data", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fast-trigger "Publish Now"
  // Fast-trigger "Publish Now"
  const handlePublishNow = async (postId: string) => {
    if (publishingId) return;

    setPublishingId(postId);

    try {
      await api.post(`/api/posts/${postId}/publish-now`);
      toast.success("Post published successfully!");

      // 1. Instant UI update
      setScheduledPosts((prev) => prev.filter((p) => p._id !== postId));
      setStats((prev) => ({
        ...prev,
        scheduled: Math.max(0, prev.scheduled - 1),
        published: prev.published + 1,
      }));

      // 2. Fresh background data fetch (ab crash nahi hoga)
      await fetchDashboardData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to publish now");
    } finally {
      setPublishingId(null);
    }
  };


  // 1. Single Activity Delete Handler
  const handleDeleteActivity = async (activityId: string) => {
    try {
      // Optimistic UI update (screen se turant gayab)
      setActivities((prev) => prev.filter((a) => (a._id || a.id) !== activityId));
      await api.delete(`/api/activity/${activityId}`);
      toast.success("Activity removed");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete activity");
      fetchDashboardData(); // rollback if error
    }
  };

  // 2. Clear All Activities Handler
  const handleClearAllActivities = async () => {
    if (!window.confirm("Are you sure you want to clear all activity logs?")) return;
    try {
      setActivities([]);
      await api.delete("/api/activity");
      toast.success("All activities cleared");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to clear activities");
      fetchDashboardData();
    }
  };

  const statCards = [
    {
      label: "Scheduled Posts",
      value: stats.scheduled,
      icon: ClockIcon,
      trend: "+2 today",
    },

    {
      label: "Published Posts",
      value: stats.published,
      icon: CheckCircleIcon,
      trend: "All time",
    },

    {
      label: "Connected Accounts",
      value: stats.connectedAccounts,
      icon: Share2Icon,
      trend: "Active",
    },
  ];
  return (
    <div className="space-y-8">
      {/* Welcome bar */}
      <div>
        <h2 className="text-2xl text-slate-900">Good Morning!</h2>
        <p>Here's what's happening with your social accounts today </p>
      </div>

      {/* Stats card */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white hover:bg-red-50 relative border border-slate-200 rounded-2xl p-5 hover:border-red-200 transition-all"
          >
            <div className="flex items-center justify-between mb-4 ">
              <div>{card.value}</div>
              <div>
                <TrendingUpDown className="size-3" />
                {card.trend}
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Scheduled Posts with Publish Now */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">
              Upcoming Queue
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {scheduledPosts.length} ready
          </span>
        </div>

        {scheduledPosts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No posts scheduled in queue.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {scheduledPosts.map((post) => (
              <div
                key={post._id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded">
                      Scheduled
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(post.scheduledFor).toLocaleString([], {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 truncate">
                    {post.content}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePublishNow(post._id)}
                  disabled={publishingId !== null}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-red-500 hover:text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {publishingId === post._id ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <PlayIcon className="size-3.5 fill-current" />
                  )}
                  <span>
                    {publishingId === post._id
                      ? "Publishing..."
                      : "Publish Now"}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Feed */}


      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Recent Activities</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {activities.length}
            </span>
          </div>

          {activities.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllActivities}
              className="text-xs font-medium text-slate-400 hover:text-red-600 transition cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-16 py-8">
            <div className="size-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
              <ActivityIcon className="size-6 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium text-sm">No activity yet</p>
            <p className="text-slate-400 text-xs mt-1">
              Connect accounts and schedule posts to see events here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.map((activity) => {
              const actId = activity._id || activity.id;
              return (
                <div
                  key={actId}
                  className="group flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-blue-50 text-blue-600">
                      <SendIcon className="size-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                          Published
                        </span>
                        <span className="text-xs text-slate-400 shrink-0">
                          {new Date(activity.createdAt).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 truncate">
                        {activity.description ||
                          activity.descripition ||
                          activity.content ||
                          activity.message ||
                          "Post activity logged"}
                      </p>
                    </div>
                  </div>

                  {/* Individual Delete Button on Hover */}
                  <button
                    type="button"
                    onClick={() => handleDeleteActivity(actId)}
                    title="Delete log"
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer shrink-0"
                  >
                    <Trash2Icon className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
