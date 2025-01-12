import * as React from 'react';
import {
  FormGroup,
  Text,
  HelperText,
  HelperTextItem,
  Alert,
  AlertActionCloseButton,
  Hint,
  HintBody,
} from '@patternfly/react-core';
import { GroupsConfigField, MenuItemStatus } from '~/pages/groupSettings/groupTypes';
import { MultiSelection } from './MultiSelection';

type FormGroupSettingsProps = {
  title: string;
  body: string;
  groupsField: GroupsConfigField;
  items: MenuItemStatus[];
  handleMenuItemSelection: (newState: MenuItemStatus[], field: GroupsConfigField) => void;
  handleClose: () => void;
  error?: string;
};

export const FormGroupSettings: React.FC<FormGroupSettingsProps> = ({
  title,
  body,
  groupsField,
  items,
  handleMenuItemSelection,
  handleClose,
  error,
}) => (
  <FormGroup fieldId={groupsField} label={title}>
    <Text>{body}</Text>
    <MultiSelection
      ariaLabel={body}
      value={items}
      setValue={(newState) => handleMenuItemSelection(newState, groupsField)}
    />
    {!error && (
      <>
        <HelperText>
          <HelperTextItem variant="indeterminate">
            {'View, edit, or create groups in OpenShift under User Management'}
          </HelperTextItem>
        </HelperText>
        {groupsField === GroupsConfigField.ADMIN && (
          <Hint>
            <HintBody>
              {'All cluster admins are automatically assigned as Data Science administrators.'}
            </HintBody>
          </Hint>
        )}
      </>
    )}
    {error && (
      <Alert
        isInline
        variant="warning"
        title={`Group error`}
        actionClose={<AlertActionCloseButton onClose={handleClose} />}
      >
        <p>{error}</p>
      </Alert>
    )}
  </FormGroup>
);
