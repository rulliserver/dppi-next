import { forwardRef, useEffect, useImperativeHandle, useRef, type InputHTMLAttributes } from 'react';

export default forwardRef(function TextInput({ type = 'text', className = '', isFocused = false, ...props }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean }, ref) {
	const localRef = useRef<HTMLInputElement>(null);

	useImperativeHandle(ref, () => ({
		focus: () => localRef.current?.focus()
	}));

	useEffect(() => {
		if (isFocused) {
			localRef.current?.focus();
		}
	}, []);

	return (
		<input
			{...props}
			type={type}
			className={
				'border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md shadow-sm py-2 lg:py-1 bg-white dark:bg-gray-700 dark:text-gray-200 px-2 dark:px-2 dark:border-orange-500' +
				className
			}
			ref={localRef}
		/>
	);
});
