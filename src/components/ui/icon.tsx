import type { LucideIcon } from 'lucide-react-native'
import type { ColorValue } from 'react-native'

import { useTheme } from '@/hooks/use-theme'

type IconProps = {
  icon: LucideIcon
  color?: ColorValue
  size?: number
}

export function Icon({ icon: Glyph, color, size = 22 }: IconProps) {
  const theme = useTheme()
  return <Glyph color={color ?? theme.primary} size={size} strokeWidth={2} />
}
