# `[tmkGrip]`

Defines an element as being able to grip it. When an element with this
directive applied is gripped and the cursor is moved, it will provide
calculated values of the position differences.

The most obvious use-case for this directive is to allow an element to be
dragged from one position to another. Note that this directive does not
modify the position of the element itself but will only provide the new
positional values. Applying the new position to the element can be done
using CSS.

```typescript
import { Component } from "@angular/core";
import { GripDraggedEvent } from '@TomikaArome/common-ui';

@Component({
  template: `<div tmkGrip (tmkGripDragged)="move($event)"
  [ngStyle]="{ left: xPos + 'px', top: yPos + 'px' }"></div>`
})
class ExampleComponent {
  xPos = 0;
  yPos = 0;
  
  move(event: GripDraggedEvent) {
    this.xPos += event.changeSinceLastStep.x;
    this.yPos += event.changeSinceLastStep.y;
  }
}
```

## Summary of inputs

| Selector             | Type                                          | Default value    | Description                                                                                                                                                                                                                                                                                                         |
|----------------------|-----------------------------------------------|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `tmkGrip`            | `boolean`                                     | `true`           | Enables or disables the grip.                                                                                                                                                                                                                                                                                       |
| `tmkGripCursor`      | `string &#124; string[]`                      | `grab; grabbing` | Set the cursor when hovering over the element, and gripping it. Takes a semicolon-separated string, with the first value being the hover cursor, and the second the grip cursor. Any CSS value for the `cursor` CSS property is accepted. See: [MDN docs](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor). |
| `tmkGripBoundary`    | `string &#124; HTMLElement &#124; Boundaries` | `{}`             | Set a boundary outside which the element should never go out of. Use `"parent"` to use the element's parent as a boundary, another string to query a different element, a HTMLElement or an object with the properties `"left"`, `"right"`, `"top"`, `"bottom"` to manually set the client boundaries.              |
| `tmkGripBoundaryBox` | `'content-box' &#124; 'border-box`            | `'content-box'`  | Determines whether the boundary should be on the inside of the boundary element's border (`"content-box"`) or on the outside (`"border-box"`).                                                                                                                                                                      |
| `tmkGripEventType`   | `'both' &#124; 'mouse' &#124; 'touch'`        | `'both'`         | Determines whether the element can be gripped using the mouse, touch events, or both.                                                                                                                                                                                                                               |

## Summary of outputs

| Selector         | Event type         | Description                                                                                                                        |
|------------------|--------------------|------------------------------------------------------------------------------------------------------------------------------------|
| `tmkGripHovered` | `boolean`          | Emits `true` when the cursor hovers over the element, and `false` when the cursor exits the element.                               |
| `tmkGripGripped` | `boolean`          | Emits `true` when the element is gripped and `false` when the element is let go.                                                   |
| `tmkGripDragged` | `GripDraggedEvent` | Emits an object of calculated values of how the element has been affected by a drag. See below for more information on this event. |

## `tmkGripDragged` event
This event emits an object with calculated values of how the cursor has moved. The interface is defined as follows:
```typescript
interface GripDraggedEvent {
  absolute: Coordinates;
  relativeToBoundary?: Coordinates;
  changeSinceLastStep: Coordinates;
  changeSinceGripped: Coordinates;
}
```
`Coordinates` is simply an x and y pair of coordinates.

`changeSinceLastStep` is the change of position of the cursor since the last time the cursor was moved.
