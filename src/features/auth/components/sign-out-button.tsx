import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useSession } from '@/features/auth/session/session-provider'

export function SignOutButton() {
  const { signOut } = useSession()
  const [loading, setLoading] = useState(false)

  return (
    <Button
      label="Sair"
      loading={loading}
      onPress={() => {
        setLoading(true)
        void signOut().finally(() => setLoading(false))
      }}
      testID="sign-out-button"
      variant="ghost"
    />
  )
}
