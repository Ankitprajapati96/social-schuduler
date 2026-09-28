import { useEffect, useState } from "react"
import { PLATFORMS } from "../assets/assets"
import { ArrowRightIcon, CalendarIcon, ClockIcon, HistoryIcon, Loader2Icon, TimerIcon, Wand2Icon, XIcon, SparklesIcon } from "lucide-react"
import toast from "react-hot-toast"
import api from "../api/axios"

const AIComposer = () => {
  const [prompt, setPrompt] = useState("")
  const [tone, setTone] = useState("Professional")
  const [generateImage, setGenerateImage] = useState(true)
  const [loading, setLoading] = useState(false)
  const [generations, setGenerations] = useState<any[]>([])

  // Scheduling state - Default to 'linkedin'
  const [activeScheduler, setActiveScheduler] = useState<any>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin"])
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [scheduling, setScheduling] = useState(false)

  const fetchGenerations = async () => {
    try {
      const { data } = await api.get("/api/posts/generations")
      setGenerations(data)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message)
    }
  }

  useEffect(() => {
    fetchGenerations()
  }, [])

  const handleOpenScheduler = (gen: any) => {
    setActiveScheduler(gen)
    setSelectedPlatforms(["linkedin"]) // Ensure LinkedIn is pre-selected
  }

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt")
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post("/api/posts/generate", { prompt, tone, generateImage })
      setGenerations([data, ...generations])
      setActiveScheduler(data)
      setSelectedPlatforms(["linkedin"]) // Auto-select LinkedIn for newly generated post
      toast.success("Content generated!")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async () => {
    if (!activeScheduler) return
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform")
      return
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error("Select date and time")
      return
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
    setScheduling(true)
    try {
      await api.post("/api/posts", {
        content: activeScheduler.content,
        mediaUrl: activeScheduler.mediaUrl,
        mediaType: activeScheduler.mediaType,
        platforms: selectedPlatforms,
        scheduledFor,
        status: "scheduled",
      })
      toast.success("AI Post scheduled successfully!")
      setActiveScheduler(null)
      setScheduledDate("")
      setScheduledTime("")
      setSelectedPlatforms(["linkedin"])
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to schedule")
    } finally {
      setScheduling(false)
    }
  }

  const tones = ["Professional", "Creative", "Funny", "Minimalist", "Excited"]

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">

      {/* Input section */}
      <div className="space-y-6 text-center mt-20">
        <h1 className="text-3xl text-slate-700 tracking-tight font-medium">What should we create today?</h1>
        <div className="relative group mt-12">
          <textarea
            className="w-full px-6 py-6 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-slate-400 transition resize-none h-40 shadow-xs"
            placeholder="Share your idea... (e.g. A post about the launch of our new eco-friendly coffee beans)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="absolute bottom-4 right-2.5 flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setGenerateImage(!generateImage)}
              className="flex items-center gap-3 bg-red-50 hover:bg-red-100/70 py-2 px-3 rounded-lg transition-colors cursor-pointer"
            >
              <span className="font-medium text-xs text-slate-700">AI Image</span>
              <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${generateImage ? "bg-red-500" : "bg-slate-200"}`}>
                <span className={`pointer-events-none size-4 transform translate-y-0.5 rounded-full bg-white transition duration-200 ${generateImage ? "translate-x-4.5" : "translate-x-0.5"}`} />
              </div>
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>Generate</span>
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {tones.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                tone === t
                  ? "bg-red-500 border-red-500 text-white shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* AI Generated posts */}
      <div className="space-y-6 pt-12 border-t border-slate-100">
        <div className="flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-2">
            <HistoryIcon className="size-5 text-slate-400" />
            <h2 className="font-semibold text-slate-700">Recent Generations</h2>
          </div>
          <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
            {generations.length} total
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {generations.map((gen) => (
            <div key={gen._id} className="group bg-white rounded-2xl border border-slate-100 p-5 hover:border-red-200 transition-all relative overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(gen.createdAt).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-red-500 bg-red-50 px-2 py-0.5 rounded-md font-medium">
                    {gen.tone}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                  {gen.content}
                </p>

                {gen.mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 mt-2">
                    <img
                      src={gen.mediaUrl}
                      alt="Gen"
                      className="w-full aspect-video object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 mt-auto">
                <button
                  type="button"
                  onClick={() => handleOpenScheduler(gen)}
                  className="w-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-700 font-medium text-xs py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <SparklesIcon className="size-3.5" />
                  <span>Schedule Post</span>
                </button>
              </div>
            </div>
          ))}

          {generations.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-2">
              <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                <Wand2Icon className="size-6" />
              </div>
              <p className="text-slate-400 text-sm">No content generated yet. Try generating some content using the AI</p>
            </div>
          )}
        </div>
      </div>

      {/* Scheduler Modal */}
      {activeScheduler && (
        <div className="fixed inset-0 min-h-screen z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-100 overflow-hidden flex flex-col max-h-[88vh]">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-4 text-red-500" />
                <h3 className="text-sm font-semibold text-slate-900">Schedule Post</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveScheduler(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <XIcon className="size-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Content Preview Box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Generated Content</span>
                <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">
                  {activeScheduler.content}
                </p>

                {/* Visible Media Preview */}
                {activeScheduler.mediaUrl && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 max-h-48 flex items-center justify-center bg-slate-100">
                    <img
                      src={activeScheduler.mediaUrl}
                      alt="Generated Preview"
                      className="w-full h-auto max-h-48 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Channel Selector */}
{/* Channel Selector - All Platforms Active */}
<div className="space-y-2 pt-2">
  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
    Select Channels
  </label>
  <div className="flex items-center gap-2">
    {PLATFORMS.map((p) => {
      const active = selectedPlatforms.includes(p.id);

      return (
        <button
          key={p.id}
          type="button"
          onClick={() =>
            setSelectedPlatforms((prev) =>
              prev.includes(p.id)
                ? prev.filter((x) => x !== p.id)
                : [...prev, p.id]
            )
          }
          className={`p-2.5 rounded-lg border text-xs transition-all flex items-center justify-center cursor-pointer ${
            active
              ? "bg-slate-900 border-slate-900 text-white shadow-sm"
              : "bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800"
          }`}
          title={p.title || p.name || p.id}
        >
          <p.icon className="size-4" />
        </button>
      );
    })}
  </div>
</div>

              {/* Date & Time Picker */}
              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Schedule Time
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <CalendarIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-red-400 transition-all cursor-pointer"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <ClockIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="time"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-red-400 transition-all cursor-pointer"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSchedule}
                disabled={scheduling || !scheduledDate || !scheduledTime || selectedPlatforms.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-xs transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {scheduling ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <TimerIcon className="size-4" />
                )}
                <span>Schedule Post</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default AIComposer