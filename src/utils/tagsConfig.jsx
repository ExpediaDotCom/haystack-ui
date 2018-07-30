import React from 'react';
import validUrl from './validUrl';

export default class tagsConfig extends React.Component {
    // By default test if value is url or not and render according
    static default(value) {
        const result = validUrl.isUrl(value) ?
            (<a href={value} target="_blank">
                <span className="ti-new-window"/> <span>{value}</span>
            </a>) :
            (<span>{`${value}`}</span>);
        return result;
    }
    // The following are overrides to the default config
    static url2(value) {
        return (<a href={`https://www.google.com/search?q=${value}`} target="_blank">
            <span className="ti-search"/> <span>{value}</span>
        </a>);
    }
}
