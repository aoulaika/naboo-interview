export * from "./global.styles";
export * from "./mantine.theme";

export type City = {
  nom: string;
  departement: {
    code: string;
    nom: string;
  };
};
