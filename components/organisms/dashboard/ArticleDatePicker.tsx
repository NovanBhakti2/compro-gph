"use client";

import { parseDate, type DateValue } from "@internationalized/date";
import { Calendar, DateField, DatePicker, I18nProvider, Label } from "@heroui/react";

type Props = {
  id: string;
  label: string;
  /** "YYYY-MM-DD" or "" */
  value: string;
  onChange: (value: string) => void;
  isInvalid?: boolean;
};

function toCalendarDate(value: string): DateValue | null {
  try {
    return value ? parseDate(value) : null;
  } catch {
    return null;
  }
}

/**
 * HeroUI date picker that keeps the form value as "YYYY-MM-DD".
 * Submits through its own hidden input so the server action keeps receiving
 * the same `published_at` string as before.
 */
export function ArticleDatePicker({ id, label, value, onChange, isInvalid }: Props) {
  return (
    <I18nProvider locale="id-ID">
      <DatePicker
        id={id}
        className="w-full"
        value={toCalendarDate(value)}
        onChange={(date) => onChange(date ? date.toString() : "")}
        isInvalid={isInvalid}
      >
        <Label className="sr-only">{label}</Label>
        <DateField.Group className="w-full">
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger aria-label="Buka kalender">
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DatePicker.Popover>
          <Calendar aria-label={label}>
            <Calendar.Header>
              <Calendar.YearPickerTrigger>
                <Calendar.YearPickerTriggerHeading />
                <Calendar.YearPickerTriggerIndicator />
              </Calendar.YearPickerTrigger>
              <Calendar.NavButton slot="previous" />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
            </Calendar.Grid>
            <Calendar.YearPickerGrid>
              <Calendar.YearPickerGridBody>
                {({ year }) => <Calendar.YearPickerCell year={year} />}
              </Calendar.YearPickerGridBody>
            </Calendar.YearPickerGrid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>
      <input type="hidden" name="published_at" value={value} />
    </I18nProvider>
  );
}
