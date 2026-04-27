'use client';

import { Autocomplete, Box, Button, TextField } from '@mui/material';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { SpaceItem } from '@/lib/types';

interface ItemTagInputProps {
  items: SpaceItem[];
  onSave: (items: SpaceItem[]) => Promise<void> | void;
}

const SUGGESTED_ITEMS = [
  'Bed',
  'Desk',
  'Sofa',
  'Warm Stand Lamp',
  'Fleece Blanket',
  'Neon Sign',
  'Metal Desk',
  'Bookshelf',
  'Plant',
  'Rug',
];

export function ItemTagInput({ items, onSave }: ItemTagInputProps) {
  const [names, setNames] = useState(() => items.map((item) => item.name));
  const [isSaving, setIsSaving] = useState(false);

  const itemByName = useMemo(
    () => new Map(items.map((item) => [normalizeName(item.name), item])),
    [items],
  );

  useEffect(() => {
    setNames(items.map((item) => item.name));
  }, [items]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSave(
        names
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name, index) => itemByName.get(normalizeName(name)) ?? defaultItem(name, index)),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} className="rounded-3xl bg-white/85 p-5 shadow-sm backdrop-blur">
      <h2 className="mb-3 font-bold">Items</h2>
      <Autocomplete
        multiple
        freeSolo
        options={SUGGESTED_ITEMS}
        value={names}
        onChange={(_, value) => setNames([...new Set(value)])}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tag furniture, decor, or fixtures"
            placeholder="Type an item and press Enter"
          />
        )}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSaving}
        sx={{ mt: 2 }}
      >
        {isSaving ? 'Saving...' : 'Save items'}
      </Button>
    </Box>
  );
}

function defaultItem(name: string, index: number): SpaceItem {
  return {
    name,
    position: [Number((index * 0.8 - 0.8).toFixed(2)), 0.35, 0],
    rotation: [0, 0, 0],
  };
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}
