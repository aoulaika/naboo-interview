import ActivityFragment from "@/graphql/fragments/activity";
import gql from "graphql-tag";

const GetActivitiesByCity = gql`
  query GetActivitiesByCity($name: String, $city: String!, $maxPrice: Int) {
    getActivitiesByCity(name: $name, city: $city, maxPrice: $maxPrice) {
      ...Activity
    }
  }
  ${ActivityFragment}
`;

export default GetActivitiesByCity;
