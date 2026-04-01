import { PageTitle } from "@/components";
import { getGraphqlClient } from "@/graphql/apollo";
import {
  GetActivityQuery,
  GetActivityQueryVariables,
} from "@/graphql/generated/types";
import GetActivity from "@/graphql/queries/activity/getActivity";
import { useAuth, useFavorites } from "@/hooks";
import { ActionIcon, Badge, Flex, Grid, Group, Image, Text } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

interface ActivityDetailsProps {
  activity: GetActivityQuery["getActivity"];
}

export const getServerSideProps: GetServerSideProps<
  ActivityDetailsProps
> = async ({ params, req }) => {
  if (!params?.id || Array.isArray(params.id)) return { notFound: true };
  const response = await getGraphqlClient().query<
    GetActivityQuery,
    GetActivityQueryVariables
  >({
    query: GetActivity,
    variables: { id: params.id },
    context: { headers: { Cookie: req.headers.cookie } },
  });
  return { props: { activity: response.data.getActivity } };
};

export default function ActivityDetails({ activity }: ActivityDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <>
      <Head>
        <title>{activity.name} | CDTR</title>
      </Head>
      <PageTitle title={activity.name} prevPath={router.back} />
      <Grid>
        <Grid.Col span={7}>
          <Image
            src="https://dummyimage.com/640x4:3"
            radius="md"
            alt="random image of city"
            width="100%"
            height="400"
          />
        </Grid.Col>
        <Grid.Col span={5}>
          <Flex direction="column" gap="md">
            <Group mt="md" mb="xs" position="apart">
              <Group>
                <Badge color="pink" variant="light">
                  {activity.city}
                </Badge>
                <Badge color="yellow" variant="light">
                  {`${activity.price}€/j`}
                </Badge>
              </Group>
              {user && (
                <ActionIcon
                  onClick={() => toggleFavorite(activity.id)}
                  color="red"
                  variant="subtle"
                  size="lg"
                  aria-label={
                    isFavorite(activity.id)
                      ? "Retirer des favoris"
                      : "Ajouter aux favoris"
                  }
                >
                  {isFavorite(activity.id) ? (
                    <IconHeartFilled size={24} />
                  ) : (
                    <IconHeart size={24} />
                  )}
                </ActionIcon>
              )}
            </Group>
            <Text size="sm">{activity.description}</Text>
            <Text size="sm" color="dimmed">
              Ajouté par {activity.owner.firstName} {activity.owner.lastName}
            </Text>
          </Flex>
        </Grid.Col>
      </Grid>
    </>
  );
}
