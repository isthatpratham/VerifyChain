/**
 * ui/index.js
 * Barrel export for all UI primitives.
 * Import from '@/ui' or '../ui' depending on path.
 */

// Core inputs
export { Button }                           from './Button';
export { Input }                            from './Input';
export { Textarea }                         from './Textarea';
export { Select }                           from './Select';
export { Checkbox }                         from './Checkbox';
export { Radio }                            from './Radio';

// Data display
export { Badge }                            from './Badge';
export { Chip }                             from './Chip';
export { Avatar }                           from './Avatar';
export { Table, Thead, Tbody, Tr, Th, Td }  from './Table';
export { Pagination }                       from './Pagination';

// Feedback & overlays
export { Alert }                            from './Alert';
export { Toast }                            from './Toast';
export { Modal }                            from './Modal';
export { Tooltip }                          from './Tooltip';

// Navigation & structure
export { Breadcrumb }                       from './Breadcrumb';
export { Tabs }                             from './Tabs';
export { Accordion, AccordionItem }         from './Accordion';
export { Dropdown, DropdownItem, DropdownSeparator } from './Dropdown';

// Loading & status
export { Skeleton }                         from './Skeleton';
export { Spinner }                          from './Spinner';

// Layout
export { Divider }                          from './Divider';
