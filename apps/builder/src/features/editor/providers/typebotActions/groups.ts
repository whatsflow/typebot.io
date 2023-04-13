import { Coordinates } from '@/features/graph/types'
import { createId } from '@paralleldrive/cuid2'
import { parseGroupTitle } from '@typebot.io/lib'
import {
  BlockIndices,
  DraggableBlock,
  DraggableBlockType,
  Group,
  LogicBlockType,
} from '@typebot.io/schemas'
import { produce } from 'immer'
import { SetTypebot } from '../TypebotProvider'
import {
  createBlockDraft,
  deleteGroupDraft,
  duplicateBlockDraft,
  WebhookCallBacks,
} from './blocks'

export type GroupsActions = {
  createGroup: (
    props: Coordinates & {
      id: string
      block: DraggableBlock | DraggableBlockType
      indices: BlockIndices
    }
  ) => void
  updateGroup: (groupIndex: number, updates: Partial<Omit<Group, 'id'>>) => void
  duplicateGroup: (groupIndex: number) => void
  deleteGroup: (groupIndex: number) => void
}

const groupsActions = (
  setTypebot: SetTypebot,
  { onWebhookBlockCreated, onWebhookBlockDuplicated }: WebhookCallBacks
): GroupsActions => ({
  createGroup: ({
    id,
    block,
    indices,
    ...graphCoordinates
  }: Coordinates & {
    id: string
    block: DraggableBlock | DraggableBlockType
    indices: BlockIndices
  }) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const newGroup: Group = {
          id,
          graphCoordinates,
          title:
            block === LogicBlockType.END
              ? 'Fim'
              : `Grupo #${typebot.groups.length}`,
          blocks: [],
        }
        typebot.groups.push(newGroup)
        createBlockDraft(
          typebot,
          block,
          newGroup.id,
          indices,
          onWebhookBlockCreated
        )
      })
    ),
  updateGroup: (groupIndex: number, updates: Partial<Omit<Group, 'id'>>) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex]
        typebot.groups[groupIndex] = { ...block, ...updates }
      })
    ),
  duplicateGroup: (groupIndex: number) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const group = typebot.groups[groupIndex]
        const id = createId()
        const newGroup: Group = {
          ...group,
          title: `${parseGroupTitle(group.title)} Cópia`,
          id,
          blocks: group.blocks.map((block) =>
            duplicateBlockDraft(id)(block, onWebhookBlockDuplicated)
          ),
          graphCoordinates: {
            x: group.graphCoordinates.x + 200,
            y: group.graphCoordinates.y + 100,
          },
        }
        typebot.groups.splice(groupIndex + 1, 0, newGroup)
      })
    ),
  deleteGroup: (groupIndex: number) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        deleteGroupDraft(typebot)(groupIndex)
      })
    ),
})

export { groupsActions }