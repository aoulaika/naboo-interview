import { ActivityListItem, EmptyData, Filters, PageTitle } from "@/components";
import { getGraphqlClient } from "@/graphql/apollo";
import {
  GetActivitiesByCityQuery,
  GetActivitiesByCityQueryVariables,
} from "@/graphql/generated/types";
import GetActivitiesByCity from "@/graphql/queries/activity/getActivitiesByCity";
import { useDebounced, useFavorites } from "@/hooks";
import { Divider, Flex, Grid } from "@mantine/core";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";

interface CityDetailsProps {
  activities: GetActivitiesByCityQuery["getActivitiesByCity"];
  city: string;
}

export const getServerSideProps: GetServerSideProps<CityDetailsProps> = async ({
  params,
  query,
}) => {
  if (!params?.city || Array.isArray(params.city)) return { notFound: true };

  if (
    (query.activity && Array.isArray(query.activity)) ||
    (query.price && Array.isArray(query.price))
  )
    return { notFound: true };

  const response = await getGraphqlClient().query<
    GetActivitiesByCityQuery,
    GetActivitiesByCityQueryVariables
  >({
    query: GetActivitiesByCity,
    variables: {
      city: params.city,
      name: query.activity || null,
      maxPrice: query.price ? Number(query.price) : null,
    },
  });
  return {
    props: { activities: response.data.getActivitiesByCity, city: params.city },
  };
};

export default function ActivityDetails({
  activities,
  city,
}: CityDetailsProps) {
  const router = useRouter();
  const { query } = router;
  const { isFavorite, toggleFavorite } = useFavorites();

  const [searchActivity, setSearchActivity] = useState<string | undefined>(
    typeof query.activity === "string" ? query.activity : undefined
  );
  const debouncedSearchActivity = useDebounced(searchActivity, 300);

  const [searchPrice, setSearchPrice] = useState<number | undefined>(
    typeof query.price === "string" ? Number(query.price) : undefined
  );
  const debouncedSearchPrice = useDebounced(searchPrice, 300);

  useEffect(() => {
    const searchParams = new URLSearchParams();

    if (debouncedSearchActivity !== undefined)
      searchParams.set("activity", debouncedSearchActivity);

    if (debouncedSearchPrice !== undefined)
      searchParams.set("price", debouncedSearchPrice.toString());

    const stringParams = searchParams.toString();
    router.push(`/explorer/${city}${stringParams ? `?${stringParams}` : ""}`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, debouncedSearchActivity, debouncedSearchPrice]);

  return (
    <>
      <Head>
        <title>{city} | CDTR</title>
      </Head>
      <PageTitle
        title={`Activités pour la ville de ${city}`}
        prevPath="/explorer"
      />
      <Grid>
        <Grid.Col span={4}>
          <Filters
            {...{
              activity: searchActivity,
              price: searchPrice,
              setSearchActivity,
              setSearchPrice,
            }}
          />
        </Grid.Col>
        <Grid.Col span={8}>
          <Flex direction="column" gap="lg">
            {activities.length > 0 ? (
              activities.map((activity, idx) => (
                <Fragment key={activity.id}>
                  <ActivityListItem
                    activity={activity}
                    isFavorite={isFavorite(activity.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                  {idx < activities.length - 1 && <Divider my="sm" />}
                </Fragment>
              ))
            ) : (
              <EmptyData />
            )}
          </Flex>
        </Grid.Col>
      </Grid>
    </>
  );
}
