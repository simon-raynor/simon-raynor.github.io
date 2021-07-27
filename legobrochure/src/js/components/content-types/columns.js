import React from 'react';

export default function Columns({ children }) {
    return <section>{
        React.Children.map(
            children,
            child => <div>{ child }</div>
        )
    }</section>
}