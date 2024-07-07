import express from 'express'
import { AuthContext } from '../../utils/auth'
import { globalEm } from '../../utils/globalEm'
import { components } from '../generated/api-types'
import { UnauthorizedError } from '../errors'
import { UserInteractionCount } from '../../model'

type ReqParams = Record<string, string>
type ResBody =
  | components['schemas']['GenericOkResponseData']
  | components['schemas']['GenericErrorResponseData']
type ResLocals = { authContext: AuthContext }
type ReqBody = components['schemas']['RegisterUserInteractionRequestData']

export const registerUserInteraction: (
  req: express.Request<ReqParams, ResBody, ReqBody>,
  res: express.Response<ResBody, ResLocals>,
  next: express.NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    const { authContext: session } = res.locals
    const { type, entityId } = req.body

    console.log(session)
    if (!session) {
      throw new UnauthorizedError('Cannot register interactions for empty session')
    }

    const em = await globalEm

    await em.transaction(async (em) => {
      const date = new Date()
      const startOfDay = new Date(date.setHours(0, 0, 0, 0))
      const endOfDay = new Date(date.setHours(23, 59, 59, 999))

      const dailyInteractionRow = await em
        .getRepository(UserInteractionCount)
        .createQueryBuilder('entity')
        .where('entity.entityId = :entityId', { entityId })
        .andWhere('entity.type  = :type', { type })
        .andWhere('entity.dayTimestamp >= :startOfDay', { startOfDay })
        .andWhere('entity.dayTimestamp <= :endOfDay', { endOfDay })
        .getOne()

      if (!dailyInteractionRow) {
        await em.getRepository(UserInteractionCount).save({
          id: `${Date.now()}-${entityId}-${type}`,
          dayTimestamp: new Date(),
          count: 1,
          type,
          entityId,
        })

        return
      }

      dailyInteractionRow.count++

      await em.save(dailyInteractionRow)
    })

    res.status(200).json({ success: true })
  } catch (e) {
    next(e)
  }
}