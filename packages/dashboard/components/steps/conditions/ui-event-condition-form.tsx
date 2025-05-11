'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus } from 'lucide-react';
import { UIEventCondition as UIEventConditionEnum } from '@growly/core';

interface UIEventConditionProps {
  onAdd: (data: any) => void;
}

export function UIEventCondition({ onAdd }: UIEventConditionProps) {
  const [uiEvent, setUiEvent] = useState<UIEventConditionEnum>(UIEventConditionEnum.OnPageLoad);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>UI Event Type</Label>
        <RadioGroup value={uiEvent} onValueChange={(value: any) => setUiEvent(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={UIEventConditionEnum.OnPageLoad} id="onPageLoad" />
            <Label htmlFor="onPageLoad">On Page Load</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={UIEventConditionEnum.OnVisited} id="onVisited" />
            <Label htmlFor="onVisited">On Visited</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={UIEventConditionEnum.OnClicked} id="onClicked" />
            <Label htmlFor="onClicked">On Clicked</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={UIEventConditionEnum.OnHovered} id="onHovered" />
            <Label htmlFor="onHovered">On Hovered</Label>
          </div>
        </RadioGroup>
      </div>
      <Button type="button" onClick={() => onAdd(uiEvent)}>
        <Plus className="mr-2 h-4 w-4" />
        Add UI Event Condition
      </Button>
    </div>
  );
}
