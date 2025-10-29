import { Transition } from '@headlessui/react';
import Link from 'next/link';
import { useState, createContext, useContext, type Dispatch, type SetStateAction, type PropsWithChildren } from 'react';

const DropDownContext = createContext<{
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	toggleOpen: () => void;
}>({
	open: false,
	setOpen: () => {},
	toggleOpen: () => {}
});

const Dropdown = ({ children }: PropsWithChildren) => {
	const [open, setOpen] = useState(false);

	const toggleOpen = () => {
		setOpen((previousState) => !previousState);
	};

	return (
		<DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
			<div className='relative cursor-pointer'>{children}</div>
		</DropDownContext.Provider>
	);
};

const Trigger = ({ children }: PropsWithChildren) => {
	const { open, setOpen, toggleOpen } = useContext(DropDownContext);

	return (
		<>
			<div onClick={toggleOpen}>{children}</div>

			{open && <div className='fixed inset-0 z-40 ' onClick={() => setOpen(false)}></div>}
		</>
	);
};

const Content = ({
	align = 'right',
	width = '52',
	contentClasses = 'py-1 bg-white dark:bg-gray-950',
	children
}: PropsWithChildren<{ align?: 'left' | 'right'; width?: '52'; contentClasses?: string }>) => {
	const { open, setOpen } = useContext(DropDownContext);

	let alignmentClasses = 'origin-top';

	if (align === 'left') {
		alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0 ';
	} else if (align === 'right') {
		alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
	}

	let widthClasses = '';

	if (width === '52') {
		widthClasses = 'w-52';
	}

	return (
		<>
			<Transition
				show={open}
				enter='transition ease-out duration-200'
				enterFrom='opacity-0 scale-95'
				enterTo='opacity-100 scale-100'
				leave='transition ease-in duration-75'
				leaveFrom='opacity-100 scale-100'
				leaveTo='opacity-0 scale-95'>
				<div className={`absolute z-50 rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`} onClick={() => setOpen(false)}>
					<div className={`rounded-md ring-1 ring-blue-500 ring-opacity-5 ` + contentClasses}>{children}</div>
				</div>
			</Transition>
		</>
	);
};

const DropdownLink = ({ className = '', children, ...props }: any) => {
	return (
		<Link
			{...props}
			className={
				'block w-full px-4 py-2 dark:bg-gray-950 text-start text-sm leading-5 text-gray-700 hover:bg-gray-400 dark:hover:text-gray-800 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out' +
				className
			}>
			{children}
		</Link>
	);
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
