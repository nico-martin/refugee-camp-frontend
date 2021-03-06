import React from 'react';
import { useIntl } from 'react-intl';
import { useStoreState, useActions } from 'unistore-hooks';

import { State } from '@app/store/types';
import {
  Button,
  ButtonGroup,
  Form,
  FormControls,
  FormField,
  FormFieldset,
  InputRegnumber,
  Message,
  Modal,
} from '@app/theme';
import { actions } from '@app/store';

import './Settings.css';
import { postUser } from '@app/utils/api';

const Settings = ({ className = '' }: { className?: string }) => {
  const { formatMessage } = useIntl();
  const { identity, offline }: State = useStoreState(['identity', 'offline']);
  const { setIdentity } = useActions(actions);
  const [modal, setModal] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  return (
    <div className={`${className} settings`}>
      <p className="settings__phone">
        {formatMessage(
          { id: 'portal.settings.phone' },
          {
            phone: (
              <b className="settings__phone-number">
                {identity.phone
                  ? identity.phone
                  : formatMessage({ id: 'portal.settings.nophone' })}
              </b>
            ),
          }
        )}
      </p>
      <ButtonGroup>
        <Button
          className="notifications-info__button"
          onClick={() =>
            offline
              ? alert(formatMessage({ id: 'portal.settings.change.offline' }))
              : setModal(true)
          }
        >
          {formatMessage({ id: 'portal.settings.change' })}
        </Button>
      </ButtonGroup>
      {modal && (
        <Modal
          title={formatMessage({ id: 'onboarding.phone.title' })}
          onClose={() => setModal(false)}
        >
          <Form
            onSubmit={data => {
              setLoading(true);
              setError('');
              postUser({ phone: data.phone, regnumber: data.regnumber })
                .then(() => {
                  setLoading(false);
                  setIdentity({ ...identity, phone: data.phone });
                  setModal(false);
                })
                .catch(e => {
                  if (
                    e.response.data.status === 403 ||
                    e.response.data.status === 500
                  ) {
                    setError(
                      formatMessage({ id: 'portal.settings.change.forbidden' })
                    );
                  } else if (e.response.data.status === 418) {
                    setError(
                      formatMessage({
                        id: 'portal.settings.change.invalidNumber',
                      })
                    );
                  }
                  setLoading(false);
                });
            }}
          >
            <FormFieldset stacked>
              <FormField
                name="regnumber"
                label={formatMessage({ id: 'portal.settings.regnr' })}
                component={InputRegnumber}
              />
              <FormField
                name="phone"
                label={formatMessage({ id: 'onboarding.phone.title' })}
                value={identity.phone}
              />
              <FormControls>
                <Button type="submit" loading={loading}>
                  {formatMessage({ id: 'onboarding.phone.next' })}
                </Button>
              </FormControls>
            </FormFieldset>
          </Form>
          {error !== '' && <Message type="error">{error}</Message>}
        </Modal>
      )}
    </div>
  );
};

export default Settings;
