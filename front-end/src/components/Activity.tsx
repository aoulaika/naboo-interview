import { ActivityFragment } from "@/graphql/generated/types";
import { useAuth } from "@/hooks";
import { useGlobalStyles } from "@/utils";
import { ActionIcon, Badge, Button, Card, Grid, Group, Image, Text } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import Link from "next/link";
import { memo } from "react";

interface ActivityProps {
  activity: ActivityFragment;
  isFavorite?: boolean;
  onToggleFavorite?: (activityId: string) => void;
}

export const Activity = memo(function Activity({
  activity,
  isFavorite = false,
  onToggleFavorite,
}: ActivityProps) {
  const { classes } = useGlobalStyles();
  const { user } = useAuth();

  return (
    <Grid.Col span={4}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Image
            src="https://dummyimage.com/480x4:3"
            height={160}
            alt="random image of city"
          />
        </Card.Section>

        <Group position="apart" mt="md" mb="xs">
          <Text weight={500} className={classes.ellipsis}>
            {activity.name}
          </Text>
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
        </Group>

        <Group mt="md" mb="xs">
          <Badge color="pink" variant="light">
            {activity.city}
          </Badge>
          <Badge color="yellow" variant="light">
            {`${activity.price}€/j`}
          </Badge>
        </Group>

        <Text size="sm" color="dimmed" className={classes.ellipsis}>
          {activity.description}
        </Text>

        <Link href={`/activities/${activity.id}`} className={classes.link}>
          <Button variant="light" color="blue" fullWidth mt="md" radius="md">
            Voir plus
          </Button>
        </Link>
      </Card>
    </Grid.Col>
  );
});
