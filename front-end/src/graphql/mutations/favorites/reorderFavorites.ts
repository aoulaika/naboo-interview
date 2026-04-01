import ActivityFragment from "@/graphql/fragments/activity";
import gql from "graphql-tag";

const ReorderFavorites = gql`
  mutation ReorderFavorites($orderedIds: [String!]!) {
    reorderFavorites(orderedIds: $orderedIds) {
      userId
      activities {
        ...Activity
      }
    }
  }
  ${ActivityFragment}
`;

export default ReorderFavorites;
