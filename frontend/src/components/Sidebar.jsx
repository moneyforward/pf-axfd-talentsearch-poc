import { useState, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, FileText, Plus, User, LogOut } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { cn } from '../lib/utils'
import './Sidebar.css'

const SidebarContext = createContext(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

const SidebarProviderInternal = ({ children, open: openProp, setOpen: setOpenProp, animate = true }) => {
  const [openState, setOpenState] = useState(false)

  const open = openProp !== undefined ? openProp : openState
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const SidebarWrapper = ({ children, open, setOpen, animate }) => {
  return (
    <SidebarProviderInternal open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProviderInternal>
  )
}

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  )
}

export const DesktopSidebar = ({ className, children, ...props }) => {
  const { open, setOpen, animate } = useSidebar()
  return (
    <motion.div
      className={cn('sidebar-desktop', className)}
      animate={{
        width: animate ? (open ? '300px' : '60px') : '300px',
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const MobileSidebar = ({ className, children, ...props }) => {
  const { open, setOpen } = useSidebar()
  return (
    <>
      <div className="sidebar-mobile-header" {...props}>
        <div className="sidebar-mobile-header-content">
          <Menu
            className="sidebar-mobile-menu-icon"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut',
              }}
              className={cn('sidebar-mobile-overlay', className)}
            >
              <div
                className="sidebar-mobile-close"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export const SidebarLink = ({ link, className, onClick, ...props }) => {
  const { open, animate } = useSidebar()
  return (
    <a
      href={link.href}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn('sidebar-link', className)}
      {...props}
    >
      <span className="sidebar-icon-wrapper">
        {link.icon}
      </span>
      <motion.span
        animate={{
          display: animate ? (open ? 'inline-block' : 'none') : 'inline-block',
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
        className="sidebar-link-text"
      >
        {link.label}
      </motion.span>
    </a>
  )
}

const Sidebar = ({ user, onLogout }) => {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false) // Start collapsed

  const links = [
    {
      label: t('app.backfillSearch'),
      href: '#backfill',
      icon: <Search className="sidebar-icon" />,
    },
    {
      label: t('app.jdTemplate'),
      href: '#jd-template',
      icon: <FileText className="sidebar-icon" />,
    },
    {
      label: t('app.jdCreate'),
      href: '#jd-create',
      icon: <Plus className="sidebar-icon" />,
    },
  ]

  return (
    <SidebarWrapper open={open} setOpen={setOpen}>
      <SidebarBody className="sidebar-body">
        <div className="sidebar-content">
          <SidebarLogo />
          <div className="sidebar-nav">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div className="sidebar-footer">
          <SidebarLink
            link={{
              label: user?.name || user?.email || 'User',
              href: '#profile',
              icon: <User className="sidebar-icon" />,
            }}
          />
          <SidebarLink
            link={{
              label: t('app.logout'),
              href: '#logout',
              icon: <LogOut className="sidebar-icon" />,
            }}
            onClick={onLogout}
          />
        </div>
      </SidebarBody>
    </SidebarWrapper>
  )
}

const SidebarLogo = () => {
  const { open, animate } = useSidebar()
  return (
    <a href="#" className="sidebar-logo">
      <img 
        src="/img/images.png" 
        alt="Logo" 
        className="sidebar-logo-image"
      />
      <motion.span
        animate={{
          opacity: animate ? (open ? 1 : 0) : 1,
          display: animate ? (open ? 'inline-block' : 'none') : 'inline-block',
        }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
        className="sidebar-logo-text"
      >
        PF Talent Search
      </motion.span>
    </a>
  )
}

export default Sidebar
