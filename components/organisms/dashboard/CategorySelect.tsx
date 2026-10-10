"use client";

import { Label, ListBox, Select } from "@heroui/react";

type Props = {
  id: string;
  label: string;
  categories: { id: string; name: string }[];
  /** Category id, or "" for none */
  value: string;
  onChange: (value: string) => void;
};

// React Aria keys can't be empty strings, so "no category" gets its own key
const NONE = "__none__";

/** HeroUI select that submits `category_id` through a hidden input ("" = none). */
export function CategorySelect({ id, label, categories, value, onChange }: Props) {
  return (
    <>
      <Select
        id={id}
        className="w-full"
        placeholder="Pilih kategori"
        value={value || NONE}
        onChange={(key) => onChange(key && key !== NONE ? String(key) : "")}
      >
        <Label className="sr-only">{label}</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id={NONE} textValue="Tanpa kategori">
              <span className="text-slate-500">Tanpa kategori</span>
              <ListBox.ItemIndicator />
            </ListBox.Item>
            {categories.map((c) => (
              <ListBox.Item key={c.id} id={c.id} textValue={c.name}>
                {c.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      <input type="hidden" name="category_id" value={value} />
    </>
  );
}
