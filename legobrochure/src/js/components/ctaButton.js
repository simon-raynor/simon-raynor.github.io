import React from 'react';
import styles from './ctaButton.scss';

export default function CallToActionButton({
    children,
    action
}) {
    return <button
        className={styles.button}
        onClick={action && action.bind ? action : null}
    >{ children }</button>
}