import { PageTitle } from "@/components";
import {
  GetFavoritesQuery,
  GetFavoritesQueryVariables,
  ReorderFavoritesMutation,
  ReorderFavoritesMutationVariables,
} from "@/graphql/generated/types";
import ReorderFavorites from "@/graphql/mutations/favorites/reorderFavorites";
import GetFavorites from "@/graphql/queries/favorites/getFavorites";
import { withAuth } from "@/hocs";
import { useGlobalStyles } from "@/utils";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery } from "@apollo/client";
import {
  ActionIcon,
  Badge,
  Box,
  Divider,
  Flex,
  Group,
  Image,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";
import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type FavoriteActivity = GetFavoritesQuery["getFavorites"]["activities"][number];

function SortableFavoriteItem({ activity }: { activity: FavoriteActivity }) {
  const { classes } = useGlobalStyles();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Flex
      ref={setNodeRef}
      style={style}
      align="center"
      justify="space-between"
      py="sm"
    >
      <Flex gap="md" align="center">
        <Tooltip label="Réorganiser" withArrow>
          <ActionIcon
            {...attributes}
            {...listeners}
            variant="subtle"
            color="gray"
            sx={{ cursor: "grab", touchAction: "none" }}
            aria-label="Réorganiser"
          >
            <IconGripVertical size={18} />
          </ActionIcon>
        </Tooltip>
        <Image
          src="https://dummyimage.com/80"
          radius="md"
          alt="activity image"
          height={80}
          width={80}
        />
        <Box sx={{ maxWidth: "280px" }}>
          <Text weight={500} className={classes.ellipsis}>
            {activity.name}
          </Text>
          <Group spacing="xs" mt={4}>
            <Badge color="pink" variant="light" size="sm">
              {activity.city}
            </Badge>
            <Badge color="yellow" variant="light" size="sm">
              {`${activity.price}€/j`}
            </Badge>
          </Group>
          <Text size="sm" color="dimmed" className={classes.ellipsis} mt={4}>
            {activity.description}
          </Text>
        </Box>
      </Flex>
      <Link href={`/activities/${activity.id}`} className={classes.link}>
        <Text size="sm" color="blue" sx={{ whiteSpace: "nowrap" }}>
          Voir plus →
        </Text>
      </Link>
    </Flex>
  );
}

const Favoris = () => {
  const { data, loading } = useQuery<
    GetFavoritesQuery,
    GetFavoritesQueryVariables
  >(GetFavorites);

  const [reorderFavorites] = useMutation<
    ReorderFavoritesMutation,
    ReorderFavoritesMutationVariables
  >(ReorderFavorites, { refetchQueries: [GetFavorites] });

  const [items, setItems] = useState<FavoriteActivity[]>([]);

  useEffect(() => {
    if (data?.getFavorites.activities) {
      setItems(data.getFavorites.activities);
    }
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setItems((prev) => {
        const oldIndex = prev.findIndex((a) => a.id === active.id);
        const newIndex = prev.findIndex((a) => a.id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);
        reorderFavorites({
          variables: { orderedIds: reordered.map((a) => a.id) },
        });
        return reordered;
      });
    },
    [reorderFavorites],
  );

  return (
    <>
      <Head>
        <title>Mes favoris | CDTR</title>
      </Head>
      <PageTitle title="Mes favoris" />
      {loading ? (
        <Text color="dimmed">Chargement…</Text>
      ) : items.length === 0 ? (
        <Text color="dimmed">
          Vous n&apos;avez pas encore de favoris. Explorez les activités et
          cliquez sur le cœur pour en ajouter !
        </Text>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <Flex direction="column">
              {items.map((activity, idx) => (
                <Box key={activity.id}>
                  <SortableFavoriteItem activity={activity} />
                  {idx < items.length - 1 && <Divider />}
                </Box>
              ))}
            </Flex>
          </SortableContext>
        </DndContext>
      )}
    </>
  );
};

export default withAuth(Favoris);
