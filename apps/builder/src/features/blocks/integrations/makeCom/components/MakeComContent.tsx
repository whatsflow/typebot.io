import { Text } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { MakeComBlock } from '@typebot.io/schemas'
import { byId, isNotDefined } from '@typebot.io/lib'

type Props = {
  block: MakeComBlock
}

export const MakeComContent = ({ block }: Props) => {
  const { webhooks } = useTypebot()
  const webhook = webhooks.find(byId(block.webhookId))

  if (isNotDefined(webhook?.body))
    return <Text color="gray.500">Configurar...</Text>
  return (
    <Text noOfLines={1} pr="6">
      {webhook?.url ? 'cenário de gatilho' : 'Desabilitado'}
    </Text>
  )
}
