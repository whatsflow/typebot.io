import { z } from 'zod'
import { scriptOptionsSchema, scriptBlockSchema } from './script'
import { conditionBlockSchema } from './condition'
import { redirectOptionsSchema, redirectBlockSchema } from './redirect'
import { setVariableOptionsSchema, setVariableBlockSchema } from './setVariable'
import { typebotLinkOptionsSchema, typebotLinkBlockSchema } from './typebotLink'
import { waitBlockSchema, waitOptionsSchema } from './wait'
import { transferBlockSchema, transferOptionsSchema } from './transfer'
import { tagBlockSchema, tagOptionsSchema } from './tag'
import { waitForBlockSchema, waitForOptionsSchema } from './waitFor'
import { endBlockSchema } from './end'
import { removeTagBlockSchema, removeTagOptionsSchema } from './removeTag'
import { jumpBlockSchema, jumpOptionsSchema } from './jump'

const logicBlockOptionsSchema = scriptOptionsSchema
  .or(redirectOptionsSchema)
  .or(setVariableOptionsSchema)
  .or(typebotLinkOptionsSchema)
  .or(waitOptionsSchema)
  .or(transferOptionsSchema)
  .or(tagOptionsSchema)
  .or(waitForOptionsSchema)
  .or(removeTagOptionsSchema)
  .or(jumpOptionsSchema)

export const logicBlockSchema = scriptBlockSchema
  .or(conditionBlockSchema)
  .or(redirectBlockSchema)
  .or(typebotLinkBlockSchema)
  .or(setVariableBlockSchema)
  .or(waitBlockSchema)
  .or(transferBlockSchema)
  .or(tagBlockSchema)
  .or(waitForBlockSchema)
  .or(endBlockSchema)
  .or(removeTagBlockSchema)
  .or(jumpBlockSchema)

export type LogicBlock = z.infer<typeof logicBlockSchema>
export type LogicBlockOptions = z.infer<typeof logicBlockOptionsSchema>
