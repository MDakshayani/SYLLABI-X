import { useState } from 'react'
import { cn } from '../lib/utils'

/**
 * Shows Google profile photo when available, initials otherwise.
 * Gracefully falls back to initials if the image fails to load.
 */
export default function UserAvatar({ user, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false)

  const sizeMap = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const photoUrl = user?.photoURL || user?.photo_url
  const showPhoto = photoUrl && !imgError

  return (
    <div className={cn(
      'rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-md',
      sizeMap[size],
      !showPhoto && 'gradient-bg flex items-center justify-center text-white font-bold',
      className
    )}>
      {showPhoto ? (
        <img
          src={photoUrl}
          alt={user.name || 'User'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
