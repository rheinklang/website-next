import classNames from 'classnames';
import { FC, useMemo } from 'react';
import { FilterXSS, IFilterXSSOptions } from 'xss';

export interface RichtextProps {
	as?: string;
	content: string;
	className?: string;
	filter?: FilterXSS;
}

const defaultOptions: IFilterXSSOptions = {
	allowCommentTag: false,
	css: false,
	whiteList: {
		h1: [],
		h2: [],
		h3: [],
		h4: [],
		h5: [],
		h6: [],
		p: [],
		div: [],
		strong: [],
		span: [],
		em: [],
		b: [],
		i: [],
		a: [],
		ul: [],
		ol: [],
		dl: [],
		dt: [],
		dd: [],
		q: [],
		blockquote: [],
		br: [],
		li: [],
	},
};

export const richtextXSSFilter = new FilterXSS(defaultOptions);

export const richtextWithIdMarksXSSFilter = new FilterXSS({
	...defaultOptions,
	whiteList: {
		...defaultOptions.whiteList,
		h1: ['id'],
		h2: ['id'],
		h3: ['id'],
		h4: ['id'],
		h5: ['id'],
		h6: ['id'],
		p: ['id'],
		div: ['id'],
	},
});

export const Richtext: FC<RichtextProps> = ({ as = 'div', content, className, filter = richtextXSSFilter }) => {
	const Tag = useMemo((): 'div' => as as 'div', [as]);
	const sanitizedContent = useMemo(() => filter.process(content), [filter, content]);

	return (
		<Tag
			className={classNames('prose lg:prose-lg xl:prose-xl', className)}
			dangerouslySetInnerHTML={{ __html: sanitizedContent.toString() }}
		/>
	);
};

Richtext.displayName = 'Richtext';
