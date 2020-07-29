import React from 'react';
import { Form, InputText } from '@app/theme';
import { useIntl } from 'react-intl';

import './ChoosePhone.css';
import { settingsDB } from '@app/store/idb';

const ChoosePhone = ({
  className = '',
  setAuth,
  id,
}: {
  className?: string;
  setAuth: Function;
  id: string;
}) => {
  const [phone, setPhone] = React.useState<string>('');
  const { formatMessage } = useIntl();

  React.useEffect(() => {
    /**
     * This ist just a mock. Auth should be set after phone number + id set to the DB
     */
    setAuth({ id });
    settingsDB.set('jwt', 'aeec2188-5f15-43e1-9f26-cb39f65fc902');
  }, []);

  return (
    <div className={`${className} choose-phone`}>
      <p>{formatMessage({ id: 'onboarding.phone.desc' })}</p>
      <InputText
        name="phone"
        label={formatMessage({ id: 'onboarding.phone.label' })}
      />
      <p>ToDo: Submit?</p>
    </div>
  );
};

export default ChoosePhone;
