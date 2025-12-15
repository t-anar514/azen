import { useState, useCallback } from 'react';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSensor,
  useSensors,
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  KeyboardSensor,
} from '@dnd-kit/core';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

import PlannerItem from './planner-item';

// ----------------------------------------------------------------------

const INITIAL_ITEMS = [
  { id: '1', type: 'flight', title: 'Arrival at Narita', time: '10:00 AM', icon: 'carbon:plane', color: 'primary' },
  { id: '2', type: 'spot', title: 'Check-in at Ryokan', time: '02:00 PM', icon: 'carbon:hotel', color: 'secondary' },
  { id: '3', type: 'spot', title: 'Visit Senso-ji', time: '04:00 PM', icon: 'carbon:temple', color: 'secondary' },
];

export default function PlannerTimeline() {
  const [items, setItems] = useState(INITIAL_ITEMS);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);

        return arrayMove(currentItems, oldIndex, newIndex);
      });
    }
  }, []);

  const handleAddBuffer = useCallback(() => {
      setItems((current) => {
          const newBuffer = {
            id: `buffer-${Date.now()}`,
            type: 'buffer',
            title: 'Buffer Time',
            time: '30 min',
            icon: 'carbon:time',
            color: 'warning'
          };
          const newItems = [...current];
          newItems.splice(1, 0, newBuffer);
          return newItems;
      });
  }, []);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6">Day 1: Arrival</Typography>
        <Button
            startIcon={<Iconify icon="carbon:add" />}
            variant="outlined"
            onClick={handleAddBuffer}
            size="small"
        >
            Add Buffer
        </Button>
      </Stack>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <PlannerItem key={item.id} item={item} />
          ))}
        </SortableContext>
      </DndContext>
    </Box>
  );
}
