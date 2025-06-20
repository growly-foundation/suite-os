import { cn } from '@/lib/utils';
import React from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';
import { Table, TableBody, TableHeader } from './table';

export const PaginatedTable = ({
  header,
  content,
  footer,
  pagination: {
    startIndex,
    totalItems,
    itemsPerPage,
    currentPage,
    prevPage,
    nextPage,
    goToPage,
    totalPages,
  },
  className,
}: {
  header: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  pagination: {
    startIndex: number;
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    prevPage: () => void;
    nextPage: () => void;
    goToPage: (page: number) => void;
    totalPages: number;
  };
  className?: string;
}) => {
  const currentItems = Math.min(startIndex + itemsPerPage, totalItems);
  const showPagination = totalItems > itemsPerPage;
  return (
    <React.Fragment>
      <div>
        <Table className={cn(className, showPagination ? 'border-b' : '')}>
          <TableHeader>{header}</TableHeader>
          <TableBody>
            {content} {footer && footer}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{currentItems}</span> of{' '}
            <span className="font-medium">{totalItems}</span> items
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={prevPage}
                  className={
                    currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={currentPage === pageNum}
                      onClick={() => goToPage(pageNum)}
                      className="cursor-pointer">
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={nextPage}
                  className={
                    currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </React.Fragment>
  );
};
