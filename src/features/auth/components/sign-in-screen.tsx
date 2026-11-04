import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { SignInForm } from '@/features/auth/components/sign-in-form'
import { messageForSignInError } from '@/features/auth/errors'
import { useSession } from '@/features/auth/session/session-provider'
import { MaxContentWidth, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

export function SignInScreen() {
  const theme = useTheme()
  const { signIn, signOutReason } = useSession()
  const [error, setError] = useState<string | null>(null)
  const expired = signOutReason === 'expired'
  const gradient =
    theme.background === '#F7F9FA' ? (['#E0F2FE', '#FFFFFF'] as const) : ([theme.background, theme.surface] as const)

  return (
    <LinearGradient colors={gradient} style={styles.flex}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.block}>
            <Image
              accessibilityLabel="Síndico Pro"
              contentFit="contain"
              source={require('@/assets/images/logo.svg')}
              style={styles.logo}
            />
            <View style={styles.intro}>
              <ThemedText accessibilityRole="header" type="smallBold" style={styles.title}>
                Faça login com seu e-mail
              </ThemedText>
              <ThemedText style={styles.subtitle} themeColor="textSecondary">
                Acesse sua conta para continuar.
              </ThemedText>
            </View>
            {signOutReason === 'localOnly' ? (
              <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary" type="small">
                Você saiu deste aparelho. Não foi possível confirmar a saída no servidor.
              </ThemedText>
            ) : null}
            {expired ? (
              <ThemedText accessibilityLiveRegion="polite" themeColor="secondary" type="small">
                Sua sessão expirou. Entre novamente.
              </ThemedText>
            ) : null}
            <SignInForm
              error={error}
              onSubmit={async (values) => {
                setError(null)
                try {
                  await signIn(values.email, values.password)
                  return true
                } catch (caught) {
                  setError(messageForSignInError(caught))
                  return false
                }
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.six,
  },
  block: {
    alignSelf: 'center',
    gap: Spacing.five,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  intro: {
    gap: Spacing.two,
  },
  logo: {
    alignSelf: 'center',
    height: 56,
    width: 180,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
})
