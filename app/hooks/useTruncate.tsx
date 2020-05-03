import { useEffect, useState } from 'react';

const defaultSettings = {
    length: 30,
    ending: '...'
};
export interface TruncateSettings {
    length: number;
    ending?: string;
}

export const useTextTruncate = (
    str: string,
    settings: TruncateSettings = defaultSettings
) => {
    const [text, setText] = useState(str);
    const {
        length = defaultSettings.length,
        ending = defaultSettings.ending
    } = settings;
    useEffect(() => {
        if (text.length > settings.length) {
            setText(text.substring(0, length - ending.length) + ending);
        }
    }, [text]);

    return { text, setText };
};
