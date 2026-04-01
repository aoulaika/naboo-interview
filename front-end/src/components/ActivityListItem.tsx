import { ActivityFragment } from "@/graphql/generated/types";
import { useAuth } from "@/hooks";
import { useGlobalStyles } from "@/utils";
import { ActionIcon, Box, Button, Flex, Image, Text } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import Link from "next/link";
import { memo } from "react";

interface ActivityListItemProps {
  activity: ActivityFragment;
  isFavorite?: boolean;
  onToggleFavorite?: (activityId: string) => void;
}

export const ActivityListItem = memo(function ActivityListItem({
  activity,
  isFavorite = false,
  onToggleFavorite,
}: ActivityListItemProps) {
  const { classes } = useGlobalStyles();
  const { user } = useAuth();

  return (
    <Flex align="center" justify="space-between">
      <Flex gap="md" align="center">
        <Image
          src="https://dummyimage.com/125"
          radius="md"
          alt="random image of city"
          height="125"
          width="125"
        />
        <Box sx={{ maxWidth: "300px" }}>
          <Text className={classes.ellipsis}>{activity.city}</Text>
          <Text className={classes.ellipsis}>{activity.name}</Text>
          <Text className={classes.ellipsis}>{activity.description}</Text>
          <Text
            weight="bold"
            className={classes.ellipsis}
          >{`${activity.price}€/j`}</Text>
        </Box>
      </Flex>
      <Flex gap="sm" align="center">
        {user && onToggleFavorite && (
          <ActionIcon
            onClick={() => onToggleFavorite(activity.id)}
            color="red"
            variant="subtle"
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            {isFavorite ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
          </ActionIcon>
        )}
        <Link href={`/activities/${activity.id}`} className={classes.link}>
          <Button variant="outline" color="dark">
            Voir plus
          </Button>
        </Link>
      </Flex>
    </Flex>
  );
});
