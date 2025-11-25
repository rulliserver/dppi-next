import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    type ForwardedRef,
    type InputHTMLAttributes,
} from 'react';

type TextInputHandle = { focus: () => void };
type Props = InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean };

export default forwardRef<TextInputHandle, Props>(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref: ForwardedRef<TextInputHandle>
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) localRef.current?.focus();
    }, [isFocused]);

    const { value, defaultValue, ...rest } = props;
    const normalizedValue = value === null ? '' : value;

    const inputProps =
        normalizedValue !== undefined
            ? { ...rest, value: normalizedValue }
            : { ...rest, defaultValue };

    return (
        <input
            {...inputProps}
            type={type}
            className={
                'border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md shadow-sm py-2 lg:py-1 bg-white dark:bg-gray-700 dark:text-gray-200 px-2 dark:px-2 dark:border-orange-500 ' +
                className
            }
            ref={localRef}
        />
    );
});
