import { deepParseVariable } from '@/features/variables'
import {
  BubbleBlock,
  BubbleBlockType,
  ButtonBlock,
  ChatReply,
  Group,
  InputBlock,
  InputBlockType,
  RuntimeOptions,
  SessionState,
} from 'models'
import {
  isBubbleBlock,
  isDefined,
  isInputBlock,
  isIntegrationBlock,
  isLogicBlock,
} from 'utils'
import { executeLogic } from './executeLogic'
import { getNextGroup } from './getNextGroup'
import { executeIntegration } from './executeIntegration'
import { computePaymentInputRuntimeOptions } from '@/features/blocks/inputs/payment/api'
import { executeBubble } from './executeBubble'

export const executeGroup =
  (state: SessionState, currentReply?: ChatReply) =>
  async (
    group: Group
  ): Promise<ChatReply & { newSessionState: SessionState }> => {
    const messages: ChatReply['messages'] = currentReply?.messages ?? []
    let clientSideActions: ChatReply['clientSideActions'] =
      currentReply?.clientSideActions
    let logs: ChatReply['logs'] = currentReply?.logs
    let nextEdgeId = null
    let lastBubbleBlockId: string | undefined

    let newSessionState = state

    for (const block of group.blocks) {
      nextEdgeId = block.outgoingEdgeId

      if (isBubbleBlock(block) && block.type !== BubbleBlockType.BUTTON) {
        messages.push(
          parseBubbleBlock(newSessionState.typebot.variables)(block)
        )
        lastBubbleBlockId = block.id

        continue
      }

      if (isInputBlock(block))
        return {
          messages,
          input: deepParseVariable(newSessionState.typebot.variables)({
            ...block,
            runtimeOptions: await computeRuntimeOptions(newSessionState)(block),
            prefilledValue: getPrefilledInputValue(
              newSessionState.typebot.variables
            )(block),
          }),
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
      const executionResponse =
        block.type === BubbleBlockType.BUTTON
          ? await executeBubble(newSessionState, lastBubbleBlockId)(block)
          : isLogicBlock(block)
          ? await executeLogic(newSessionState, lastBubbleBlockId)(block)
          : isIntegrationBlock(block)
          ? await executeIntegration(newSessionState, lastBubbleBlockId)(block)
          : null

      if (!executionResponse) continue
      if (
        'clientSideActions' in executionResponse &&
        executionResponse.clientSideActions
      )
        clientSideActions = [
          ...(clientSideActions ?? []),
          ...executionResponse.clientSideActions,
        ]
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

    return executeGroup(newSessionState, {
      messages,
      clientSideActions,
      logs,
    })(nextGroup.group)
  }

const computeRuntimeOptions =
  (state: SessionState) =>
  (block: InputBlock): Promise<RuntimeOptions> | undefined => {
    switch (block.type) {
      case InputBlockType.PAYMENT: {
        return computePaymentInputRuntimeOptions(state)(block.options)
      }
    }
  }

const getPrefilledInputValue =
  (variables: SessionState['typebot']['variables']) => (block: InputBlock) => {
    return (
      variables.find(
        (variable) =>
          variable.id === block.options.variableId && isDefined(variable.value)
      )?.value ?? undefined
    )
  }

const parseBubbleBlock =
  (variables: SessionState['typebot']['variables']) =>
  (block: Exclude<BubbleBlock, ButtonBlock>): ChatReply['messages'][0] => {
    switch (block.type) {
      case BubbleBlockType.EMBED: {
        const message = deepParseVariable(variables)(block)
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
        return deepParseVariable(variables)(block)
    }
  }
