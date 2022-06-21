import gql from 'graphql-tag'
import { selectFromPosition } from '../../../../generated/mst-gql/core-dapp'

export const userPositionsQueryString = gql`
  query userPositions($address: String!) {
    positions(where: { ownerAddress: $address }) {
        ${selectFromPosition().id.costBasis.ownerAddress.longShortToken(({ id }) => id)}
    }
  }
`
