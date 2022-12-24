import { round } from 'lodash';
import React, { ReactElement } from 'react';

import { createUseStyles } from 'react-jss';
const useStyles = createUseStyles({
  summaryCell: {
    display: 'flex',

    padding: '0.5em',
    flexWrap: 'wrap',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    border: 0,
    backgroundColor: '#f1f1f1',
    fontWeight: 700,
    minWidth: 100,
  },
  small: {
    fontWeight: 300,
    fontSize: "1rem",
    paddingRight:4
  },
  compact: {
    height: 20,
    padding: '0.3em',
    paddingLeft: '0.2em',
    paddingRight: '0.2em',
    minWidth: 'auto',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    fontSize: "1.1rem",

  },
});

interface Props {
  value: number;
  units?: string;
  title: string;
  roundPlaces?: number;
  compact?: boolean;
}

export default function SummaryBox({
  value,
  units,
  title,
  compact,
  roundPlaces,
}: Props): ReactElement {
  const styles = useStyles();
  return (
    <div className={[styles.summaryCell, compact && styles.compact].join(' ')}>
      {round(value, roundPlaces ?? Infinity)}{units && `${units}`}
      <span className={styles.small}>{title}</span>
    </div>
  );
}
