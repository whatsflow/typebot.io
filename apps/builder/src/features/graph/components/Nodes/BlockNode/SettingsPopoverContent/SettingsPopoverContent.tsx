import { ExpandIcon } from '@/components/icons'
import ButtonSettings from '@/features/blocks/bubbles/button/components/ButtonSettings'
import { ButtonsBlockSettings } from '@/features/blocks/inputs/buttons'
import { DateInputSettingsBody } from '@/features/blocks/inputs/date'
import { EmailInputSettingsBody } from '@/features/blocks/inputs/emailInput'
import { FileInputSettings } from '@/features/blocks/inputs/fileUpload'
import { NumberInputSettingsBody } from '@/features/blocks/inputs/number'
import { PaymentSettings } from '@/features/blocks/inputs/payment'
import { PhoneNumberSettingsBody } from '@/features/blocks/inputs/phone'
import { RatingInputSettings } from '@/features/blocks/inputs/rating'
import { TextInputSettingsBody } from '@/features/blocks/inputs/textInput'
import { UrlInputSettingsBody } from '@/features/blocks/inputs/url'
import { ChatwootSettingsForm } from '@/features/blocks/integrations/chatwoot'
import { GoogleAnalyticsSettings } from '@/features/blocks/integrations/googleAnalytics'
import { GoogleSheetsSettingsBody } from '@/features/blocks/integrations/googleSheets'
import { MakeComSettings } from '@/features/blocks/integrations/makeCom'
import { PabblyConnectSettings } from '@/features/blocks/integrations/pabbly/components/PabblyConnectSettings'
import { SendEmailSettings } from '@/features/blocks/integrations/sendEmail'
import { WebhookSettings } from '@/features/blocks/integrations/webhook'
import { ZapierSettings } from '@/features/blocks/integrations/zapier'
import { JumpSettings } from '@/features/blocks/logic/jump/components/JumpSettings'
import { RedirectSettings } from '@/features/blocks/logic/redirect'
import RemoveTagSettings from '@/features/blocks/logic/removeTag/components/RemoveTagSettings'
import { ScriptSettings } from '@/features/blocks/logic/script/components/ScriptSettings'
import { SetVariableSettings } from '@/features/blocks/logic/setVariable'
import TagSettings from '@/features/blocks/logic/tag/components/TagSettings'
import TransferSettings from '@/features/blocks/logic/transfer/components/TransferSettings'
import { TypebotLinkForm } from '@/features/blocks/logic/typebotLink'
import { WaitSettings } from '@/features/blocks/logic/wait/components/WaitSettings'
import WaitForSettings from '@/features/blocks/logic/waitFor/components/WaitForSettings'
import {
  HStack,
  IconButton,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  Portal,
  Stack,
  useColorModeValue,
  useEventListener,
} from '@chakra-ui/react'
import {
  Block,
  BlockOptions,
  BlockWithOptions,
  BubbleBlockType,
  InputBlockType,
  IntegrationBlockType,
  LogicBlockType,
} from 'models'
import { Fragment, useRef } from 'react'
import { HelpDocButton } from './HelpDocButton'

type Props = {
  block: BlockWithOptions
  onExpandClick: () => void
  onBlockChange: (updates: Partial<Block>) => void
}

export const SettingsPopoverContent = ({ onExpandClick, ...props }: Props) => {
  const arrowColor = useColorModeValue('white', 'gray.800')
  const ref = useRef<HTMLDivElement | null>(null)
  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation()
  }
  useEventListener('wheel', handleMouseWheel, ref.current)
  return (
    <Portal>
      <PopoverContent onMouseDown={handleMouseDown} pos="relative">
        <PopoverArrow bgColor={arrowColor} />
        <PopoverBody
          pt="3"
          pb="6"
          overflowY="scroll"
          maxH="400px"
          ref={ref}
          shadow="lg"
        >
          <Stack spacing={3}>
            <HStack justifyContent="flex-end">
              <HelpDocButton blockType={props.block.type} />
              <IconButton
                aria-label="expand"
                icon={<ExpandIcon />}
                size="xs"
                onClick={onExpandClick}
              />
            </HStack>
            <BlockSettings {...props} />
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Portal>
  )
}

export const BlockSettings = ({
  block,
  onBlockChange,
}: {
  block: BlockWithOptions
  onBlockChange: (block: Partial<Block>) => void
}): JSX.Element => {
  const handleOptionsChange = (options: BlockOptions) => {
    onBlockChange({ options } as Partial<Block>)
  }

  switch (block.type) {
    case BubbleBlockType.BUTTON:
      return (
        <ButtonSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )

    case InputBlockType.TEXT: {
      return (
        <TextInputSettingsBody
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.NUMBER: {
      return (
        <NumberInputSettingsBody
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.EMAIL: {
      return (
        <EmailInputSettingsBody
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.URL: {
      return (
        <UrlInputSettingsBody
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.DATE: {
      return (
        <DateInputSettingsBody
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.PHONE: {
      return (
        <PhoneNumberSettingsBody
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.CHOICE: {
      return (
        <ButtonsBlockSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.PAYMENT: {
      return (
        <PaymentSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.RATING: {
      return (
        <RatingInputSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.FILE: {
      return (
        <FileInputSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case LogicBlockType.SET_VARIABLE: {
      return (
        <SetVariableSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case LogicBlockType.REDIRECT: {
      return (
        <RedirectSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case LogicBlockType.SCRIPT: {
      return (
        <ScriptSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case LogicBlockType.TYPEBOT_LINK: {
      return (
        <TypebotLinkForm
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case LogicBlockType.TRANSFER: {
      return (
        <TransferSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case LogicBlockType.WAIT: {
      return (
        <WaitSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }

    case LogicBlockType.TAG:
      return (
        <TagSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )

    case LogicBlockType.JUMP:
      return (
        <JumpSettings
          groupId={block.groupId}
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )

    case LogicBlockType.REMOVE_TAG:
      return (
        <RemoveTagSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    case InputBlockType.WAIT_FOR:
      return (
        <WaitForSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )

    case LogicBlockType.END:
      return <Fragment />

    case IntegrationBlockType.GOOGLE_SHEETS: {
      return (
        <GoogleSheetsSettingsBody
          options={block.options}
          onOptionsChange={handleOptionsChange}
          blockId={block.id}
        />
      )
    }
    case IntegrationBlockType.GOOGLE_ANALYTICS: {
      return (
        <GoogleAnalyticsSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case IntegrationBlockType.ZAPIER: {
      return (
        <ZapierSettings block={block} onOptionsChange={handleOptionsChange} />
      )
    }
    case IntegrationBlockType.MAKE_COM: {
      return (
        <MakeComSettings block={block} onOptionsChange={handleOptionsChange} />
      )
    }
    case IntegrationBlockType.PABBLY_CONNECT: {
      return (
        <PabblyConnectSettings
          block={block}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case IntegrationBlockType.WEBHOOK: {
      return (
        <WebhookSettings block={block} onOptionsChange={handleOptionsChange} />
      )
    }
    case IntegrationBlockType.EMAIL: {
      return (
        <SendEmailSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case IntegrationBlockType.CHATWOOT: {
      return (
        <ChatwootSettingsForm
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
  }
}
