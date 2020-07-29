import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@app/theme';
import { useIntl } from 'react-intl';
import { State } from '@app/store/types';
import { useStoreState } from 'unistore-hooks';

import './Navigation.css';
import Logo from '@app/theme/Logo/Logo';

const Navigation = ({ className = '' }: { className?: string }) => {
  const { formatMessage } = useIntl();
  const { notifications }: State = useStoreState(['notifications']);

  const badges = {
    tickets: 0,
    notifications: notifications.length,
  };

  return (
    <div className={`${className} navigation`}>
      <nav className="navigation__content">
        <NavLink
          to="/"
          exact
          className="navigation__element navigation__element--home"
        >
          <Logo logo="er-logo"></Logo>
        </NavLink>
        {['tickets', 'notifications', 'account'].map(type => (
          <NavLink
            to={`/${type}/`}
            exact
            className={`navigation__element navigation__element--${type}`}
            activeClassName="navigation__element--active"
          >
            <Icon icon={`mdi/${type}`} className="navigation__element-icon" />
            <span className="navigation__element-text">
              {formatMessage({ id: `navigation.${type}` })}
            </span>
            {type in badges && badges[type] !== 0 && (
              <span className="navigation__element-badge">
                <span className="navigation__element-badge-number">
                  {badges[type]}
                </span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Navigation;