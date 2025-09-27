import { cn } from '@/lib/utils';
import * as React from 'react';

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto scrollbar-hidden">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm table-fixed', className)}
        style={{
          tableLayout: 'fixed',
          width: '100%',
        }}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    border?: boolean;
  }
>(({ className, border = true, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('[&_tr]:border-b', border ? 'border-b' : '', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    border?: boolean;
  }
>(({ className, border = true, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      border ? 'border-r' : '',
      className
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    border?: boolean;
  }
>(({ className, border = true, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left text-xs align-middle whitespace-nowrap font-medium [&:has([role=checkbox])]:pr-0 relative overflow-hidden text-ellipsis',
      className
    )}
    style={{
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    border?: boolean;
  }
>(({ className, border = true, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-4 py-2 align-middle text-sm whitespace-nowrap [&:has([role=checkbox])]:pr-0 overflow-hidden text-ellipsis',
      className
    )}
    style={{
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
