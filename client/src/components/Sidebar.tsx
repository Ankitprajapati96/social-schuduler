import React from 'react'
import { NavLink, Link} from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  Sparkles,
  Zap,
  CalendarDays,
  LogOutIcon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Accounts', path: '/accounts', icon: Users },
  { name: 'Scheduler', path: '/scheduler', icon: Send },
  { name: 'AI Composer', path: '/ai-composer', icon: Sparkles },
  { name: 'Calendar', path: '/calendar', icon: CalendarDays }
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-50 w-64 h-full bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Top Part: Logo + Menu */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* App Logo Header - PostPulse Brand */}
        {/* App Logo Header - Clickable Link to Home */}
        <Link 
          to="/" 
          onClick={() => setIsOpen(false)}
          className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 shrink-0 hover:bg-slate-50/60 transition-colors cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-sm shrink-0">
            <Zap className="size-4.5 fill-white text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-base tracking-tight leading-tight">
              PostPulse
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Workspace
            </span>
          </div>
        </Link>

        {/* Menu List */}
        <div className="p-4">
          <p className="text-[11px] font-semibold text-slate-400 tracking-wider px-3 mb-2.5">
            MENU
          </p>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all outline-none ${
                      isActive
                        ? 'bg-indigo-50/80 text-indigo-600 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`size-4.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                      
                      {isActive && (
                        <span className="absolute right-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-l-full" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Footer: Bilkul Bottom Par */}
      <div className="p-4 border-t border-slate-100 bg-white shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="size-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-xs">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="flex-1 min-w-0"> 
            <div className="text-sm font-medium text-slate-800 truncate">{user?.name}</div>
            <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>

        <button 
          type="button"
          onClick={logout} 
          className='mt-1 flex items-center gap-2 px-3 py-2 w-full rounded-xl text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer'
        >
          <LogOutIcon className='size-4' />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar;