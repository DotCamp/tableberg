import { type FC, Fragment, type ReactNode } from 'react';

/**
 * Component to render children based on a condition.
 *
 * Children will be rendered only if the condition is true.
 *
 * @param props                 Component properties.
 * @param props.conditionToTest Condition to test.
 * @param props.children        Children to render.
 * @class
 */
const ConditionalRenderer: FC<{
	conditionToTest: boolean;
	children: ReactNode;
}> = ({ conditionToTest, children }) => {
	return conditionToTest && <Fragment>{children}</Fragment>;
};

export default ConditionalRenderer;
