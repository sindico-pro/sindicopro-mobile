import { Image } from 'expo-image'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Screen } from '@/components/ui/screen'
import { SignInForm } from '@/features/auth/components/sign-in-form'
import { messageForSignInError } from '@/features/auth/errors'
import { useSession } from '@/features/auth/session/session-provider'
import { MaxContentWidth, Spacing } from '@/constants/theme'

export function SignInScreen() {
  const { signIn, signOutReason } = useSession()
  const [error, setError] = useState<string | null>(null)
  const expired = signOutReason === 'expired'

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.column}>
            <View style={styles.logoPlate}>
              <Image
                accessibilityLabel="Síndico Pro"
                contentFit="contain"
                source={require('@/assets/images/logo.svg')}
                style={styles.logo}
              />
            </View>
            <ThemedText accessibilityRole="header" type="subtitle">
              Entrar
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Acesse o painel do síndico no celular.
            </ThemedText>
            {signOutReason === 'localOnly' ? (
              <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary">
                Você saiu deste aparelho. Não foi possível confirmar a saída no servidor.
              </ThemedText>
            ) : null}
            {expired ? (
              <ThemedText accessibilityLiveRegion="polite" themeColor="secondary">
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
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  column: {
    alignSelf: 'center',
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  logoPlate: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  logo: {
    height: 48,
    width: 220,
  },
})
