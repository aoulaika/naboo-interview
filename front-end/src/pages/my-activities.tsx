import { Activity, EmptyData, PageTitle } from "@/components";
import { getGraphqlClient } from "@/graphql/apollo";
import {
  GetUserActivitiesQuery,
  GetUserActivitiesQueryVariables,
} from "@/graphql/generated/types";
import GetUserActivities from "@/graphql/queries/activity/getUserActivities";
import { withAuth } from "@/hocs";
import { useAuth, useFavorites } from "@/hooks";
import { Button, Grid, Group } from "@mantine/core";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

interface MyActivitiesProps {
  activities: GetUserActivitiesQuery["getActivitiesByUser"];
}

export const getServerSideProps: GetServerSideProps<
  MyActivitiesProps
> = async ({ req }) => {
  try {
    const response = await getGraphqlClient().query<
      GetUserActivitiesQuery,
      GetUserActivitiesQueryVariables
    >({
      query: GetUserActivities,
      context: { headers: { Cookie: req.headers.cookie } },
    });
    return { props: { activities: response.data.getActivitiesByUser } };
  } catch {
    return { props: { activities: [] } };
  }
};

const MyActivities = ({ activities }: MyActivitiesProps) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <>
      <Head>
        <title>Mes activités | CDTR</title>
      </Head>
      <Group position="apart">
        <PageTitle title="Mes activités" />
        {user && (
          <Link href="/activities/create">
            <Button>Ajouter une activité</Button>
          </Link>
        )}
      </Group>
      <Grid>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <Activity
              activity={activity}
              key={activity.id}
              isFavorite={isFavorite(activity.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        ) : (
          <EmptyData />
        )}
      </Grid>
    </>
  );
};

export default withAuth(MyActivities);
