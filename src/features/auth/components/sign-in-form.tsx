import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { AccessibilityInfo, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { signInSchema, type SignInValues } from '@/features/auth/sign-in-schema'
import { Spacing } from '@/constants/theme'

type SignInFormProps = {
  error?: string | null
  onSubmit: (values: SignInValues) => Promise<void>
}

export function SignInForm({ error, onSubmit }: SignInFormProps) {
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

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
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect={false}
            error={fieldState.error?.message}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            onSubmitEditing={() => {
              void form.handleSubmit(onSubmit)()
            }}
            returnKeyType="done"
            secureToggle
            textContentType="password"
            value={field.value}
          />
        )}
      />
      {error ? (
        <ThemedText accessibilityLiveRegion="polite" accessibilityRole="alert" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
      <Button
        label="Entrar"
        loading={form.formState.isSubmitting}
        onPress={() => {
          void form.handleSubmit(onSubmit)()
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
    alignSelf: 'stretch',
  },
})
