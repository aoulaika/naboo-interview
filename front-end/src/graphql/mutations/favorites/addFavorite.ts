import gql from "graphql-tag";

const AddFavorite = gql`
  mutation AddFavorite($activityId: String!) {
    addFavorite(activityId: $activityId) {
      userId
      activities {
        id
      }
    }
  }
`;

export default AddFavorite;
