import _ from 'lodash'
import * as React from 'react'

import { getUnhandledProps } from '../../lib'
import type { SemanticShorthandItem } from '../../generic'
import type { ButtonProps } from '../../elements/Button'
import Button from '../../elements/Button'
import type { StrictModalProps } from '../../modules/Modal'
import Modal from '../../modules/Modal'
import type { ModalContentProps } from '../../modules/Modal/ModalContent'
import type { ModalHeaderProps } from '../../modules/Modal/ModalHeader'

export interface StrictConfirmProps extends StrictModalProps {
  /** The cancel button text. */
  cancelButton?: SemanticShorthandItem<ButtonProps>

  /** The OK button text. */
  confirmButton?: SemanticShorthandItem<ButtonProps>

  /** The ModalContent text. */
  content?: SemanticShorthandItem<ModalContentProps>

  /** The ModalHeader text. */
  header?: SemanticShorthandItem<ModalHeaderProps>

  /**
   * Called when the Modal is closed without clicking confirm.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onCancel?: (event: React.MouseEvent<HTMLAnchorElement>, data: ConfirmProps) => void

  /**
   * Called when the OK button is clicked.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onConfirm?: (event: React.MouseEvent<HTMLAnchorElement>, data: ConfirmProps) => void

  /** Whether or not the modal is visible. */
  open?: boolean

  /** A Confirm can vary in size. */
  size?: 'mini' | 'tiny' | 'small' | 'large' | 'fullscreen'
}

export interface ConfirmProps extends StrictConfirmProps {
  [key: string]: any
}

/**
 * A Confirm modal gives the user a choice to confirm or cancel an action.
 * @see Modal
 */
function Confirm({ ref, ...props }: ConfirmProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    cancelButton = 'Cancel',
    confirmButton = 'OK',
    content = 'Are you sure?',
    header,
    open,
    size = 'small',
  } = props
  const rest = getUnhandledProps(Confirm, props)

  const handleCancel = (e: any) => {
    _.invoke(props, 'onCancel', e, props)
  }

  const handleCancelOverrides = (predefinedProps: any) => ({
    onClick: (e: any, buttonProps: any) => {
      _.invoke(predefinedProps, 'onClick', e, buttonProps)
      handleCancel(e)
    },
  })

  const handleConfirmOverrides = (predefinedProps: any) => ({
    onClick: (e: any, buttonProps: any) => {
      _.invoke(predefinedProps, 'onClick', e, buttonProps)
      _.invoke(props, 'onConfirm', e, props)
    },
  })

  // `open` is auto controlled by the Modal
  // It cannot be present (even undefined) with `defaultOpen`
  // only apply it if the user provided an open prop
  const openProp: Record<string, any> = {}
  if ('open' in props) {
    openProp.open = open
  }

  return (
    <Modal {...rest} {...openProp} size={size} onClose={handleCancel} ref={ref}>
      {Modal.Header.create(header, { autoGenerateKey: false })}
      {Modal.Content.create(content, { autoGenerateKey: false })}
      <Modal.Actions>
        {Button.create(cancelButton, {
          autoGenerateKey: false,
          overrideProps: handleCancelOverrides,
        })}
        {Button.create(confirmButton, {
          autoGenerateKey: false,
          defaultProps: { primary: true },
          overrideProps: handleConfirmOverrides,
        })}
      </Modal.Actions>
    </Modal>
  )
}

Confirm.displayName = 'Confirm'
Confirm.handledProps = [
  'cancelButton',
  'confirmButton',
  'content',
  'header',
  'onCancel',
  'onConfirm',
  'open',
  'size',
]

export default Confirm
