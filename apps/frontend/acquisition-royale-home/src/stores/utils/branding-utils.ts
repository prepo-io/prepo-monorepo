import { Art } from '../../types/enterprise.types'
import { ArtArray } from '../BrandingContractStore'

export const formatArt = (art: ArtArray): Art | undefined => {
  if (!art?.[0]) return undefined
  const components = art[0].split(',')
  // components[0] should be the spec of data (e.g. data:application/json;base64)
  // components[1] is actual base64 data
  if (!components[1]) return undefined
  const artObjectString = Buffer.from(components[1], 'base64').toString()
  const artObject: Art = JSON.parse(artObjectString)
  return artObject
}
