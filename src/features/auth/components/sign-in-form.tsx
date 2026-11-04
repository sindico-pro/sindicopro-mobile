import { zodResolver } from '@hookform/resolvers/zod'
import * as WebBrowser from 'expo-web-browser'
import { Lock, Mail } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { signInSchema, type SignInValues } from '@/features/auth/sign-in-schema'
import { Spacing } from '@/constants/theme'
import { getWebUrl } from '@/lib/env'
import { useTheme } from '@/hooks/use-theme'

type SignInFormProps = {
  error?: string | null
  onSubmit: (values: SignInValues) => Promise<boolean | void>
}

export function SignInForm({ error, onSubmit }: SignInFormProps) {
  const theme = useTheme()
  const [linkError, setLinkError] = useState<string | null>(null)
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })
  const submitting = useRef(false)
  async function submit() {
    await form.handleSubmit(async (values) => {
      if (submitting.current) return
      submitting.current = true
      try {
        const success = await onSubmit(values)
        if (success !== false) form.resetField('password')
      } finally {
        submitting.current = false
      }
    })()
  }

  useEffect(() => {
    if (error) {
      AccessibilityInfo.announceForAccessibility(error)
    }
  }, [error])

  return (
    <View style={styles.form}>
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            label="E-mail"
            leading={<Mail color={theme.textSecondary} size={18} />}
            ref={field.ref}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            error={fieldState.error?.message}
            inputMode="email"
            keyboardType="email-address"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            onSubmitEditing={() => form.setFocus('password')}
            returnKeyType="next"
            textContentType="emailAddress"
            value={field.value}
          />
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <TextField
            label="Senha"
            leading={<Lock color={theme.textSecondary} size={18} />}
            ref={field.ref}
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect={false}
            error={fieldState.error?.message}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            onSubmitEditing={() => {
              void submit()
            }}
            returnKeyType="done"
            secureToggle
            textContentType="password"
            value={field.value}
          />
        )}
      />
      <Pressable
        accessibilityRole="link"
        onPress={() => {
          const url = getWebUrl()
          if (!url) {
            setLinkError('Configure EXPO_PUBLIC_WEB_URL para recuperar a senha.')
            return
          }
          setLinkError(null)
          void WebBrowser.openBrowserAsync(`${url.replace(/\/$/, '')}/forgot-password`)
        }}>
        <ThemedText style={styles.forgot} themeColor="primaryText" type="small">
          Esqueceu a senha?
        </ThemedText>
      </Pressable>
      {linkError ? (
        <ThemedText accessibilityLiveRegion="polite" themeColor="danger" type="small">
          {linkError}
        </ThemedText>
      ) : null}
      {error ? (
        <ThemedText accessibilityLiveRegion="polite" accessibilityRole="alert" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
      <Button
        label="Entrar"
        loading={form.formState.isSubmitting}
        onPress={() => {
          void submit()
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.four,
    alignSelf: 'stretch',
  },
  forgot: {
    textAlign: 'right',
  },
})
