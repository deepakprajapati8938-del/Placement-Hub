import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  slug: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  reaction?: 'happy' | 'disappointed' | 'neutral'
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10', 
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

const reactionOverlays = {
  happy: '😊',
  disappointed: '😔',
  neutral: ''
}

export const Avatar: React.FC<AvatarProps> = ({ 
  slug, 
  size = 'md', 
  className,
  reaction = 'neutral'
}) => {
  const avatarUrl = `/avatars/${slug}.svg`
  const sizeClass = sizeClasses[size]
  const reactionEmoji = reactionOverlays[reaction]

  return (
    <div className={cn(
      "relative rounded-full overflow-hidden bg-border dark:bg-border-dark",
      sizeClass,
      className
    )}>
      <Image
        src={avatarUrl}
        alt={`${slug} avatar`}
        fill
        className="object-cover"
        onError={(e) => {
          // Fallback to default avatar if image fails to load
          const target = e.target as HTMLImageElement
          target.src = '/avatars/default.svg'
        }}
      />
      {reactionEmoji && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center text-xs border border-border">
          {reactionEmoji}
        </div>
      )}
    </div>
  )
}

interface AvatarSelectorProps {
  selected: string
  onSelect: (slug: string) => void
}

const AVATARS = [
  { slug: 'warrior', name: 'Warrior' },
  { slug: 'scholar', name: 'Scholar' },
  { slug: 'ninja', name: 'Ninja' },
  { slug: 'sage', name: 'Sage' },
  { slug: 'builder', name: 'Builder' },
  { slug: 'detective', name: 'Detective' },
  { slug: 'default', name: 'Default' }
]

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ 
  selected, 
  onSelect 
}) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
      {AVATARS.map((avatar) => (
        <button
          key={avatar.slug}
          type="button"
          onClick={() => onSelect(avatar.slug)}
          className={cn(
            "relative aspect-square rounded-lg p-1.5 border-2 transition-all duration-200 ease-out",
            selected === avatar.slug 
              ? 'border-accent-purple bg-accent-purple/5' 
              : 'border-glass-border hover:border-accent-purple/50'
          )}
        >
          <Avatar slug={avatar.slug} size="md" />
          {selected === avatar.slug && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-purple rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
