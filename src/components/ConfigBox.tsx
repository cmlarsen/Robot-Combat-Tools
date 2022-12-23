import { round } from 'lodash';
import React, { ReactElement } from 'react';

import { createUseStyles } from 'react-jss';
const useStyles = createUseStyles({
  container: {
    border: '1px solid lightgray',
    padding: '1em',
    flexWrap: 'wrap',
    position: 'relative',
    marginTop: 12,
    marginBottom: 18,
  },
  title: {
    position: 'absolute',
    top: -15,
    fontSize: '1.8rem',
    left: 6,
    fontWeight: 700,
    backgroundColor: '#f9f9f9',
    // border: "1px solid lightgray",
    paddingLeft: 4,
    paddingRight: 4,
  },
  smallTitle: {
    top: -12,
    fontSize: '1.4rem',
  },
});

type Props = {
  title: string;
  small?: boolean;
};

export const ConfigBox: React.FC<React.PropsWithChildren<Props>> = ({
  title,
  small,
  children,
}) => {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <div className={[styles.title, small && styles.smallTitle].join(' ')}>
        {title}
      </div>
      {children}
    </div>
  );
};
