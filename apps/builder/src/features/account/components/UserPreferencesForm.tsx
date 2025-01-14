import { Heading, Stack, useColorMode } from '@chakra-ui/react'
import { GraphNavigation } from '@typebot.io/prisma'
import { useEffect } from 'react'
import { useUser } from '../hooks/useUser'
import { AppearanceRadioGroup } from './AppearanceRadioGroup'
import { GraphNavigationRadioGroup } from './GraphNavigationRadioGroup'

export const UserPreferencesForm = () => {
  const { colorMode, setColorMode } = useColorMode()
  const { user, updateUser } = useUser()

  useEffect(() => {
    if (!user?.graphNavigation)
      updateUser({ graphNavigation: GraphNavigation.TRACKPAD })
  }, [updateUser, user?.graphNavigation])

  const changeGraphNavigation = async (value: string) => {
    updateUser({ graphNavigation: value as GraphNavigation })
  }

  const changeAppearance = async (value: string) => {
    setColorMode(value)
    updateUser({ preferredAppAppearance: value })
  }

  return (
    <Stack spacing={12}>
      <Stack spacing={6}>
        <Heading size="md">Navegação do editor</Heading>
        <GraphNavigationRadioGroup
          defaultValue={user?.graphNavigation ?? GraphNavigation.TRACKPAD}
          onChange={changeGraphNavigation}
        />
      </Stack>
      <Stack spacing={6}>
        <Heading size="md">Aparência</Heading>
        <AppearanceRadioGroup
          defaultValue={
            user?.preferredAppAppearance
              ? user.preferredAppAppearance
              : colorMode
          }
          onChange={changeAppearance}
        />
      </Stack>
    </Stack>
  )
}
