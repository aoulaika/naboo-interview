import { Flex, NumberInput, TextInput } from "@mantine/core";
import { IconCurrencyEuro, IconWalk } from "@tabler/icons-react";
import { Dispatch, SetStateAction, memo, useCallback } from "react";

interface FiltersProps {
  activity: string | undefined;
  price: number | undefined;
  setSearchActivity: Dispatch<SetStateAction<string | undefined>>;
  setSearchPrice: Dispatch<SetStateAction<number | undefined>>;
}

export const Filters = memo(function Filters({
  activity,
  price,
  setSearchActivity,
  setSearchPrice,
}: FiltersProps) {
  const handleActivityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSearchActivity(e.target.value || undefined),
    [setSearchActivity]
  );

  const handlePriceChange = useCallback(
    (e: number | "") => setSearchPrice(Number(e) || undefined),
    [setSearchPrice]
  );

  return (
    <Flex
      gap="md"
      direction="column"
      sx={(tm) => ({
        width: "100%",
        borderRadius: tm.radius.md,
        backgroundColor: tm.colors.gray[2],
        padding: tm.spacing.md,
        position: "sticky",
        top: "10px",
      })}
    >
      <TextInput
        icon={<IconWalk />}
        placeholder="Activité"
        onChange={handleActivityChange}
        value={activity}
      />
      <NumberInput
        icon={<IconCurrencyEuro />}
        placeholder="Prix Maximal"
        type="number"
        onChange={handlePriceChange}
        value={price}
      />
    </Flex>
  );
});
