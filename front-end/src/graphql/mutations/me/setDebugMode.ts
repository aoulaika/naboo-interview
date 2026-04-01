import gql from "graphql-tag";

const SetDebugMode = gql`
  mutation SetDebugMode($enabled: Boolean!) {
    setDebugMode(enabled: $enabled) {
      id
      debugModeEnabled
    }
  }
`;

export default SetDebugMode;
