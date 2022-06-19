import React from 'react';
import styles from './columns.scss';

export default function Columns({
    title,
    children
}) {
    return <section
        className={styles.section}
    >
        <h2>{ title }</h2>
        {
            React.Children.map(
                children,
                child => <div>{ child }</div>
            )
        }
    </section>
}