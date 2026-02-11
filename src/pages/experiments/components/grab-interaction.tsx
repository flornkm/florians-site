import { Body3 } from "@/components/design-system/body";
import { H4 } from "@/components/design-system/heading";
import { cn } from "@/lib/utils";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { IconDotGrid2x3 } from "central-icons/IconDotGrid2x3";
import React, { useMemo, useState } from "react";

type Todo = { id: string; text: string };

const initialTodos: Todo[] = [
  { id: "1", text: "Plan weekend trip" },
  { id: "2", text: "Review PRs and merge" },
  { id: "3", text: "Buy groceries for dinner" },
];

export const GrabInteraction = () => {
  return (
    <div className="w-full max-w-xl md:ml-32 px-4 md:px-0 flex items-center gap-8">
      <div className="flex flex-col items-start gap-0">
        <div className="mb-3 pl-3 flex items-center gap-1.5">
          <H4 className="font-medium">Without grab classes</H4>
        </div>
        <SortableTodoList initial={initialTodos} />
      </div>
      <div className="flex flex-col items-start gap-0">
        <div className="mb-3 pl-3 flex items-center gap-1.5">
          <H4 className="font-medium">With grab classes</H4>
        </div>
        <SortableTodoList initial={initialTodos} enableGrabClasses />
      </div>
    </div>
  );
};

type SortableTodoListProps = { initial: Todo[]; enableGrabClasses?: boolean };

const SortableTodoList = ({ initial, enableGrabClasses }: SortableTodoListProps) => {
  const [todos, setTodos] = useState<Todo[]>(initial);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const items = useMemo(() => todos.map((t) => t.id), [todos]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) {
      return;
    }
    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    setTodos((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col items-start gap-1">
          {todos.map((todo) => (
            <SortableTodo key={todo.id} todo={todo} enableGrabClasses={enableGrabClasses} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

const SortableTodo = ({ todo, enableGrabClasses }: { todo: Todo; enableGrabClasses?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isSorting } = useSortable({
    id: todo.id,
  });
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: isSorting ? transition : undefined,
  };

  return (
    <TodoItem
      ref={setNodeRef}
      style={style}
      enableGrabClasses={enableGrabClasses}
      attributes={attributes}
      listeners={listeners}
      isDragging={isDragging}
      todo={todo}
    />
  );
};

type TodoItemProps = {
  todo: Todo;
  enableGrabClasses?: boolean;
  isDragging?: boolean;
  style?: React.CSSProperties;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners?: any;
};

const TodoItem = React.forwardRef<HTMLDivElement, TodoItemProps>(
  ({ todo, enableGrabClasses, isDragging, style, attributes, listeners }: TodoItemProps, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          "group flex items-center gap-1.5 rounded-lg p-0.5 pr-3 select-none transition-colors will-change-[transform]",
          isDragging && "z-10",
        )}
      >
        <HandleButton
          aria-label="Drag item"
          enableGrabClasses={enableGrabClasses}
          isDragging={!!isDragging}
          attributes={attributes}
          listeners={listeners}
        />
        <Body3 className="text-primary font-medium">{todo.text}</Body3>
      </div>
    );
  },
);

function HandleButton({
  enableGrabClasses,
  isDragging,

  attributes,

  listeners,
}: {
  enableGrabClasses?: boolean;
  isDragging: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners?: any;
}) {
  const cursorClass = enableGrabClasses
    ? isDragging
      ? "cursor-grabbing"
      : "cursor-grab active:cursor-grabbing"
    : undefined;

  return (
    <button
      aria-label="Drag item"
      className={cn(
        "p-2 hover:bg-interactive-hover rounded-md transition-all text-quaternary hover:text-primary",
        cursorClass,
      )}
      {...attributes}
      {...listeners}
    >
      <IconDotGrid2x3 className="size-4" />
    </button>
  );
}
