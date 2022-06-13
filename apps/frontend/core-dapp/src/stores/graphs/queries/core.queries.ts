import gql from 'graphql-tag'
import { selectFromPosition } from '../../../../generated/mst-gql/core-dapp'

export const userPositionsQueryString = gql`
  query userPositions($address: String!) {
    positions(where: { owner: $address }) {
        ${selectFromPosition().id.costBasis.owner.token(({ id }) => id)}
    }
  }
`
