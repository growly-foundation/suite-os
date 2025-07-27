'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export type TimeRange = {
  label: string;
  startDate: Date;
  endDate: Date;
};

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  className?: string;
}

const PRESET_RANGES: TimeRange[] = [
  {
    label: 'Last 7 days',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
  {
    label: 'Last 30 days',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
  {
    label: 'Last 3 months',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
  {
    label: 'Last 6 months',
    startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
  {
    label: 'Last year',
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
];

export function TimeRangeSelector({
  selectedRange,
  onRangeChange,
  className,
}: TimeRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);

  const handlePresetSelect = (range: TimeRange) => {
    onRangeChange(range);
    setIsOpen(false);
  };

  const handleCustomRangeSelect = () => {
    if (customStartDate && customEndDate) {
      onRangeChange({
        label: `${format(customStartDate, 'MMM dd')} - ${format(customEndDate, 'MMM dd, yyyy')}`,
        startDate: customStartDate,
        endDate: customEndDate,
      });
      setIsOpen(false);
    }
  };

  const isCustomRange = !PRESET_RANGES.some(
    range =>
      range.startDate.getTime() === selectedRange.startDate.getTime() &&
      range.endDate.getTime() === selectedRange.endDate.getTime()
  );

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground">Time Range:</span>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[200px] justify-between text-left font-normal',
              !selectedRange && 'text-muted-foreground'
            )}>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span className="truncate">
                {selectedRange ? selectedRange.label : 'Select time range'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0" align="start">
          <div className="flex gap-4 p-4 w-fit justify-between">
            {/* Preset Ranges */}
            <div className="w-[200px] space-y-2">
              <h4 className="text-sm font-medium">Quick Select</h4>
              <div className="space-y-1">
                {PRESET_RANGES.map(range => (
                  <Button
                    key={range.label}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'w-full justify-start text-xs',
                      selectedRange.label === range.label && 'bg-accent'
                    )}
                    onClick={() => handlePresetSelect(range)}>
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Range */}
            <div className="w-fit space-y-2">
              <h4 className="text-sm font-medium">Custom Range</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground">Start Date</label>
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    className="rounded-md border"
                    disabled={date => date > new Date()}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">End Date</label>
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    className="rounded-md border"
                    disabled={date => date > new Date()}
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!customStartDate || !customEndDate}
                  onClick={handleCustomRangeSelect}>
                  Apply Custom Range
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
