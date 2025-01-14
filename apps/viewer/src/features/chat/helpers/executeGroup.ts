import { injectVariableValuesInButtonsInputBlock } from '@/features/blocks/inputs/buttons/injectVariableValuesInButtonsInputBlock'
import { computePaymentInputRuntimeOptions } from '@/features/blocks/inputs/payment/computePaymentInputRuntimeOptions'
import { injectVariableValuesInPictureChoiceBlock } from '@/features/blocks/inputs/pictureChoice/injectVariableValuesInPictureChoiceBlock'
import { deepParseVariables } from '@/features/variables/deepParseVariable'
import { parseVariables } from '@/features/variables/parseVariables'
import {
  isBubbleBlock,
  isDefined,
  isInputBlock,
  isIntegrationBlock,
  isLogicBlock,
} from '@typebot.io/lib'
import {
  BubbleBlock,
  BubbleBlockType,
  ButtonBlock,
  ChatReply,
  Group,
  InputBlock,
  InputBlockType,
  LogicBlockType,
  RuntimeOptions,
  SessionState,
} from '@typebot.io/schemas'
import { format } from 'date-fns'
import { executeIntegration } from './executeIntegration'
import { executeLogic } from './executeLogic'
import { getNextGroup } from './getNextGroup'

export const executeGroup =
  (
    state: SessionState,
    currentReply?: ChatReply,
    currentLastBubbleId?: string
  ) =>
  async (
    group: Group
  ): Promise<ChatReply & { newSessionState: SessionState }> => {
    const messages: ChatReply['messages'] = currentReply?.messages ?? []
    let clientSideActions: ChatReply['clientSideActions'] =
      currentReply?.clientSideActions
    let logs: ChatReply['logs'] = currentReply?.logs
    let nextEdgeId = null
    let lastBubbleBlockId: string | undefined = currentLastBubbleId

    let newSessionState = state

    for (const block of group.blocks) {
      nextEdgeId = block.outgoingEdgeId

      //@ts-ignore
      if (isBubbleBlock(block) && block.type !== BubbleBlockType.BUTTON) {
        messages.push(
          parseBubbleBlock(newSessionState.typebot.variables)(block)
        )
        lastBubbleBlockId = block.id

        continue
      }

      switch (block.type) {
        case LogicBlockType.TRANSFER: {
          const parsedMessage = parseVariables(
            newSessionState.typebot.variables
          )(block.options?.message)

          const getTransfer = () => {
            if (block?.options?.attendant?.id)
              return {
                attendant: block?.options?.attendant,
                message: parsedMessage,
              }

            return {
              department: block?.options?.department,
              message: parsedMessage,
            }
          }

          messages.push({
            content: getTransfer(),
            id: block.id,
            type: block.type,
          })

          lastBubbleBlockId = block.id

          continue
        }

        case LogicBlockType.SPREAD: {
          const parsedMessage = parseVariables(
            newSessionState.typebot.variables
          )(block.options?.message)

          messages.push({
            content: {
              attendants: block.options.attendants,
              message: parsedMessage,
            },
            id: block.id,
            type: block.type,
          })

          lastBubbleBlockId = block.id

          continue
        }

        case LogicBlockType.WAIT:
          messages.push({
            content: block.options,
            id: block.id,
            type: block.type,
          })

          lastBubbleBlockId = block.id

          continue

        case LogicBlockType.TAG:
          messages.push({
            content: block.options,
            id: block.id,
            type: block.type,
          })

          lastBubbleBlockId = block.id

          continue

        case LogicBlockType.REMOVE_TAG:
          messages.push({
            content: block.options,
            id: block.id,
            type: block.type,
          })

          lastBubbleBlockId = block.id

          continue

        case LogicBlockType.END:
          messages.push({
            content: {},
            id: block.id,
            type: block.type,
          })

          lastBubbleBlockId = block.id

          continue

        //@ts-ignore
        case BubbleBlockType.BUTTON:
          messages.push({
            content: (block as any).options,
            id: (block as any).id,
            type: (block as any).type,
          })

          lastBubbleBlockId = (block as any).id

          continue
      }

      if (isInputBlock(block))
        return {
          messages,
          input: await injectVariablesValueInBlock(newSessionState)(block),
          newSessionState: {
            ...newSessionState,
            currentBlock: {
              groupId: group.id,
              blockId: block.id,
            },
          },
          clientSideActions,
          logs,
        }
      const executionResponse = isLogicBlock(block)
        ? await executeLogic(newSessionState, lastBubbleBlockId)(block)
        : isIntegrationBlock(block)
        ? await executeIntegration(newSessionState, lastBubbleBlockId)(block)
        : null

      if (!executionResponse) continue
      if (
        'clientSideActions' in executionResponse &&
        executionResponse.clientSideActions
      ) {
        clientSideActions = [
          ...(clientSideActions ?? []),
          ...executionResponse.clientSideActions,
        ]
        if (
          executionResponse.clientSideActions?.find(
            (action) => 'setVariable' in action
          )
        ) {
          return {
            messages,
            newSessionState: {
              ...newSessionState,
              currentBlock: {
                groupId: group.id,
                blockId: block.id,
              },
            },
            clientSideActions,
            logs,
          }
        }
      }

      if (executionResponse.logs)
        logs = [...(logs ?? []), ...executionResponse.logs]
      if (executionResponse.newSessionState)
        newSessionState = executionResponse.newSessionState
      if (executionResponse.outgoingEdgeId) {
        nextEdgeId = executionResponse.outgoingEdgeId
        break
      }
    }

    if (!nextEdgeId)
      return { messages, newSessionState, clientSideActions, logs }

    const nextGroup = getNextGroup(newSessionState)(nextEdgeId)

    if (nextGroup?.updatedContext) newSessionState = nextGroup.updatedContext

    if (!nextGroup) {
      return { messages, newSessionState, clientSideActions, logs }
    }

    return executeGroup(
      newSessionState,
      {
        messages,
        clientSideActions,
        logs,
      },
      lastBubbleBlockId
    )(nextGroup.group)
  }

const computeRuntimeOptions =
  (state: Pick<SessionState, 'result' | 'typebot'>) =>
  (block: InputBlock): Promise<RuntimeOptions> | undefined => {
    switch (block.type) {
      case InputBlockType.PAYMENT: {
        return computePaymentInputRuntimeOptions(state)(block.options)
      }
    }
  }

const getPrefilledInputValue =
  (variables: SessionState['typebot']['variables']) => (block: InputBlock) => {
    const variableValue = variables.find(
      (variable) =>
        variable.id === block.options.variableId && isDefined(variable.value)
    )?.value
    if (!variableValue || Array.isArray(variableValue)) return
    return variableValue
  }

const parseBubbleBlock =
  (variables: SessionState['typebot']['variables']) =>
  (block: Exclude<BubbleBlock, ButtonBlock>): ChatReply['messages'][0] => {
    switch (block.type) {
      case BubbleBlockType.TEXT:
        return deepParseVariables(variables, { takeLatestIfList: true })(block)
      case BubbleBlockType.EMBED: {
        const message = deepParseVariables(variables)(block)
        return {
          ...message,
          content: {
            ...message.content,
            height:
              typeof message.content.height === 'string'
                ? parseFloat(message.content.height)
                : message.content.height,
          },
        }
      }
      default:
        return deepParseVariables(variables)(block)
    }
  }

const injectVariablesValueInBlock =
  (state: Pick<SessionState, 'result' | 'typebot'>) =>
  async (block: InputBlock): Promise<ChatReply['input']> => {
    switch (block.type) {
      case InputBlockType.WAIT_FOR: {
        return deepParseVariables(state.typebot.variables)({
          ...block,
          options: {
            ...block.options,
            until: block.options.until
              ? format(new Date(block.options.until), 'yyyy-MM-dd HH:mm:ss')
              : '',
          },
          runtimeOptions: await computeRuntimeOptions(state)(block),
          prefilledValue: getPrefilledInputValue(state.typebot.variables)(
            block
          ),
        })
      }

      case InputBlockType.CHOICE: {
        return injectVariableValuesInButtonsInputBlock(state.typebot.variables)(
          block
        )
      }
      case InputBlockType.PICTURE_CHOICE: {
        return injectVariableValuesInPictureChoiceBlock(
          state.typebot.variables
        )(block)
      }
      default: {
        return deepParseVariables(state.typebot.variables)({
          ...block,
          runtimeOptions: await computeRuntimeOptions(state)(block),
          prefilledValue: getPrefilledInputValue(state.typebot.variables)(
            block
          ),
        })
      }
    }
  }
