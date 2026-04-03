import { PageTitle } from "@/components";
import { withAuth } from "@/hocs";
import { useAuth, useFavorites } from "@/hooks";
import { useGlobalStyles } from "@/utils";
import { Avatar, Badge, Button, Flex, Text } from "@mantine/core";
import { IconHeart } from "@tabler/icons-react";
import Head from "next/head";
import Link from "next/link";

const Profile = () => {
  const { user } = useAuth();
  const { favoriteIds } = useFavorites();
  const { classes } = useGlobalStyles();

  return (
    <>
      <Head>
        <title>Mon profil | CDTR</title>
      </Head>
      <PageTitle title="Mon profil" />
      <Flex align="center" gap="md" mb="xl">
        <Avatar color="cyan" radius="xl" size="lg">
          {user?.firstName[0]}
          {user?.lastName[0]}
        </Avatar>
        <Flex direction="column">
          <Text>{user?.email}</Text>
          <Text>{user?.firstName}</Text>
          <Text>{user?.lastName}</Text>
        </Flex>
      </Flex>
      <Flex align="center" gap="md">
        <IconHeart size={20} />
        <Text weight={500}>Mes favoris</Text>
        <Badge color="red" variant="light">
          {favoriteIds.size}
        </Badge>
        <Link href="/favoris" className={classes.link}>
          <Button variant="outline" color="red" size="xs">
            Voir mes favoris
          </Button>
        </Link>
      </Flex>
    </>
  );
};

export default withAuth(Profile);
