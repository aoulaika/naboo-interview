import {
  AddFavoriteMutation,
  AddFavoriteMutationVariables,
  GetFavoritesQuery,
  GetFavoritesQueryVariables,
  RemoveFavoriteMutation,
  RemoveFavoriteMutationVariables,
} from "@/graphql/generated/types";
import AddFavorite from "@/graphql/mutations/favorites/addFavorite";
import RemoveFavorite from "@/graphql/mutations/favorites/removeFavorite";
import GetFavorites from "@/graphql/queries/favorites/getFavorites";
import { useMutation, useQuery } from "@apollo/client";
import { useCallback } from "react";

export function useFavorites() {
  const { data, loading } = useQuery<GetFavoritesQuery, GetFavoritesQueryVariables>(
    GetFavorites,
  );

  const [addFavoriteMutation] = useMutation<
    AddFavoriteMutation,
    AddFavoriteMutationVariables
  >(AddFavorite, { refetchQueries: [GetFavorites] });

  const [removeFavoriteMutation] = useMutation<
    RemoveFavoriteMutation,
    RemoveFavoriteMutationVariables
  >(RemoveFavorite, { refetchQueries: [GetFavorites] });

  const favoriteIds = new Set(
    (data?.getFavorites.activities ?? []).map((a) => a.id),
  );

  const isFavorite = useCallback(
    (activityId: string) => favoriteIds.has(activityId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  );

  const toggleFavorite = useCallback(
    (activityId: string) => {
      if (favoriteIds.has(activityId)) {
        return removeFavoriteMutation({ variables: { activityId } });
      }
      return addFavoriteMutation({ variables: { activityId } });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, addFavoriteMutation, removeFavoriteMutation],
  );

  return { favoriteIds, isFavorite, toggleFavorite, loading };
}
