/*!
 * Portions of this file are based on code from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/70e7caf1946c423bc9aa9cb0e50dbdbe953d239b/packages/@react-aria/radio/src/useRadio.ts
 */

import {
  composeEventHandlers,
  createGenerateId,
  mergeDefaultProps,
  OverrideProps,
} from "@kobalte/utils";
import {
  Accessor,
  ComponentProps,
  createMemo,
  createSignal,
  createUniqueId,
  splitProps,
} from "solid-js";

import { useFormControlContext } from "../form-control";
import {
  createHover,
  createPress,
  HOVER_HANDLERS_PROP_NAMES,
  PRESS_HANDLERS_PROP_NAMES,
} from "../primitives";
import { useRadioGroupContext } from "./radio-group-context";
import {
  RadioGroupItemContext,
  RadioGroupItemContextValue,
  RadioGroupItemDataSet,
} from "./radio-group-item-context";

export interface RadioGroupItemOptions {
  /**
   * The value of the radio button, used when submitting an HTML form.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio#Value).
   */
  value: string;

  /** Whether the radio button is disabled or not. */
  isDisabled?: boolean;
}

/**
 * The root container for a radio button.
 */
export function RadioGroupItem(
  props: OverrideProps<ComponentProps<"label">, RadioGroupItemOptions>
) {
  const formControlContext = useFormControlContext();
  const radioGroupContext = useRadioGroupContext();

  const defaultId = `${formControlContext.generateId("item")}-${createUniqueId()}`;

  props = mergeDefaultProps({ id: defaultId }, props);

  const [local, others] = splitProps(props, [
    "value",
    "isDisabled",
    ...PRESS_HANDLERS_PROP_NAMES,
    ...HOVER_HANDLERS_PROP_NAMES,
  ]);

  const [isFocused, setIsFocused] = createSignal(false);
  const [isFocusVisible, setIsFocusVisible] = createSignal(false);

  const isSelected = createMemo(() => {
    return radioGroupContext.isSelectedValue(local.value);
  });

  const isDisabled = createMemo(() => {
    return local.isDisabled || formControlContext.isDisabled() || false;
  });

  const { isPressed, pressHandlers } = createPress({
    isDisabled,
    preventFocusOnPress: () => isFocused(), // For consistency with native, prevent the input blurs.
  });

  const { isHovered, hoverHandlers } = createHover({
    isDisabled,
  });

  const dataset: Accessor<RadioGroupItemDataSet> = createMemo(() => ({
    "data-valid": formControlContext.dataset()["data-valid"],
    "data-invalid": formControlContext.dataset()["data-invalid"],
    "data-checked": isSelected() ? "" : undefined,
    "data-disabled": isDisabled() ? "" : undefined,
    "data-hover": isHovered() ? "" : undefined,
    "data-focus": isFocused() ? "" : undefined,
    "data-focus-visible": isFocusVisible() ? "" : undefined,
    "data-active": isPressed() ? "" : undefined,
  }));

  const context: RadioGroupItemContextValue = {
    value: () => local.value,
    dataset,
    isSelected,
    isDisabled,
    generateId: createGenerateId(() => others.id!),
    setIsFocused,
    setIsFocusVisible,
  };

  return (
    <RadioGroupItemContext.Provider value={context}>
      <label
        {...context.dataset()}
        onKeyDown={composeEventHandlers([local.onKeyDown, pressHandlers.onKeyDown])}
        onKeyUp={composeEventHandlers([local.onKeyUp, pressHandlers.onKeyUp])}
        onClick={composeEventHandlers([local.onClick, pressHandlers.onClick])}
        onPointerDown={composeEventHandlers([local.onPointerDown, pressHandlers.onPointerDown])}
        onPointerUp={composeEventHandlers([local.onPointerUp, pressHandlers.onPointerUp])}
        onMouseDown={composeEventHandlers([local.onMouseDown, pressHandlers.onMouseDown])}
        onDragStart={composeEventHandlers([local.onDragStart, pressHandlers.onDragStart])}
        onPointerEnter={composeEventHandlers([local.onPointerEnter, hoverHandlers.onPointerEnter])}
        onPointerLeave={composeEventHandlers([local.onPointerLeave, hoverHandlers.onPointerLeave])}
        {...others}
      />
    </RadioGroupItemContext.Provider>
  );
}
