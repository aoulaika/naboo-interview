import ActivityFragment from "@/graphql/fragments/activity";
import gql from "graphql-tag";

const GetFavorites = gql`
  query GetFavorites {
    getFavorites {
      userId
      activities {
        ...Activity
      }
    }
  }
  ${ActivityFragment}
`;

export default GetFavorites;
