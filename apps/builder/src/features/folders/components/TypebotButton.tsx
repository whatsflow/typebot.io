import { ConfirmModal } from '@/components/ConfirmModal'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { GripIcon } from '@/components/icons'
import { deleteTypebotQuery } from '@/features/dashboard/queries/deleteTypebotQuery'
import { getTypebotQuery } from '@/features/dashboard/queries/getTypebotQuery'
import { importTypebotQuery } from '@/features/dashboard/queries/importTypebotQuery'
import { TypebotInDashboard } from '@/features/dashboard/types'
import { deletePublishedTypebotQuery } from '@/features/publish/queries/deletePublishedTypebotQuery'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { isMobile } from '@/helpers/isMobile'
import { useToast } from '@/hooks/useToast'
import { useScopedI18n } from '@/locales'
import {
  Button,
  Flex,
  IconButton,
  MenuItem,
  Tag,
  Text,
  useDisclosure,
  VStack,
  WrapItem,
} from '@chakra-ui/react'
import { Plan } from '@typebot.io/prisma'
import { useRouter } from 'next/router'
import React from 'react'
import { useDebounce } from 'use-debounce'
import { useTypebotDnd } from '../TypebotDndProvider'
import { MoreButton } from './MoreButton'

type Props = {
  typebot: TypebotInDashboard
  isReadOnly?: boolean
  onTypebotUpdated: () => void
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export const TypebotButton = ({
  typebot,
  isReadOnly = false,
  onTypebotUpdated,
  onMouseDown,
}: Props) => {
  const scopedT = useScopedI18n('folders.typebotButton')
  const router = useRouter()
  const { workspace } = useWorkspace()
  const { draggedTypebot } = useTypebotDnd()
  const [draggedTypebotDebounced] = useDebounce(draggedTypebot, 200)
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()

  const { showToast } = useToast()

  const handleTypebotClick = () => {
    if (draggedTypebotDebounced) return
    router.push(
      isMobile
        ? `/typebots/${typebot.id}/results`
        : `/typebots/${typebot.id}/edit`
    )
  }

  const handleDeleteTypebotClick = async () => {
    if (isReadOnly) return
    const { error } = await deleteTypebotQuery(typebot.id)
    if (error)
      return showToast({
        title: 'Não foi possível deletar o typebot',
        description: error.message,
      })
    onTypebotUpdated()
  }

  const handleDuplicateClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const { data } = await getTypebotQuery(typebot.id)
    const typebotToDuplicate = data?.typebot
    if (!typebotToDuplicate)
      return { error: new Error('Typebot não encontrado') }
    const { data: createdTypebot, error } = await importTypebotQuery(
      data.typebot,
      workspace?.plan ?? Plan.FREE
    )
    if (error)
      return showToast({
        title: 'Não foi possível duplicar o typebot',
        description: error.message,
      })
    if (createdTypebot) router.push(`/typebots/${createdTypebot?.id}/edit`)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteOpen()
  }

  const handleUnpublishClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!typebot.publishedTypebotId) return
    const { error } = await deletePublishedTypebotQuery({
      publishedTypebotId: typebot.publishedTypebotId,
      typebotId: typebot.id,
    })
    if (error) showToast({ description: error.message })
    else onTypebotUpdated()
  }

  return (
    <Button
      as={WrapItem}
      onClick={handleTypebotClick}
      display="flex"
      flexDir="column"
      variant="outline"
      w="225px"
      h="270px"
      mr={{ sm: 6 }}
      mb={6}
      rounded="lg"
      whiteSpace="normal"
      opacity={draggedTypebot?.id === typebot.id ? 0.2 : 1}
      onMouseDown={onMouseDown}
      cursor="pointer"
    >
      {typebot.publishedTypebotId && (
        <Tag
          colorScheme="blue"
          variant="solid"
          rounded="full"
          pos="absolute"
          top="27px"
          size="sm"
        >
          Ativo
        </Tag>
      )}
      {!isReadOnly && (
        <>
          <IconButton
            icon={<GripIcon />}
            pos="absolute"
            top="20px"
            left="20px"
            aria-label="Drag"
            cursor="grab"
            variant="ghost"
            colorScheme="blue"
            size="sm"
          />
          <MoreButton
            pos="absolute"
            top="20px"
            right="20px"
            aria-label={scopedT('showMoreOptions')}
          >
            {typebot.publishedTypebotId && (
              <MenuItem onClick={handleUnpublishClick}>
                Cancelar publicação
              </MenuItem>
            )}
            <MenuItem onClick={handleDuplicateClick}>Duplicar</MenuItem>
            <MenuItem color="red.400" onClick={handleDeleteClick}>
              Deletar
            </MenuItem>
          </MoreButton>
        </>
      )}
      <VStack spacing="4">
        <Flex
          rounded="full"
          justifyContent="center"
          alignItems="center"
          fontSize={'4xl'}
        >
          {<EmojiOrImageIcon icon={typebot.icon} boxSize={'35px'} />}
        </Flex>
        <Text textAlign="center" noOfLines={4} maxW="180px">
          {typebot.name}
        </Text>
      </VStack>
      {!isReadOnly && (
        <ConfirmModal
          message={
            <Text>
              Tem certeza de que deseja excluir seu fluxo {typebot.name}?
              <br />
              Todos os dados associados serão perdidos.
            </Text>
          }
          confirmButtonLabel="Delete"
          onConfirm={handleDeleteTypebotClick}
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
        />
      )}
    </Button>
  )
}
