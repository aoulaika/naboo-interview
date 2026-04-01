import gql from "graphql-tag";

const RemoveFavorite = gql`
  mutation RemoveFavorite($activityId: String!) {
    removeFavorite(activityId: $activityId) {
      userId
      activities {
        id
      }
    }
  }
`;

export default RemoveFavorite;
