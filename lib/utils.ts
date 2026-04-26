import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDeadline(deadline: string | null): string {
  if (!deadline) return "No deadline"
  
  const date = new Date(deadline)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return "Overdue"
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays <= 7) return `${diffDays} days`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export function calculateXP(deadline: string | null, completedAt: string | null): number {
  if (!deadline || !completedAt) return 0
  
  const deadlineDate = new Date(deadline)
  const completedDate = new Date(completedAt)
  const diffTime = completedDate.getTime() - deadlineDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 0) return 10 // On-time completion
  
  // Overdue penalty: -2 per day, capped at -10
  const penalty = Math.min(-2 * diffDays, -10)
  return 10 + penalty
}
